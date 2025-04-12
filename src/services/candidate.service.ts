import studentModel from "../models/student.model";
import ApiError from "../utils/api-error";
import skillModel from "../models/skill.model";
import logger from "../config/logger";
import httpStatus from "http-status";

const getAllCandidates = async (recruiterId?: string, query?: any) => {
    const { role, skills, location, workType, gender } = query;
    const allQuerySkills = skills ? skills.split(",") : [];

    logger.info("Fetching all candidates for recruiter", recruiterId);
    const candidates = await studentModel.aggregate([
        {
            $match: {
                isActive: true,
                isProfileCompleted: true,
                gender: gender ? gender : { $ne: null },
            },
        },
        {
            $lookup: {
                from: "role_based_skill_mappings",
                let: { studentId: "$studentId" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$studentId", "$$studentId"] },
                            $or: [{ isEndorsed: true }, { isHit: true }],
                        },
                    },
                    {
                        $lookup: {
                            from: "skills",
                            localField: "skillId",
                            foreignField: "skillId",
                            as: "skillDetails",
                        },
                    },
                    {
                        $unwind: "$skillDetails",
                    },
                    {
                        $lookup: {
                            from: "role_based_skill_mappings",
                            let: { skillId: "$skillId" },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $and: [
                                                { $eq: ["$skillId", "$$skillId"] },
                                                { $eq: ["$studentId", "$$studentId"] },
                                            ],
                                        },
                                        $or: [{ isEndorsed: true }, { isHit: true }],
                                    },
                                },
                                {
                                    $project: {
                                        isEndorsed: 1,
                                        isHit: 1,
                                    },
                                },
                            ],
                            as: "skillStats",
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            skillId: "$skillDetails.skillId",
                            name: "$skillDetails.name",
                            type: { $literal: "role_based" },
                            hitCount: {
                                $size: {
                                    $filter: {
                                        input: "$skillStats",
                                        as: "stat",
                                        cond: { $eq: ["$$stat.isHit", true] },
                                    },
                                },
                            },
                            endorsedCount: {
                                $size: {
                                    $filter: {
                                        input: "$skillStats",
                                        as: "stat",
                                        cond: { $eq: ["$$stat.isEndorsed", true] },
                                    },
                                },
                            },
                        },
                    },
                ],
                as: "roleBasedSkills",
            },
        },
        {
            $lookup: {
                from: "interest_based_skill_mappings",
                let: { studentId: "$studentId" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$studentId", "$$studentId"] },
                        },
                    },
                    {
                        $lookup: {
                            from: "skills",
                            localField: "skillId",
                            foreignField: "skillId",
                            as: "skillDetails",
                        },
                    },
                    {
                        $unwind: "$skillDetails",
                    },
                    {
                        $project: {
                            _id: 0,
                            skillId: "$skillDetails.skillId",
                            name: "$skillDetails.name",
                            type: { $literal: "interest_based" },
                            hitCount: { $literal: 0 },
                            endorsedCount: { $literal: 0 },
                        },
                    },
                ],
                as: "interestBasedSkills",
            },
        },
        {
            $addFields: {
                skills: {
                    $concatArrays: ["$roleBasedSkills", "$interestBasedSkills"],
                },
            },
        },
        {
            $lookup: {
                from: "work_experiences",
                let: { studentId: "$studentId" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$studentId", "$$studentId"] },
                            isVerified: true,
                            currentlyWorking: true,
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            role: 1,
                            companyName: 1,
                            location: 1,
                            locationType: 1,
                            startMonth: 1,
                            startYear: 1,
                            endMonth: 1,
                            endYear: 1,
                            workType: 1,
                            currentlyWorking: 1,
                            description: 1,
                        },
                    },
                ],
                as: "workExperience",
            },
        },
        {
            $addFields: {
                currentWork: { $arrayElemAt: ["$workExperience", 0] },
            },
        },
        {
            $lookup: {
                from: "shortlisted_candidates",
                let: { studentId: "$studentId" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$candidateId", "$$studentId"] },
                                    recruiterId ? { $eq: ["$recruiterId", recruiterId] } : { $eq: ["$recruiterId", null] },
                                ],
                            },
                        },
                    },
                ],
                as: "shortlistedStatus",
            },
        },
        {
            $lookup: {
                from: "hired_candidates",
                let: { studentId: "$studentId" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$candidateId", "$$studentId"] },
                                    recruiterId ? { $eq: ["$recruiterId", recruiterId] } : { $eq: ["$recruiterId", null] },
                                ],
                            },
                        },
                    },
                ],
                as: "hiredStatus",
            },
        },
        {
            $addFields: {
                isShortlisted: { $gt: [{ $size: "$shortlistedStatus" }, 0] },
                isHired: { $gt: [{ $size: "$hiredStatus" }, 0] },
            },
        },
        {
            $project: {
                _id: 0,
                candidateId: "$studentId",
                name: 1,
                email: 1,
                profilePictureUrl: 1,
                dateOfBirth: 1,
                gender: 1,
                phoneNumber: 1,
                about: 1,
                socialMedia: 1,
                skills: 1,
                isShortlisted: 1,
                isHired: 1,
                role: "$currentWork.role",
                companyName: "$currentWork.companyName",
                location: "$currentWork.location",
                locationType: "$currentWork.locationType",
                startMonth: "$currentWork.startMonth",
                startYear: "$currentWork.startYear",
                endMonth: "$currentWork.endMonth",
                endYear: "$currentWork.endYear",
                workType: "$currentWork.workType",
                currentlyWorking: "$currentWork.currentlyWorking",
                description: "$currentWork.description",
            },
        },
        {
            $match: {
                role: role ? { $regex: role, $options: "i" } : { $ne: null },
                location: location !== "any" ? { $regex: location, $options: "i" } : { $ne: null },
                workType: workType ? workType : { $ne: null },
                skills: allQuerySkills.length > 0 ? { $elemMatch: { skillId: { $in: allQuerySkills } } } : { $ne: null },
            },
        },
    ]);

    return candidates;
};

const getCandidateById = async (candidateId: string, recruiterId?: string) => {
    const [candidate] = await studentModel.aggregate([
        {
            $match: { isActive: true, isProfileCompleted: true, studentId: candidateId },
        },
        {
            $lookup: {
                from: "role_based_skill_mappings",
                let: { studentId: "$studentId" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$studentId", "$$studentId"] },
                            $or: [{ isEndorsed: true }, { isHit: true }],
                        },
                    },
                    {
                        $lookup: {
                            from: "skills",
                            localField: "skillId",
                            foreignField: "skillId",
                            as: "skillDetails",
                        },
                    },
                    {
                        $unwind: "$skillDetails",
                    },
                    {
                        $group: {
                            _id: {
                                skillId: "$skillId",
                                name: "$skillDetails.name",
                                subSkillCategoryId: "$skillDetails.subSkillCategoryId",
                            },
                            endorsedCount: {
                                $sum: {
                                    $cond: [{ $eq: ["$isEndorsed", true] }, 1, 0],
                                },
                            },
                            hitCount: {
                                $sum: {
                                    $cond: [{ $eq: ["$isHit", true] }, 1, 0],
                                },
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            skillId: "$_id.skillId",
                            name: "$_id.name",
                            subSkillCategoryId: "$_id.subSkillCategoryId",
                            type: { $literal: "role_based" },
                            endorsedCount: 1,
                            hitCount: 1,
                        },
                    },
                ],
                as: "roleBasedSkills",
            },
        },
        {
            $lookup: {
                from: "interest_based_skill_mappings",
                let: { studentId: "$studentId" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$studentId", "$$studentId"] },
                        },
                    },
                    {
                        $lookup: {
                            from: "skills",
                            localField: "skillId",
                            foreignField: "skillId",
                            as: "skillDetails",
                        },
                    },
                    {
                        $unwind: "$skillDetails",
                    },
                    {
                        $group: {
                            _id: {
                                skillId: "$skillId",
                                name: "$skillDetails.name",
                                subSkillCategoryId: "$skillDetails.subSkillCategoryId",
                            },
                            count: { $sum: 1 },
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            skillId: "$_id.skillId",
                            name: "$_id.name",
                            subSkillCategoryId: "$_id.subSkillCategoryId",
                            type: { $literal: "interest_based" },
                            endorsedCount: "$count",
                            hitCount: { $literal: 0 },
                        },
                    },
                ],
                as: "interestBasedSkills",
            },
        },
        {
            $lookup: {
                from: "work_experiences",
                let: { studentId: "$studentId" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$studentId", "$$studentId"] },
                            isVerified: true,
                        },
                    },
                ],
                as: "workExperiences",
            },
        },
        {
            $lookup: {
                from: "educations",
                let: { studentId: "$studentId" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$studentId", "$$studentId"] },
                            isVerified: true,
                        },
                    },
                ],
                as: "educations",
            },
        },
        {
            $lookup: {
                from: "license_and_certificates",
                let: { studentId: "$studentId" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$studentId", "$$studentId"] },
                            isVerified: true,
                        },
                    },
                ],
                as: "certifications",
            },
        },
        {
            $lookup: {
                from: "projects",
                let: { studentId: "$studentId" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$studentId", "$$studentId"] },
                            isVerified: true,
                        },
                    },
                ],
                as: "projects",
            },
        },
        {
            $lookup: {
                from: "other_activities",
                let: { studentId: "$studentId" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$studentId", "$$studentId"] },
                        },
                    },
                ],
                as: "otherActivities",
            },
        },
        {
            $addFields: {
                combinedSkills: {
                    $concatArrays: ["$roleBasedSkills", "$interestBasedSkills"],
                },
            },
        },
        {
            $lookup: {
                from: "shortlisted_candidates",
                let: { studentId: "$studentId" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$candidateId", "$$studentId"] },
                                    recruiterId ? { $eq: ["$recruiterId", recruiterId] } : { $eq: ["$recruiterId", null] },
                                ],
                            },
                        },
                    },
                ],
                as: "shortlistedStatus",
            },
        },
        {
            $lookup: {
                from: "hired_candidates",
                let: { studentId: "$studentId" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$candidateId", "$$studentId"] },
                                    recruiterId ? { $eq: ["$recruiterId", recruiterId] } : { $eq: ["$recruiterId", null] },
                                ],
                            },
                        },
                    },
                ],
                as: "hiredStatus",
            },
        },
        {
            $addFields: {
                isShortlisted: { $gt: [{ $size: "$shortlistedStatus" }, 0] },
                isHired: { $gt: [{ $size: "$hiredStatus" }, 0] },
            },
        },
        {
            $project: {
                _id: 0,
                candidateId: "$studentId",
                name: 1,
                email: 1,
                profilePictureUrl: 1,
                dateOfBirth: 1,
                gender: 1,
                phoneNumber: 1,
                about: 1,
                socialMedia: 1,
                educations: 1,
                certifications: 1,
                projects: 1,
                otherActivities: 1,
                workExperiences: 1,
                roleBasedSkillsCount: { $size: "$roleBasedSkills" },
                interestBasedSkillsCount: { $size: "$interestBasedSkills" },
                isShortlisted: 1,
                isHired: 1,
                skills: {
                    roleBasedSkills: "$roleBasedSkills",
                    interestBasedSkills: "$interestBasedSkills",
                },
            },
        },
    ]);

    if (!candidate) {
        throw new ApiError(httpStatus.NOT_FOUND, "Candidate not found");
    }

    // Calculate masterStats if there are skills
    let masterStats = [];
    if (candidate.skills.roleBasedSkills.length > 0 || candidate.skills.interestBasedSkills.length > 0) {
        const combinedSkills = [...candidate.skills.roleBasedSkills, ...candidate.skills.interestBasedSkills];

        masterStats = await skillModel.aggregate([
            {
                $match: {
                    $or: combinedSkills.map((skill) => ({
                        name: skill.name,
                        subSkillCategoryId: skill.subSkillCategoryId,
                    })),
                },
            },
            {
                $lookup: {
                    from: "sub_skill_categories",
                    localField: "subSkillCategoryId",
                    foreignField: "subSkillCategoryId",
                    as: "masterSkillCategory",
                },
            },
            {
                $unwind: "$masterSkillCategory",
            },
            {
                $lookup: {
                    from: "master_skill_categories",
                    localField: "masterSkillCategory.masterSkillCategoryId",
                    foreignField: "masterSkillCategoryId",
                    as: "masterSkillDetails",
                },
            },
            {
                $unwind: "$masterSkillDetails",
            },
            {
                $group: {
                    _id: "$masterSkillDetails.name",
                    total: {
                        $sum: {
                            $let: {
                                vars: {
                                    matchedSkill: {
                                        $arrayElemAt: [
                                            {
                                                $filter: {
                                                    input: combinedSkills,
                                                    as: "skill",
                                                    cond: {
                                                        $and: [
                                                            { $eq: ["$$skill.name", "$name"] },
                                                            { $eq: ["$$skill.subSkillCategoryId", "$subSkillCategoryId"] },
                                                        ],
                                                    },
                                                },
                                            },
                                            0,
                                        ],
                                    },
                                },
                                in: "$$matchedSkill.endorsedCount",
                            },
                        },
                    },
                    totalHitCount: {
                        $sum: {
                            $let: {
                                vars: {
                                    matchedSkill: {
                                        $arrayElemAt: [
                                            {
                                                $filter: {
                                                    input: combinedSkills,
                                                    as: "skill",
                                                    cond: {
                                                        $and: [
                                                            { $eq: ["$$skill.name", "$name"] },
                                                            { $eq: ["$$skill.subSkillCategoryId", "$subSkillCategoryId"] },
                                                        ],
                                                    },
                                                },
                                            },
                                            0,
                                        ],
                                    },
                                },
                                in: "$$matchedSkill.hitCount",
                            },
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    label: "$_id",
                    count: "$total",
                    hitCount: "$totalHitCount",
                },
            },
        ]);
    }

    return {
        ...candidate,
        masterStats,
    };
};

export default {
    getAllCandidates,
    getCandidateById,
};
