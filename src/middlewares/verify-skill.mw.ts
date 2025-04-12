import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import ApiError from "../utils/api-error";
import httpStatus from "http-status";
import skillModel from "../models/skill.model";

const verifySkill = async (req: Request, res: Response, next: NextFunction) => {
    const skillRequestParamsValidation = Joi.object({
        name: Joi.string().label("Skill Name").required(),
        // masterSkillCategoryId: Joi.string().label('Master Skill Category Id').required()
    });

    const { error } = skillRequestParamsValidation.validate(req.body);

    if (error) {
        return next(new ApiError(httpStatus.BAD_REQUEST, error.message));
    }

    // Check if skill already exists with case-insensitive and trimmed comparison
    const skill = await skillModel.findOne({
        name: { $regex: new RegExp(`^${req.body.name.trim()}$`, "i") },
    });

    if (skill) {
        return next(new ApiError(httpStatus.BAD_REQUEST, "Skill already exists"));
    }

    next();
};

export default {
    verifySkill,
};
