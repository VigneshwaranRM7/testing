import { Router } from "express";
import commonController from "../controllers/common.controller";
import verifyCollaborator from "../middlewares/verify-collaborator.mw";
import validate from "../middlewares/validate.mw";
import commonValidation from "../validations/common.validation";
import verifySkillMw from "../middlewares/verify-skill.mw";
const router = Router();

router.get("/skills", commonController.handleGetAllSkills);
router.post("/skills", verifySkillMw.verifySkill, commonController.handleAddSkill);
router.get("/analytics", verifyCollaborator, commonController.handleGetOverAllnalytics);
router.get("/tags", verifyCollaborator, commonController.handleGetAllTags);
router.post("/tags", verifyCollaborator, validate(commonValidation.createTagValidation), commonController.handleCreateTag);
router.get(
    "/social-share-analytics",
    verifyCollaborator,
    validate(commonValidation.getSocialShareAnalyticsValidation),
    commonController.handleGetSocialShareAnalytics
);

export default router;
