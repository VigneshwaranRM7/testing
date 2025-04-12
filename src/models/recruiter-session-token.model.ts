import mongoose from "mongoose";

const recruiterSessionTokenSchema = new mongoose.Schema(
    {
        recruiterSessionTokenId: { type: String, required: true },
        recruiterId: { type: String, required: true, index: true },
        token: { type: String, required: true },
        refreshToken: { type: String, required: true },
        expiresAt: { type: Date, required: true, index: true },
    },
    {
        timestamps: true,
        indexes: [{ recruiterId: 1, expiresAt: 1 }, { token: 1 }, { refreshToken: 1 }],
    }
);

// Add TTL index to automatically remove expired sessions
recruiterSessionTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const recruiterSessionTokenModel = mongoose.model("recruiter_session_tokens", recruiterSessionTokenSchema);

export default recruiterSessionTokenModel;
