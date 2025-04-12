// Importing package
import { Schema, model } from "mongoose";

// Importing interfaces
import { ProjectInterface } from "../interfaces/models.interface";
const schema = new Schema<ProjectInterface>(
    {
        projectId: { type: String, required: true },
        studentId: { type: String, required: true },
        associationId: { type: String, required: false },
        associationType: { type: String, required: false },
        name: { type: String, required: true },
        description: { type: String, required: false },
        projectType: { type: String, enum: ["INDIVIDUAL", "COLLABORATIVE"], required: true },
        startMonth: { type: String, required: true },
        startYear: { type: String, required: true },
        endMonth: { type: String, required: false },
        endYear: { type: String, required: false },
        currentlyWorking: { type: Boolean, default: false },
        projectLink: { type: String, required: false },
        organizationWebsiteUrl: { type: String, required: false },
        verifierEmail: { type: String, required: false },
        isVerified: { type: Boolean, default: false },
        otherAssociationName: { type: String, required: false },
        status: {
            type: String,
            enum: ["VERIFICATION_PENDING", "REQUEST_VERIFICATION", "REVISION_REQUIRED", "VERIFIED"],
            default: "REQUEST_VERIFICATION",
        },
    },
    { timestamps: true }
);

export default model<ProjectInterface>("projects", schema);
