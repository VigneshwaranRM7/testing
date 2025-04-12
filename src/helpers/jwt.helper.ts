// Importing packages
import jwt, { JwtPayload } from "jsonwebtoken";

// Importing helpers
import { generateUUID } from "./uuid.helper";

// Importing models
import studentSessionTokenModel from "../models/student-session-token.model";
import envConfig from "../config/env";

/**
 * @createdBy Vignesh
 * @createdAt 2024-05-19
 * @description This function is used to sign JWT token
 */
const signToken = async (payload: any): Promise<any> => {
    try {
        const generatedToken = jwt.sign(payload, process.env.JWT_KEY || "");
        const token = await studentSessionTokenModel.create({
            studentSessionTokenId: generateUUID(),
            token: generatedToken,
        });
        return token.studentSessionTokenId;
    } catch (err) {
        return err;
    }
};

/**
 * @createdBy Vignesh
 * @createdAt 2024-05-19
 * @description This function is used to verify JWT token
 */
const verifyToken = async (studentSessionTokenId: string): Promise<string | JwtPayload | null> => {
    try {
        let token: any = null;
        const tokenResponse = await studentSessionTokenModel.findOne({ studentSessionTokenId });
        if (tokenResponse) {
            token = tokenResponse.token;
        }
        return jwt.verify(token, envConfig.jwt.secret || "");
    } catch (err) {
        return null;
    }
};

export { signToken, verifyToken };
