import { Request, Response } from "express";
import catchAsync from "../utils/catch-async";
import httpStatus from "http-status";
import billingService from "../services/billing.service";
import { responseConstants } from "../constants";

const handleGetAllPlans = catchAsync(async (req: Request, res: Response) => {
    const plans = await billingService.getAllPlans();
    res.status(httpStatus.OK).json({
        success: true,
        message: responseConstants.billing.getAllPlans,
        data: plans,
    });
});

const handleGetActivePlan = catchAsync(async (req: any, res: Response) => {
    const collaborator = req.collaborator;
    const activePlan = await billingService.getActivePlan(collaborator?.collaborator_id);
    res.status(httpStatus.OK).json({
        success: true,
        message: responseConstants.billing.getActivePlan,
        data: activePlan,
    });
});

const handleSelectPlan = catchAsync(async (req: any, res: Response) => {
    const collaborator = req.collaborator;
    const { plan_id } = req.body;
    const activePlan = await billingService.selectPlan(collaborator?.collaborator_id, plan_id);
    res.status(httpStatus.OK).json({
        success: true,
        message: responseConstants.billing.selectPlan,
        data: activePlan,
    });
});

const handleCalculatePaymentAmount = catchAsync(async (req: any, res: Response) => {
    const collaborator = req.collaborator;
    const { student_count } = req.body;
    const paymentAmount = await billingService.calculatePaymentAmount(collaborator?.collaborator_id, student_count);
    res.status(httpStatus.OK).json({
        success: true,
        message: responseConstants.billing.calculatePaymentAmount,
        data: paymentAmount,
    });
});

const handleCreatePaymentOrder = catchAsync(async (req: any, res: Response) => {
    const collaborator = req.collaborator;
    const { product_id, students } = req.body;
    const order = await billingService.createPaymentOrder(collaborator?.collaborator_id, product_id, students);
    res.status(httpStatus.OK).json({
        success: true,
        message: responseConstants.billing.createPaymentOrder,
        data: order,
    });
});

const handleVerifyPayment = catchAsync(async (req: Request, res: Response) => {
    const { payment_id, razorpay_details } = req.body;
    const payment = await billingService.verifyPayment(payment_id, razorpay_details);
    res.status(httpStatus.OK).json({
        success: true,
        message: responseConstants.billing.verifyPayment,
        data: payment,
    });
});

export default {
    handleGetAllPlans,
    handleGetActivePlan,
    handleSelectPlan,
    handleCalculatePaymentAmount,
    handleCreatePaymentOrder,
    handleVerifyPayment,
};
