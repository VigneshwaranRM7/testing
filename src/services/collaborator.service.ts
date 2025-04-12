import { HttpStatusCode } from "axios";
import { generateUUID } from "../helpers/uuid.helper";
import ApiError from "../utils/api-error";
import cloudStorage from "../utils/cloud-storage";
import CollaboratorModel from "../models/collaborators.model";
import CollaboratorProductStudentsModel from "../models/collaborator-product-students.model";
import bcrypt from "bcryptjs";
interface CreateCollaboratorInput {
    email: string;
    name: string;
    password?: string;
    google_id?: string;
    profile_picture_url?: string;
}

interface UpdateCollaboratorInput {
    name?: string;
    profile_picture_url?: string;
    current_password?: string;
    new_password?: string;
    confirm_password?: string;
    [key: string]: string | undefined;
}

const createCollaborator = async (collaborator: CreateCollaboratorInput): Promise<any> => {
    const newCollaborator = await CollaboratorModel.create({
        collaborator_id: generateUUID(),
        email: collaborator.email,
        name: collaborator.name,
        is_active: true,
        is_email_verified: true,
        google_id: collaborator?.google_id,
        profile_picture_url: collaborator?.profile_picture_url,
        password: collaborator?.password,
    });
    return newCollaborator.toJSON();
};

const getCollaboratorById = async (collaboratorId: string): Promise<any> => {
    const collaborator = await CollaboratorModel.findOne({ collaborator_id: collaboratorId, is_active: true }).select(
        "-_id email name profile_picture_url"
    );

    if (!collaborator) {
        throw new ApiError(HttpStatusCode.NotFound, "Collaborator not found");
    }

    return collaborator.toJSON();
};

const updateCollaborator = async (
    collaboratorId: string,
    updateData: UpdateCollaboratorInput,
    profilePicture?: any
): Promise<any> => {
    const collaborator = await CollaboratorModel.findOne({ collaborator_id: collaboratorId, is_active: true });

    if (!collaborator) {
        throw new ApiError(HttpStatusCode.NotFound, "Collaborator not found");
    }

    // If there's a new profile picture, upload it to cloud storage
    if (profilePicture) {
        if (collaborator.profile_picture_url && collaborator.profile_picture_url.includes("amazonaws.com")) {
            // Delete old profile picture from cloud storage
            await cloudStorage.deleteFile(collaborator.profile_picture_url);
        }
        updateData.profile_picture_url = profilePicture;
    }

    // Handle password update
    if (updateData.current_password && updateData.new_password) {
        // Check if this is a Google account
        if (collaborator.google_id) {
            throw new ApiError(HttpStatusCode.BadRequest, "Password cannot be updated for Google-linked accounts");
        }

        // Verify current password exists
        if (!collaborator.password) {
            throw new ApiError(HttpStatusCode.BadRequest, "No password is set for this account");
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(updateData.current_password, collaborator.password);
        if (!isPasswordValid) {
            throw new ApiError(HttpStatusCode.BadRequest, "Current password is incorrect");
        }

        // Verify new password meets requirements
        if (updateData.new_password.length < 8) {
            throw new ApiError(HttpStatusCode.BadRequest, "New password must be at least 8 characters long");
        }

        // Hash and set new password
        updateData.password = await bcrypt.hash(updateData.new_password, 10);
    }

    // Update allowed fields
    const allowedUpdates = ["name", "profile_picture_url", "password"] as const;
    const filteredUpdateData: UpdateCollaboratorInput = {};

    allowedUpdates.forEach((key) => {
        if (updateData[key]) {
            filteredUpdateData[key] = updateData[key];
        }
    });

    const updatedCollaborator = await CollaboratorModel.findOneAndUpdate(
        { collaborator_id: collaboratorId },
        { $set: filteredUpdateData },
        { new: true }
    ).select("-password");

    if (!updatedCollaborator) {
        throw new ApiError(HttpStatusCode.NotFound, "Collaborator not found");
    }

    return updatedCollaborator;
};

const deleteCollaborator = async (collaborator: any): Promise<void> => {
    await CollaboratorModel.deleteOne({
        collaborator_id: collaborator.collaborator_id,
        is_active: true,
        email: collaborator?.email,
    });
};

const getAllStudents = async (collaboratorId: string, tags: string, search: string) => {
    try {
        // Handle tags parameter
        const tagsArray = tags && tags.trim() !== "" ? tags.split(",") : [];

        // Create base match condition
        const matchCondition: any = {
            collaborator_id: collaboratorId,
            is_active: true,
        };

        // Add search and tags conditions only if they exist
        if (tagsArray.length > 0 || (search && search.trim() !== "")) {
            matchCondition.$or = [];

            if (tagsArray.length > 0) {
                matchCondition.$or.push({ collaborator_student_tags: { $in: tagsArray } });
            }

            if (search && search.trim() !== "") {
                matchCondition.$or.push({ $text: { $search: search } });
            }
        }

        const students = await CollaboratorProductStudentsModel.aggregate([
            {
                $match: matchCondition,
            },
            {
                $lookup: {
                    from: "students",
                    let: { email: "$email" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$email", "$$email"] },
                            },
                        },
                        {
                            $project: {
                                name: 1,
                                profilePictureUrl: 1,
                                studentId: 1,
                                _id: 0,
                            },
                        },
                    ],
                    as: "student",
                },
            },
            {
                $lookup: {
                    from: "collaborator_products",
                    let: { productId: "$product_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$product_id", "$$productId"] },
                            },
                        },
                        {
                            $project: {
                                product_title: 1,
                                product_mode: 1,
                                _id: 0,
                            },
                        },
                    ],
                    as: "product",
                },
            },
            {
                $unwind: "$product",
            },
            {
                $lookup: {
                    from: "license_and_certificates",
                    let: {
                        productId: "$collaborator_product_students_id",
                        studentId: { $arrayElemAt: ["$student.studentId", 0] },
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$credentialId", "$$productId"] },
                                        { $eq: ["$studentId", "$$studentId"] },
                                    ],
                                },
                            },
                        },
                        {
                            $project: {
                                isVerified: 1,
                                status: 1,
                                _id: 0,
                                certificateAssessmentId: 1,
                            },
                        },
                        {
                            $lookup: {
                                from: "certificate_assessments",
                                let: {
                                    certificateAssessmentId: "$certificateAssessmentId",
                                },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: { $eq: ["$certificateAssessmentId", "$$certificateAssessmentId"] },
                                        },
                                    },
                                    {
                                        $project: {
                                            _id: 0,
                                            status: 1,
                                        },
                                    },
                                ],
                                as: "assessment",
                            },
                        },
                    ],
                    as: "certificate",
                },
            },
            {
                $unwind: {
                    path: "$certificate",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: "$assessment",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    _id: 0,
                    name: 1,
                    email: 1,
                    profile_picture_url: {
                        $ifNull: [{ $arrayElemAt: ["$student.profilePictureUrl", 0] }, null],
                    },
                    product_title: "$product.product_title",
                    product_mode: "$product.product_mode",
                    assigned_at: "$created_at",
                    assessment_status: {
                        $cond: [
                            { $gt: [{ $size: "$student" }, 0] },
                            {
                                $cond: [
                                    { $ifNull: ["$certificate", false] },
                                    {
                                        $cond: [
                                            { $eq: ["$certificate.status", "VERIFIED"] },
                                            "PASSED",
                                            {
                                                $cond: [
                                                    { $ifNull: ["$assessment.status", false] },
                                                    "$assessment.status",
                                                    "FAILED",
                                                ],
                                            },
                                        ],
                                    },
                                    "PENDING_ASSESSMENT",
                                ],
                            },
                            "NEED_TO_CLAIM",
                        ],
                    },
                    student_id: {
                        $ifNull: [{ $arrayElemAt: ["$student.studentId", 0] }, null],
                    },
                    collaborator_product_students_id: 1,
                },
            },
        ]);

        return students;
    } catch (error) {
        throw new ApiError(HttpStatusCode.InternalServerError, "Error fetching students");
    }
};

export default {
    createCollaborator,
    getCollaboratorById,
    updateCollaborator,
    deleteCollaborator,
    getAllStudents,
};
