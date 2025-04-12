// Importing packages
import { HttpStatusCode } from "axios";
import { Response, NextFunction } from "express";
import catchAsync from "../utils/catch-async";
import authService from "../services/auth.service";
import ApiError from "../utils/api-error";
import responseMessageConstant from "../constants/response.contant";
import logger from "../config/logger";

const verifyCollaborator = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const accessToken = req.headers.authorization.split(" ")[1];
    logger.info(`Access token: ${accessToken}`);
    const collaboratorResponse = await authService.verifySession(accessToken);

    if (!collaboratorResponse) {
        throw new ApiError(HttpStatusCode.Unauthorized, responseMessageConstant.users.login);
    }

    logger.info(`Collaborator verified: ${collaboratorResponse.collaborator_id}`);

    req.collaborator = collaboratorResponse;
    next();
});

export default verifyCollaborator;
