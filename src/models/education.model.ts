// Importing package
import { Schema, model } from "mongoose";

// Importing interfaces
import { EducationInterface } from "../interfaces/models.interface";

const schema = new Schema<EducationInterface>(
    {
        educationId: { type: String, required: true },
        studentId: { type: String, required: true },
        degree: { type: String, required: true },
        branch: { type: String, required: true },
        institutionName: { type: String, required: true },
        rollNumber: { type: String, required: true },
        startMonth: { type: String, required: true },
        startYear: { type: String, required: true },
        endMonth: { type: String, required: true },
        endYear: { type: String, required: true },
        grade: { type: String, required: true },
        gradeType: { type: String, enum: ["CGPA", "PERCENTAGE"], required: true },
        description: { type: String, required: false },
        organizationWebsiteUrl: { type: String, required: false },
        verifierEmail: { type: String, required: false },
        isVerified: { type: Boolean, default: false },
        status: {
            type: String,
            enum: ["VERIFICATION_PENDING", "REQUEST_VERIFICATION", "REVISION_REQUIRED", "VERIFIED"],
            default: "REQUEST_VERIFICATION",
        },
    },
    { timestamps: true }
);

export default model<EducationInterface>("educations", schema);
