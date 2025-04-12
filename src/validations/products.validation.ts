import Joi from "joi";

const createProductSchema = {
    body: Joi.object().keys({
        product_thumbnail: Joi.any().required(),
        product_title: Joi.string().required(),
        product_tags: Joi.string().required(),
        product_description: Joi.string().required(),
        product_type: Joi.string().valid("ONLINE", "OFFLINE").required(),
        product_price: Joi.number().required(),
        product_currency: Joi.string().valid("USD", "INR").required(),
        product_duration: Joi.number().required(),
        product_quantity: Joi.number().required(),
        product_link: Joi.string().required(),
        trigger_assessment: Joi.boolean().required(),
        product_brochure_or_details: Joi.any().required(),
        skill_badges: Joi.string().required(),
    }),
};

const updateProductSchema = {
    params: Joi.object().keys({
        productId: Joi.string().required(),
    }),
    body: Joi.object()
        .keys({
            product_thumbnail: Joi.any(),
            product_title: Joi.string(),
            product_tags: Joi.string(),
            product_description: Joi.string(),
            product_type: Joi.string().valid("ONLINE", "OFFLINE"),
            product_price: Joi.number(),
            product_currency: Joi.string().valid("USD", "INR"),
            product_duration: Joi.number(),
            product_quantity: Joi.number(),
            product_link: Joi.string(),
            trigger_assessment: Joi.boolean(),
            product_brochure_or_details: Joi.any(),
            skill_badges: Joi.string(),
        })
        .min(1), // Ensure at least one field is provided for update
};

const deleteProductSchema = {
    params: Joi.object().keys({
        productId: Joi.string().required(),
    }),
};

const assignProductSchema = {
    body: Joi.object().keys({
        tags: Joi.string().required().messages({
            "string.empty": "Tags cannot be empty",
            "any.required": "Tags are required",
        }),
        product_id: Joi.string().required().messages({
            "string.empty": "Product ID cannot be empty",
            "any.required": "Product ID is required",
        }),
    }),
};

const completeProductAssignmentSchema = {
    body: Joi.object().keys({
        payment_id: Joi.string().required(),
        razorpay_details: Joi.object().required(),
        product_id: Joi.string().required(),
    }),
};
export default {
    createProductSchema,
    updateProductSchema,
    deleteProductSchema,
    assignProductSchema,
    completeProductAssignmentSchema,
};
