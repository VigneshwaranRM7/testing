import Joi from "joi";

const skillRequestParamsValidation = Joi.object({
    name: Joi.string().label("Name").allow(""),
    page: Joi.number().label("Page"),
    size: Joi.number().label("Size"),
    sort: Joi.string().label("Sort"),
});

const createTagValidation = Joi.object({
    tag_name: Joi.string().label("Tag Name").required(),
    is_global: Joi.boolean().label("Is Global").required(),
});

const getSocialShareAnalyticsValidation = Joi.object({
    days: Joi.number().label("Days").required(),
});

export default {
    skillRequestParamsValidation,
    createTagValidation,
    getSocialShareAnalyticsValidation,
};
