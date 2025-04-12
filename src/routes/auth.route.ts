import { Router } from "express";
import authController from "../controllers/auth.controller";
import validate from "../middlewares/validate.mw";
import authValidation from "../validations/auth.validation";
import verifyCollaborator from "../middlewares/verify-collaborator.mw";

const router = Router();

router.post("/google-sso", validate(authValidation.loginWithGoogleSchema), authController.handleLogInWithGoogle);
router.post("/register", validate(authValidation.signUpSchema), authController.handleRegisterWithPassword);
router.post("/login", validate(authValidation.logInWithPasswordSchema), authController.handleLogInWithPassword);
router.get("/verify-session", verifyCollaborator, authController.handleVerifySession);
router.post("/logout", verifyCollaborator, authController.handleLogOut);
router.post("/forgot-password", validate(authValidation.forgotPasswordSchema), authController.handleForgotPassword);
router.post("/reset-password", validate(authValidation.resetPasswordSchema), authController.handleResetPassword);
router.post("/request-otp", validate(authValidation.requestOTPSchema), authController.handleRequestOTP);
router.post("/verify-otp", validate(authValidation.verifyOTPSchema), authController.handleVerifyOTP);

export default router;
