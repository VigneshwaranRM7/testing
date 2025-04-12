import mongoose from "mongoose";

const collaboratorSessionTokenSchema = new mongoose.Schema(
    {
        collaborator_session_token_id: { type: String, required: true },
        collaborator_id: { type: String, required: true, index: true },
        token: { type: String, required: true },
        refresh_token: { type: String, required: true },
        expires_at: { type: Date, required: true, index: true },
    },
    {
        timestamps: true,
        indexes: [{ collaborator_id: 1, expires_at: 1 }, { token: 1 }, { refresh_token: 1 }],
    }
);

const CollaboratorSessionTokenModel = mongoose.model("collaborator_session_tokens", collaboratorSessionTokenSchema);

export default CollaboratorSessionTokenModel;
