import Joi from "joi";

const selectPlanSchema = {
    body: Joi.object().keys({
        plan_id: Joi.string().required(),
    }),
};

const calculatePaymentAmountSchema = {
    body: Joi.object().keys({
        student_count: Joi.number().required().min(1),
    }),
};

const createPaymentOrderSchema = {
    body: Joi.object().keys({
        product_id: Joi.string().required(),
        students: Joi.array()
            .items(
                Joi.object().keys({
                    email: Joi.string().email().required(),
                    name: Joi.string().required(),
                })
            )
            .min(1)
            .required(),
    }),
};

const verifyPaymentSchema = {
    body: Joi.object().keys({
        payment_id: Joi.string().required(),
        razorpay_payment_id: Joi.string().required(),
        razorpay_order_id: Joi.string().required(),
        razorpay_signature: Joi.string().required(),
    }),
};

export default {
    selectPlanSchema,
    calculatePaymentAmountSchema,
    createPaymentOrderSchema,
    verifyPaymentSchema,
};
