import mongoose from "mongoose";

const collaboratorSchema = new mongoose.Schema(
    {
        collaborator_id: {
            type: String,
            unique: true,
            required: true,
        },
        name: {
            type: String,
            required: true,
            unique: false,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
        },
        is_active: {
            type: Boolean,
            default: true,
        },
        is_email_verified: {
            type: Boolean,
            default: false,
        },
        profile_picture_url: {
            type: String,
            default: null,
        },
        google_id: {
            type: String,
            unique: false,
        },
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updater_at",
        },
        toJSON: {
            transform: function (doc, ret) {
                delete ret.__v;
                delete ret._id;
                delete ret.password;
                return ret;
            },
        },
    }
);

const CollaboratorModel = mongoose.model("collaborators", collaboratorSchema);

export default CollaboratorModel;
