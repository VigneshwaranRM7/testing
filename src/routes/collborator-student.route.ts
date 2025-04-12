import { Router } from "express";
import collaboratorStudentsController from "../controllers/collaborator-students.controller";

const router = Router();

router.get("/", collaboratorStudentsController.handleGetAllStudent);
router.get("/analytics", collaboratorStudentsController.handleGetStudentsAnalytics);

export default router;
