import { CookieOptions } from "express";
import { collaboratorCookie, recruiterCookie } from "../constants/cookie.constant";
import tokenService, { TokenType } from "./token.service";
import { HttpStatusCode } from "axios";
import ApiError from "../utils/api-error";
import bcrypt from "bcryptjs";
import { generateUUID } from "../helpers/uuid.helper";
import emailConstant from "../constants/email.constant";
import { sesClient } from "../config/aws.config";
import logger from "../config/logger";
import { errorMessageConstants } from "../constants";
import { SendEmailCommand } from "@aws-sdk/client-ses";
import httpStatus from "http-status";
import CollaboratorModel from "../models/collaborators.model";
import CollaboratorOtpTokenModel from "../models/collaborator-otp-tokens.model";
import envConfig from "../config/env";
import emailTemplateModel from "../models/email-template.model";
import ejs from "ejs";
interface CookieResponse {
    name: string;
    value: string;
    options: CookieOptions;
}

/**
 * Log in with Google
 * @param {any} collaborator - The collaborator object
 * @returns {Promise<any>}
 */
const logInWithGoogle = async (collaborator: any) => {
    const existingCollaborator = await CollaboratorModel.findOne({ email: collaborator.email });

    if (!existingCollaborator) {
        const newCollaborator = await CollaboratorModel.create({
            ...collaborator,
            collaborator_id: generateUUID(),
            is_active: true,
            profile_picture_url: collaborator.profile_picture_url,
        });
        return newCollaborator;
    }

    if (!existingCollaborator.is_active) {
        throw new ApiError(HttpStatusCode.Forbidden, errorMessageConstants.users.accountDeactivated);
    }

    return existingCollaborator.toJSON();
};

/**
 * Generate auth tokens and cookie
 * @param {any} collaborator - The collaborator object
 * @returns {Promise<CookieResponse>}
 */
const authenticateCollaborator = async (collaborator: any): Promise<CookieResponse> => {
    if (!collaborator.collaborator_id) {
        throw new ApiError(httpStatus.BAD_REQUEST, errorMessageConstants.users.invalidCollaboratorData);
    }

    const tokens = await tokenService.signToken(collaborator);
    logger.info(`Generated tokens for collaborator ${collaborator.collaborator_id}`);

    return {
        name: collaboratorCookie.signatureCookieName,
        value: tokens.accessToken,
        options: {
            ...(collaboratorCookie.cookie as CookieOptions),
        },
    };
};

/**
 * Extract token from cookie string
 * @param {string} cookie - The cookie string
 * @returns {string} - The token
 */
const extractTokenFromCookie = (cookie: string): string => {
    if (!cookie) {
        throw new ApiError(HttpStatusCode.Unauthorized, errorMessageConstants.users.invalidToken);
    }

    const cookieParts = cookie.split(";").map((part) => part.trim());
    const tokenCookie = cookieParts.find((part) => part.startsWith(`${recruiterCookie.signatureCookieName}=`));

    if (!tokenCookie) {
        throw new ApiError(HttpStatusCode.Unauthorized, errorMessageConstants.users.invalidToken);
    }

    const token = tokenCookie.split("=")[1]?.trim();
    if (!token) {
        throw new ApiError(HttpStatusCode.Unauthorized, errorMessageConstants.users.invalidToken);
    }

    return token;
};

/**
 * Verify session
 * @param {string} cookie - The cookie string
 * @returns {Promise<any>}
 */
const verifySession = async (accessToken: string) => {
    try {
        const decodedToken = await tokenService.verifyToken(accessToken);
        logger.info(`Token verified for collaborator ${decodedToken.collaborator_id}`);

        const collaborator = await CollaboratorModel.findOne({ collaborator_id: decodedToken.collaborator_id });
        if (!collaborator) {
            logger.error(`Collaborator not found: ${decodedToken.collaborator_id}`);
            throw new ApiError(HttpStatusCode.NotFound, errorMessageConstants.users.collaboratorNotFound);
        }

        if (!collaborator.is_active) {
            logger.error(`Collaborator account deactivated: ${decodedToken.collaborator_id}`);
            throw new ApiError(HttpStatusCode.Forbidden, errorMessageConstants.users.accountDeactivated);
        }

        return collaborator;
    } catch (error) {
        logger.error("Error in verifySession:", error);
        if (error instanceof ApiError) throw error;
        throw new ApiError(HttpStatusCode.Unauthorized, errorMessageConstants.users.invalidToken);
    }
};

/**
 * Register recruiter with password
 * @param {any} recruiter - The recruiter object
 * @returns {Promise<any>}
 */
const registerCollaboratorWithPassword = async (collaborator: any) => {
    const existingCollaborator = await CollaboratorModel.findOne({ email: collaborator.email });

    if (existingCollaborator) {
        throw new ApiError(HttpStatusCode.BadRequest, errorMessageConstants.users.collaboratorEmailAlreadyExists);
    }

    const hashedPassword = await bcrypt.hash(collaborator.password, 10);
    const newCollaborator = await CollaboratorModel.create({
        ...collaborator,
        password: hashedPassword,
        collaborator_id: generateUUID(),
        is_active: true,
    });

    return newCollaborator;
};

/**
 * Verify collaborator password
 * @param {any} collaborator - The collaborator object
 * @returns {Promise<boolean>}
 */
const verifyCollaboratorPassword = async (collaborator: any): Promise<boolean> => {
    const existingCollaborator = await CollaboratorModel.findOne({ email: collaborator.email });
    if (!existingCollaborator) {
        throw new ApiError(HttpStatusCode.BadRequest, errorMessageConstants.users.collaboratorNotFound);
    }

    if (!existingCollaborator.password) {
        throw new ApiError(
            HttpStatusCode.BadRequest,
            errorMessageConstants.users.collaboratorPasswordNotAssociatedWithGoogle
        );
    }

    try {
        logger.info(`Verifying password for collaborator: ${collaborator.email}`);
        logger.info(`Collaborator password: ${collaborator.password}`);
        logger.info(`Existing collaborator password: ${bcrypt.hashSync(existingCollaborator.password, 10)}`);
        const isPasswordMatch = await bcrypt.compare(collaborator.password, existingCollaborator.password);
        logger.info(`Password verification result for ${collaborator.email}: ${isPasswordMatch}`);
        return isPasswordMatch;
    } catch (error) {
        logger.error(`Error verifying password for ${collaborator.email}:`, error);
        throw new ApiError(HttpStatusCode.InternalServerError, "Password verfication failed");
    }
};

/**
 * Log in with password
 * @param {any} recruiter - The recruiter object
 * @returns {Promise<any>}
 */
const logInWithPassword = async (collaborator: any) => {
    const existingCollaborator = await CollaboratorModel.findOne({ email: collaborator.email });
    if (!existingCollaborator) {
        throw new ApiError(HttpStatusCode.BadRequest, errorMessageConstants.users.collaboratorNotFound);
    }

    if (!existingCollaborator.is_active) {
        throw new ApiError(HttpStatusCode.Forbidden, errorMessageConstants.users.accountDeactivated);
    }

    const isPasswordMatch = await verifyCollaboratorPassword(collaborator);
    if (!isPasswordMatch) {
        throw new ApiError(HttpStatusCode.BadRequest, errorMessageConstants.users.invalidCollaboratorPassword);
    }

    return existingCollaborator;
};

/**
 * Request password reset
 * @param {string} email - The recruiter's email
 * @returns {Promise<void>}
 */
const requestPasswordReset = async (email: string): Promise<void> => {
    const collaborator = await CollaboratorModel.findOne({ email });
    if (!collaborator) {
        throw new ApiError(HttpStatusCode.BadRequest, errorMessageConstants.users.collaboratorNotFound);
    }

    if (!collaborator.password) {
        throw new ApiError(
            HttpStatusCode.BadRequest,
            errorMessageConstants.users.collaboratorPasswordNotAssociatedWithGoogle
        );
    }

    const resetToken = await tokenService.generatePasswordResetToken(collaborator.collaborator_id);
    const resetUrl = `${envConfig.ui.base_url}/new-password?token=${resetToken}`;

    await handleSendEmail({
        toAddresses: [email],
        subject: emailConstant.email.subject.passwordReset,
        htmlData: `<p>Click <a href="${resetUrl}">this link</a> to reset your password</p>`,
        source: emailConstant.email.source.noreplyMail,
    });
};

/**
 * Reset password
 * @param {string} token - The reset token
 * @param {string} newPassword - The new password
 * @returns {Promise<void>}
 */
const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    const decoded = await tokenService.verifyResetPasswordToken(token);
    if (decoded.type !== TokenType.RESET_PASSWORD) {
        throw new ApiError(HttpStatusCode.BadRequest, errorMessageConstants.users.invalidPasswordResetToken);
    }

    const collaborator = await CollaboratorModel.findOne({ collaborator_id: decoded.collaborator_id });
    if (!collaborator) {
        throw new ApiError(HttpStatusCode.NotFound, errorMessageConstants.users.collaboratorNotFound);
    }

    if (!collaborator.is_active) {
        throw new ApiError(HttpStatusCode.Forbidden, errorMessageConstants.users.accountDeactivated);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await CollaboratorModel.updateOne({ collaborator_id: decoded.collaborator_id }, { password: hashedPassword });
};

/**
 * Generate OTP
 * @returns {string} - 6 digit OTP
 */
const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Request OTP login
 * @param {string} email - The recruiter's email
 * @returns {Promise<void>}
 */
const requestOTPLogin = async (email: string): Promise<void> => {
    const collaborator = await CollaboratorModel.findOne({ email });
    if (!collaborator) {
        throw new ApiError(HttpStatusCode.BadRequest, errorMessageConstants.users.collaboratorNotFound);
    }

    if (!collaborator.is_active) {
        throw new ApiError(HttpStatusCode.Forbidden, errorMessageConstants.users.accountDeactivated);
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Save OTP
    await CollaboratorOtpTokenModel.create({
        otp_token_id: generateUUID(),
        collaborator_id: collaborator.collaborator_id,
        email: collaborator.email,
        otp,
        expires_at: expiresAt,
    });

    const otpTemplate = await emailTemplateModel.findOne({ name: emailConstant.emailTemplate.otpTemplate });
    const renderedEmailTemplateResponse = ejs.render(otpTemplate?.htmlContent || "", {
        otp,
        name: collaborator?.name,
    });

    // Send OTP email
    await handleSendEmail({
        toAddresses: [email],
        subject: emailConstant.email.subject.loginOTP,
        htmlData: renderedEmailTemplateResponse,
        source: emailConstant.email.source.noreplyMail,
    });

    logger.info(`OTP sent to collaborator: ${collaborator.email}`);
};

/**
 * Verify OTP and login
 * @param {string} email - The recruiter's email
 * @param {string} otp - The OTP to verify
 * @returns {Promise<any>}
 */
const verifyOTPAndLogin = async (email: string, otp: string) => {
    const collaborator = await CollaboratorModel.findOne({ email });
    if (!collaborator) {
        throw new ApiError(HttpStatusCode.BadRequest, errorMessageConstants.users.collaboratorNotFound);
    }

    if (!collaborator.is_active) {
        throw new ApiError(HttpStatusCode.Forbidden, errorMessageConstants.users.accountDeactivated);
    }

    // Find valid OTP
    const otpToken = await CollaboratorOtpTokenModel.findOne({
        email,
        otp,
        is_used: false,
        expires_at: { $gt: new Date() },
    });

    if (!otpToken) {
        throw new ApiError(HttpStatusCode.BadRequest, errorMessageConstants.users.invalidOTP);
    }

    // Mark OTP as used
    otpToken.is_used = true;
    await otpToken.save();

    logger.info(`OTP verified for collaborator: ${email}`);
    return collaborator;
};

const handleSendEmail = async (payload: any) => {
    const { toAddresses = [], subject = "", htmlData = "", ccEmails = [], source = "" } = payload;
    const emailPayload = {
        Destination: {
            CcAddresses: ccEmails,
            ToAddresses: toAddresses,
        },
        Message: {
            Body: {
                Html: {
                    Charset: emailConstant.email.charSet,
                    Data: htmlData,
                },
            },
            Subject: {
                Charset: emailConstant.email.charSet,
                Data: subject,
            },
        },
        Source: source,
    };

    return sesClient
        .send(new SendEmailCommand(emailPayload))
        .then(() => {
            return true;
        })
        .catch((err: any) => {
            console.log(err.message);
            return false;
        });
};

export default {
    logInWithGoogle,
    logInWithPassword,
    registerCollaboratorWithPassword,
    authenticateCollaborator,
    verifySession,
    requestPasswordReset,
    resetPassword,
    requestOTPLogin,
    verifyOTPAndLogin,
    handleSendEmail,
};
