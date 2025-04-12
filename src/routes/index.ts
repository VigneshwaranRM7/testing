import { Router } from "express";
import authRoute from "./auth.route";
import productRoute from "./product.route";
import commonRoute from "./common.route";
import collaboratorRoute from "./collaborator.route";
import verifyCollaborator from "../middlewares/verify-collaborator.mw";
import collaboratorStudentsRoute from "./collborator-student.route";
import billingRoute from "./billing.route";

const router = Router();

router.use("/auth", authRoute);
router.use("/products", verifyCollaborator, productRoute);
router.use("/common", commonRoute);
router.use("/collaborator", verifyCollaborator, collaboratorRoute);
router.use("/collaborator-students", verifyCollaborator, collaboratorStudentsRoute);
router.use("/billing", verifyCollaborator, billingRoute);

export default router;
