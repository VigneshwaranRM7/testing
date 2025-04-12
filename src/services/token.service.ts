import jwt from "jsonwebtoken";
import { generateUUID } from "../helpers/uuid.helper";
import ApiError from "../utils/api-error";
import { HttpStatusCode } from "axios";
import logger from "../config/logger";
import CollaboratorSessionTokenModel from "../models/collaborator_session_tokens";
import envConfig from "../config/env";

export enum TokenType {
    ACCESS = "access",
    REFRESH = "refresh",
    RESET_PASSWORD = "reset_password",
}

interface TokenPayload {
    collaborator_id: string;
    type: TokenType;
    [key: string]: any;
}

const JWT_SECRET = envConfig.jwt.secret || "";

const generateToken = (payload: jwt.JwtPayload, expiresIn: string): string => {
    if (!JWT_SECRET) {
        throw new ApiError(HttpStatusCode.InternalServerError, "JWT key not configured");
    }
    // @ts-ignore
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

/**
 * Sign token
 * @param {any} payload - The payload to sign
 * @returns {Promise<{ accessToken: string; refreshToken: string }>}
 */
const signToken = async (payload: any): Promise<{ accessToken: string; refreshToken: string }> => {
    try {
        if (!payload.collaborator_id) {
            throw new ApiError(HttpStatusCode.BadRequest, "Invalid payload for token generation");
        }

        const accessTokenPayload: TokenPayload = {
            collaborator_id: payload.collaborator_id,
            type: TokenType.ACCESS,
        };

        const refreshTokenPayload: TokenPayload = {
            collaborator_id: payload.collaborator_id,
            type: TokenType.REFRESH,
        };

        const accessToken = generateToken(accessTokenPayload, "24h");
        const refreshToken = generateToken(refreshTokenPayload, "7d");

        // Calculate expiry dates
        const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        // Remove any existing sessions for this recruiter
        await CollaboratorSessionTokenModel.deleteMany({ collaborator_id: payload.collaborator_id });

        // Create new session
        const session = await CollaboratorSessionTokenModel.create({
            collaborator_session_token_id: generateUUID(),
            collaborator_id: payload.collaborator_id,
            token: accessToken,
            refresh_token: refreshToken,
            expires_at: refreshTokenExpiry,
        });

        logger.info(`Created new session for collaborator ${payload.collaborator_id}`);
        return { accessToken, refreshToken };
    } catch (err) {
        logger.error("Error in signToken:", err);
        if (err instanceof ApiError) throw err;
        throw new ApiError(HttpStatusCode.InternalServerError, "Failed to sign token");
    }
};

/**
 * Verify token
 * @param {string} token - The token to verify
 * @returns {Promise<TokenPayload>}
 */
const verifyToken = async (token: string): Promise<TokenPayload> => {
    try {
        if (!JWT_SECRET) {
            throw new ApiError(HttpStatusCode.InternalServerError, "JWT key not configured");
        }

        // First verify the token format and expiry
        const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

        if (!decoded || typeof decoded !== "object") {
            throw new ApiError(HttpStatusCode.Unauthorized, "Invalid token format");
        }

        if (!decoded.collaborator_id || !decoded.type) {
            throw new ApiError(HttpStatusCode.Unauthorized, "Invalid token payload");
        }

        // Then verify if the session exists and is valid
        const session = await CollaboratorSessionTokenModel.findOne({
            collaborator_id: decoded.collaborator_id,
            $or: [{ token }, { refresh_token: token }],
            expires_at: { $gt: new Date() },
        });

        if (!session) {
            logger.error(`No valid session found for collaborator ${decoded.collaborator_id}`);
            throw new ApiError(HttpStatusCode.Unauthorized, "Invalid or expired session");
        }

        logger.info(`Token verified for collaborator ${decoded.collaborator_id}`);
        return decoded;
    } catch (err) {
        logger.error("Error in verifyToken:", err);
        if (err instanceof jwt.TokenExpiredError) {
            throw new ApiError(HttpStatusCode.Unauthorized, "Token has expired");
        }
        if (err instanceof jwt.JsonWebTokenError) {
            throw new ApiError(HttpStatusCode.Unauthorized, "Invalid token");
        }
        if (err instanceof ApiError) throw err;
        throw new ApiError(HttpStatusCode.Unauthorized, "Invalid or expired token");
    }
};

/**
 * Generate password reset token
 * @param {string} collaborator_id - The collaborator ID
 * @returns {Promise<string>}
 */
const generatePasswordResetToken = async (collaborator_id: string): Promise<string> => {
    const payload: TokenPayload = {
        collaborator_id,
        type: TokenType.RESET_PASSWORD,
    };

    return generateToken(payload, "1h");
};

/**
 * Refresh access token using refresh token
 * @param {string} refreshToken - The refresh token
 * @returns {Promise<string>}
 */
const refreshAccessToken = async (refreshToken: string): Promise<string> => {
    try {
        const decoded = await verifyToken(refreshToken);
        if (decoded.type !== TokenType.REFRESH) {
            throw new ApiError(HttpStatusCode.Unauthorized, "Invalid refresh token");
        }

        const session = await CollaboratorSessionTokenModel.findOne({
            collaborator_id: decoded.collaborator_id,
            refresh_token: refreshToken,
            expires_at: { $gt: new Date() },
        });

        if (!session) {
            throw new ApiError(HttpStatusCode.Unauthorized, "Invalid session");
        }

        const accessTokenPayload: TokenPayload = {
            collaborator_id: decoded.collaborator_id,
            type: TokenType.ACCESS,
        };

        const newAccessToken = generateToken(accessTokenPayload, "24h");

        await CollaboratorSessionTokenModel.updateOne({ _id: session._id }, { token: newAccessToken });

        return newAccessToken;
    } catch (err) {
        logger.error("Error in refreshAccessToken:", err);
        if (err instanceof ApiError) throw err;
        throw new ApiError(HttpStatusCode.InternalServerError, "Failed to refresh token");
    }
};

/**
 * Verify reset password token
 * @param {string} token - The token to verify
 * @returns {Promise<TokenPayload>}
 */
const verifyResetPasswordToken = async (token: string): Promise<TokenPayload> => {
    try {
        if (!JWT_SECRET) {
            throw new ApiError(HttpStatusCode.InternalServerError, "JWT key not configured");
        }

        // Verify the token format and expiry
        const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
        logger.info(`decoded ${JSON.stringify(decoded)}`);

        if (!decoded || typeof decoded !== "object") {
            throw new ApiError(HttpStatusCode.Unauthorized, "Invalid token format");
        }

        if (!decoded.collaborator_id || !decoded.type || decoded.type !== TokenType.RESET_PASSWORD) {
            throw new ApiError(HttpStatusCode.Unauthorized, "Invalid token payload");
        }

        logger.info(`Reset password token verified for collaborator ${decoded.collaborator_id}`);
        return decoded;
    } catch (err) {
        logger.error("Error in verifyResetPasswordToken:", err);
        if (err instanceof jwt.TokenExpiredError) {
            throw new ApiError(HttpStatusCode.Unauthorized, "Token has expired");
        }
        if (err instanceof jwt.JsonWebTokenError) {
            throw new ApiError(HttpStatusCode.Unauthorized, "Invalid token");
        }
        if (err instanceof ApiError) throw err;
        throw new ApiError(HttpStatusCode.Unauthorized, "Invalid or expired token");
    }
};

export default {
    signToken,
    verifyToken,
    generatePasswordResetToken,
    refreshAccessToken,
    verifyResetPasswordToken,
};
