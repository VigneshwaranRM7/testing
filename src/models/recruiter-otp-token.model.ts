import mongoose from "mongoose";

export interface IRecruiterOtpToken {
    otpTokenId: string;
    recruiterId: string;
    email: string;
    otp: string;
    expiresAt: Date;
    isUsed: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const recruiterOtpTokenSchema = new mongoose.Schema<IRecruiterOtpToken>(
    {
        otpTokenId: {
            type: String,
            required: true,
            unique: true,
        },
        recruiterId: {
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
        expiresAt: {
            type: Date,
            required: true,
        },
        isUsed: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Add index for expiry and cleanup
recruiterOtpTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const recruiterOtpTokenModel = mongoose.model<IRecruiterOtpToken>("recruiter_otp_tokens", recruiterOtpTokenSchema);

export default recruiterOtpTokenModel;
