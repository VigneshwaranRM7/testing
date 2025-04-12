import { Request, Response } from "express";
import masterSkillCategoryModel from "../models/master-skill-category.model";
import catchAsync from "../utils/catch-async";
import skillModel from "../models/skill.model";
import httpStatus from "http-status";
import analyticsService from "../services/analytics.service";
import CollaboratorProductTagsModel from "../models/collaborator-product-tags.model";
import { generateUUID } from "../helpers/uuid.helper";

/**
 * @createdBy Vignesh
 * @createdAt 2024-07-22
 * @description This function is used to get skill
 */
const handleGetAllSkills = catchAsync(async (req: Request, res: Response) => {
    try {
        const { name = "", page = 1, size = 15, sort = "asc" }: any = req.query;

        const pageSize = Number(size);
        const pageNumber = Number(page);

        const skillResponse = await masterSkillCategoryModel.aggregate([
            {
                $lookup: {
                    from: "sub_skill_categories",
                    localField: "masterSkillCategoryId",
                    foreignField: "masterSkillCategoryId",
                    as: "subSkills",
                },
            },
            {
                $unwind: {
                    path: "$subSkills",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "skills",
                    let: { subSkillCategoryId: "$subSkills.subSkillCategoryId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$subSkillCategoryId", "$$subSkillCategoryId"] },
                                name: { $regex: new RegExp(name), $options: "i" },
                                isActive: true,
                            },
                        },
                        {
                            $group: {
                                _id: "$name",
                                skillId: { $first: "$skillId" },
                                subSkillCategoryId: { $first: "$subSkillCategoryId" },
                                name: { $first: "$name" },
                            },
                        },
                        {
                            $project: {
                                _id: 0,
                                skillId: 1,
                                subSkillCategoryId: 1,
                                name: 1,
                            },
                        },
                    ],
                    as: "subSkills.skills",
                },
            },
            {
                $unwind: {
                    path: "$subSkills.skills",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $group: {
                    _id: {
                        masterSkillCategoryId: "$masterSkillCategoryId",
                        name: "$name",
                        skillName: "$subSkills.skills.name",
                    },
                    skillDetails: {
                        $first: "$subSkills.skills",
                    },
                },
            },
            {
                $group: {
                    _id: {
                        masterSkillCategoryId: "$_id.masterSkillCategoryId",
                        name: "$_id.name",
                    },
                    skills: {
                        $push: "$skillDetails",
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    masterSkillCategoryId: "$_id.masterSkillCategoryId",
                    name: "$_id.name",
                    skills: {
                        $filter: {
                            input: "$skills",
                            as: "skill",
                            cond: { $ne: ["$$skill", null] },
                        },
                    },
                },
            },
            {
                $match: {
                    skills: { $ne: [] },
                },
            },
            {
                $sort: {
                    name: sort === "asc" ? 1 : -1,
                },
            },
            {
                $skip: (pageNumber - 1) * pageSize,
            },
            {
                $limit: pageSize,
            },
        ]);

        const skillCount = await skillModel.countDocuments({
            isActive: true,
        });

        res.status(httpStatus.OK).json({
            status: httpStatus.OK,
            code: httpStatus.OK,
            data: {
                content: skillResponse,
                paging: {
                    page: pageNumber,
                    size: pageSize,
                    totalRecords: skillCount,
                },
            },
        });
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            status: httpStatus.INTERNAL_SERVER_ERROR,
            code: httpStatus.INTERNAL_SERVER_ERROR,
        });
    }
});

const handleGetOverAllnalytics = catchAsync(async (req: any, res: Response) => {
    const collaborator_id = req.collaborator.collaborator_id;
    const analytics = await analyticsService.getOverAllAnalytice(collaborator_id);
    res.status(httpStatus.OK).json({
        status: httpStatus.OK,
        data: analytics,
    });
});

const handleGetAllTags = catchAsync(async (req: any, res: Response) => {
    const collaborator_id = req.collaborator.collaborator_id;
    const tags = await CollaboratorProductTagsModel.find({
        is_active: true,
        $or: [{ collaborator_id }, { collaborator_id: { $ne: collaborator_id }, is_global: true }],
    }).select("tag_name tag_id is_global is_active");

    res.status(httpStatus.OK).json({
        status: httpStatus.OK,
        data: tags,
    });
});

const handleCreateTag = catchAsync(async (req: any, res: Response) => {
    const collaborator_id = req.collaborator.collaborator_id;
    const { tag_name, is_global } = req.body;

    // Trim whitespace from tag name
    const normalizedTagName = tag_name.trim();

    // Check if tag already exists
    const existingTag = await CollaboratorProductTagsModel.findOne({
        tag_name: { $regex: `^${normalizedTagName}$`, $options: "i" }, // Exact match, case insensitive
        is_active: true,
        $or: [{ collaborator_id }, { collaborator_id: { $ne: collaborator_id }, is_global: true }],
    });

    if (existingTag) {
        return res.status(httpStatus.CONFLICT).json({
            status: httpStatus.CONFLICT,
            message: "Tag with this name already exists",
        });
    }

    const tag = await CollaboratorProductTagsModel.create({
        tag_id: generateUUID(),
        tag_name: normalizedTagName,
        is_global,
        collaborator_id,
    });

    res.status(httpStatus.OK).json({
        status: httpStatus.OK,
        message: "Tag created successfully",
        data: tag,
    });
});

const handleGetSocialShareAnalytics = catchAsync(async (req: any, res: Response) => {
    const collaborator = req.collaborator;
    const { days } = req.query;
    const analytics = await analyticsService.getSocialShareAnalytics(collaborator.collaborator_id, days);
    res.status(httpStatus.OK).json({
        status: httpStatus.OK,
        code: httpStatus.OK,
        message: "Social share analytics fetched successfully",
        data: analytics,
    });
});

const handleAddSkill = catchAsync(async (req: Request, res: Response) => {
    try {
        const { name } = req.body;

        const skill = await skillModel.create({
            skillId: generateUUID(),
            name,
            subSkillCategoryId: null,
            isActive: false,
        });

        if (skill) {
            res.status(httpStatus.CREATED).json({
                status: httpStatus.OK,
                code: httpStatus.CREATED,
                message: "Skill added successfully and will be active after admin approval!",
            });
        } else {
            return res.status(httpStatus.BAD_REQUEST).json({
                status: httpStatus.BAD_REQUEST,
                code: httpStatus.BAD_REQUEST,
                message: "Skill already exists",
            });
        }
    } catch (err) {
        console.log("Error in handleAddSkill", err);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            status: httpStatus.INTERNAL_SERVER_ERROR,
            code: httpStatus.INTERNAL_SERVER_ERROR,
            message: "Internal server error",
        });
    }
});

export default {
    handleGetAllSkills,
    handleGetOverAllnalytics,
    handleGetAllTags,
    handleCreateTag,
    handleGetSocialShareAnalytics,
    handleAddSkill,
};
