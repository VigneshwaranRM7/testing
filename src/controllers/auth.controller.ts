import { Request, Response } from "express";
import catchAsync from "../utils/catch-async";
import { HttpStatusCode } from "axios";
import authService from "../services/auth.service";
import responseMessageConstant from "../constants/response.contant";
import httpStatus from "http-status";
import ApiError from "../utils/api-error";
import { errorMessageConstants } from "../constants";

const handleLogInWithGoogle = catchAsync(async (req: Request, res: Response) => {
    const collaboratorResponse = await authService.logInWithGoogle(req.body);
    const collaboratorCookie = await authService.authenticateCollaborator(collaboratorResponse);
    return res.status(HttpStatusCode.Ok).json({
        status: HttpStatusCode.Ok,
        message: responseMessageConstant.users.login,
        data: {
            collaborator: collaboratorResponse,
            access_token: collaboratorCookie.value,
        },
    });
});

const handleRegisterWithPassword = catchAsync(async (req: Request, res: Response) => {
    const collaboratorResponse = await authService.registerCollaboratorWithPassword(req.body);
    const collaboratorCookie = await authService.authenticateCollaborator(collaboratorResponse);
    return res.status(HttpStatusCode.Ok).json({
        status: HttpStatusCode.Ok,
        message: responseMessageConstant.users.register,
        data: {
            collaborator: collaboratorResponse,
            access_token: collaboratorCookie.value,
        },
    });
});

const handleLogInWithPassword = catchAsync(async (req: Request, res: Response) => {
    const collaboratorResponse = await authService.logInWithPassword(req.body);
    const collaboratorCookie = await authService.authenticateCollaborator(collaboratorResponse);
    return res.status(HttpStatusCode.Ok).json({
        status: HttpStatusCode.Ok,
        message: responseMessageConstant.users.login,
        data: {
            collaborator: collaboratorResponse,
            access_token: collaboratorCookie.value,
        },
    });
});

const handleLogOut = catchAsync(async (req: Request, res: Response) => {
    res.status(HttpStatusCode.Ok).json({
        status: HttpStatusCode.Ok,
        message: responseMessageConstant.users.logout,
    });
});

const handleVerifySession = catchAsync(async (req: Request, res: Response) => {
    const accessToken = req.headers.authorization?.split(" ")[1];
    if (!accessToken) {
        throw new ApiError(HttpStatusCode.Unauthorized, errorMessageConstants.users.invalidToken);
    }

    const collaboratorResponse = await authService.verifySession(accessToken);
    res.status(HttpStatusCode.Ok).json({
        status: HttpStatusCode.Ok,
        message: responseMessageConstant.users.verifySession,
        data: {
            collaborator: collaboratorResponse,
        },
    });
});

const handleForgotPassword = catchAsync(async (req: Request, res: Response) => {
    await authService.requestPasswordReset(req.body.email);
    res.status(HttpStatusCode.Ok).json({
        status: HttpStatusCode.Ok,
        message: responseMessageConstant.users.forgotPassword,
    });
});

const handleResetPassword = catchAsync(async (req: Request, res: Response) => {
    await authService.resetPassword(req.query.token as string, req.body.newPassword);
    res.status(HttpStatusCode.Ok).json({
        status: HttpStatusCode.Ok,
        message: "Password reset successfully",
    });
});

/**
 * Handle request OTP for login
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 */
const handleRequestOTP = catchAsync(async (req: Request, res: Response) => {
    const { email } = req.body;
    await authService.requestOTPLogin(email);

    res.status(HttpStatusCode.Ok).json({
        status: httpStatus.OK,
        code: HttpStatusCode.Ok,
        message: responseMessageConstant.users.otp,
    });
});

/**
 * Handle verify OTP and login
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 */
const handleVerifyOTP = catchAsync(async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    const collaborator = await authService.verifyOTPAndLogin(email, otp);
    const cookieResponse = await authService.authenticateCollaborator(collaborator);

    res.status(HttpStatusCode.Ok).json({
        status: HttpStatusCode.Ok,
        message: responseMessageConstant.users.login,
        data: {
            collaborator: collaborator,
            access_token: cookieResponse.value,
        },
    });
});

export default {
    handleLogInWithGoogle,
    handleLogInWithPassword,
    handleRegisterWithPassword,
    handleLogOut,
    handleVerifySession,
    handleForgotPassword,
    handleResetPassword,
    handleRequestOTP,
    handleVerifyOTP,
};
