import httpStatus from "http-status";
import Razorpay from "razorpay";
import crypto from "crypto";
import BillingPlanModel from "../models/billing-plan.model";
import ApiError from "../utils/api-error";
import logger from "../config/logger";
import errorMessageConstants from "../constants/error.constant";
import envConfig from "../config/env";
import { generateUUID } from "../helpers/uuid.helper";
import CollaboratorActivePlanModel from "../models/active-plan.model";
import CollaboratorBillingPlanModel from "../models/billing-plan.model";
import CollaboratorPaymentModel from "../models/collaborator-payment.model";
import testUtil from "../utils/test.util";
import CollaboratorModel from "../models/collaborators.model";

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: envConfig.razorpay.key_id,
    key_secret: envConfig.razorpay.key_secret,
});

const getAllPlans = async () => {
    try {
        const plans = await BillingPlanModel.find({ is_active: true }).select("-__v");
        return plans;
    } catch (error) {
        logger.error("Error in getAllPlans:", error);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, errorMessageConstants.billing.failedToFetchPlans);
    }
};

const getActivePlan = async (collaborator_id: string) => {
    try {
        const activePlan = await CollaboratorActivePlanModel.findOne({
            collaborator_id,
            is_active: true,
        });

        if (!activePlan) {
            return null;
        }

        const planDetails = await CollaboratorBillingPlanModel.findOne({
            plan_id: activePlan.plan_id,
            is_active: true,
        });

        return {
            ...activePlan.toObject(),
            plan_details: planDetails,
        };
    } catch (error) {
        logger.error("Error in getActivePlan:", error);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, errorMessageConstants.billing.failedToFetchActivePlan);
    }
};

const selectPlan = async (collaborator_id: string, plan_id: string) => {
    try {
        const plan = await BillingPlanModel.findOne({ plan_id, is_active: true });
        if (!plan) {
            throw new ApiError(httpStatus.NOT_FOUND, errorMessageConstants.billing.planNotFound);
        }

        // Deactivate any existing active plans
        await CollaboratorActivePlanModel.deleteMany({ collaborator_id });

        const activePlan = await CollaboratorActivePlanModel.create({
            collaborator_id,
            plan_id,
        });

        return {
            ...activePlan.toObject(),
            plan_details: plan,
        };
    } catch (error) {
        logger.error("Error in selectPlan:", error);
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, errorMessageConstants.billing.failedToSelectPlan);
    }
};

const calculatePaymentAmount = async (collaborator_id: string, student_count: number) => {
    try {
        const activePlan = await getActivePlan(collaborator_id);
        if (!activePlan || !activePlan.plan_details) {
            throw new ApiError(httpStatus.BAD_REQUEST, errorMessageConstants.billing.noPlanSelected);
        }

        const amount = activePlan.plan_details.price * student_count;
        return {
            amount,
            currency: activePlan.plan_details.currency,
            plan_details: activePlan.plan_details,
        };
    } catch (error) {
        logger.error("Error in calculatePaymentAmount:", error);
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, errorMessageConstants.billing.failedToCalculateAmount);
    }
};

const createPaymentOrder = async (collaborator_id: string, product_id: string, students_count: number) => {
    try {
        const { amount, currency, plan_details } = await calculatePaymentAmount(collaborator_id, students_count);
        const collaboratorEmail = await CollaboratorModel.findOne({ collaborator_id }).select("email");
        // Create Razorpay order
        const razorpayOrder = await razorpay.orders.create({
            amount: testUtil.isTestUser(collaboratorEmail?.email || "") ? 1 * 100 : amount * 100, // Convert to smallest currency unit (paise)
            currency,
            receipt: `order_${generateUUID()}`,
            notes: {
                collaborator_id,
                product_id,
                plan_id: plan_details.plan_id,
            },
        });

        // Create payment record
        const payment = await CollaboratorPaymentModel.create({
            payment_id: generateUUID(),
            collaborator_id,
            product_id,
            plan_id: plan_details.plan_id,
            amount,
            currency,
            razorpay_order_id: razorpayOrder.id,
            student_count: students_count,
        });

        return {
            order_id: razorpayOrder.id,
            amount,
            currency,
            payment_id: payment.payment_id,
        };
    } catch (error) {
        logger.error("Error in createPaymentOrder:", error);
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, errorMessageConstants.billing.failedToCreateOrder);
    }
};

const verifyPayment = async (payment_id: string, razorpay_details: any) => {
    try {
        // Verify signature
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = razorpay_details;
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto.createHmac("sha256", envConfig.razorpay.key_secret).update(body).digest("hex");

        if (expectedSignature !== razorpay_signature) {
            throw new ApiError(httpStatus.BAD_REQUEST, errorMessageConstants.billing.invalidPaymentSignature);
        }

        // Update payment status
        const payment = await CollaboratorPaymentModel.findOneAndUpdate(
            { payment_id, razorpay_order_id },
            {
                status: "SUCCESS",
                razorpay_payment_id,
                razorpay_signature,
            },
            { new: true }
        );

        if (!payment) {
            throw new ApiError(httpStatus.NOT_FOUND, errorMessageConstants.billing.paymentNotFound);
        }

        return payment;
    } catch (error) {
        logger.error("Error in verifyPayment:", error);
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, errorMessageConstants.billing.failedToVerifyPayment);
    }
};

export default {
    getAllPlans,
    getActivePlan,
    selectPlan,
    calculatePaymentAmount,
    createPaymentOrder,
    verifyPayment,
};
