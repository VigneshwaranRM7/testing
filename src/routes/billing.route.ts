import billingController from "../controllers/billing.controller";
import validate from "../middlewares/validate.mw";
import { Router } from "express";
import billingValidation from "../validations/billing.validation";

const router = Router();

router.get("/plans", billingController.handleGetAllPlans);
router.get("/active-plan", billingController.handleGetActivePlan);
router.post("/select-plan", billingController.handleSelectPlan);
router.post("/calculate-amount", billingController.handleCalculatePaymentAmount);
router.post(
    "/create-order",
    validate(billingValidation.createPaymentOrderSchema),
    billingController.handleCreatePaymentOrder
);
router.post("/verify-payment", validate(billingValidation.verifyPaymentSchema), billingController.handleVerifyPayment);

export default router;
