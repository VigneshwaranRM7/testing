import mongoose from "mongoose";

export interface ICollaboratorOtpToken {
    otp_token_id: string;
    collaborator_id: string;
    email: string;
    otp: string;
    expires_at: Date;
    is_used: boolean;
    created_at: Date;
    updated_at: Date;
}

const collaboratorOtpTokenSchema = new mongoose.Schema<ICollaboratorOtpToken>(
    {
        otp_token_id: {
            type: String,
            required: true,
            unique: true,
        },
        collaborator_id: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        otp: {
            type: String,
            required: true,
        },
        expires_at: {
            type: Date,
            required: true,
        },
        is_used: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Add index for expiry and cleanup
collaboratorOtpTokenSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

const CollaboratorOtpTokenModel = mongoose.model<ICollaboratorOtpToken>(
    "collaborator_otp_tokens",
    collaboratorOtpTokenSchema
);

export default CollaboratorOtpTokenModel;
