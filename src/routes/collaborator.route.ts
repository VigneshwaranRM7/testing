import { Router } from "express";
import multerUtil from "../utils/multer.util";
import collaboratorController from "../controllers/collaborator.controller";
import validate from "../middlewares/validate.mw";
import authValidation from "../validations/auth.validation";

const router = Router();

router.get("/", collaboratorController.handleGetProfile);
router.put(
    "/",
    multerUtil.combinedUpload.fields([{ name: "profile_picture", maxCount: 1 }]),
    collaboratorController.handleUpdateProfile
);
router.put("/password", validate(authValidation.updatePasswordSchema), collaboratorController.handleUpdatePassword);
router.delete("/", collaboratorController.handleDeleteProfile);

export default router;
