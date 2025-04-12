// Importing package
import { Schema, model } from "mongoose";

// Importing interfaces
import { ProfileVerificationInterface } from "../interfaces/models.interface";
const schema = new Schema<ProfileVerificationInterface>(
    {
        profileVerificationId: { type: String, required: true },
        studentId: { type: String, required: true },
        verifierEmail: { type: String, required: true },
        associationType: {
            type: String,
            required: true,
            enum: ["EDUCATION", "WORK_EXPERIENCE", "PROJECT"],
        },
        associationId: { type: String, required: true },
        isVerified: { type: Boolean, default: false },
        revisions: [
            {
                revisionDate: { type: Date, default: Date.now },
                comments: String,
            },
        ],
    },
    { timestamps: true }
);

export default model<ProfileVerificationInterface>("profile_verifications", schema);
