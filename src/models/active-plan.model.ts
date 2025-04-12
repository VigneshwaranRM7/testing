import mongoose from "mongoose";

const activePlanSchema = new mongoose.Schema(
    {
        collaborator_id: {
            type: String,
            required: true,
        },
        plan_id: {
            type: String,
            required: true,
        },
        is_active: {
            type: Boolean,
            default: true,
            required: true,
        },
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    }
);

// Create a compound index for collaborator_id and is_active
activePlanSchema.index({ collaborator_id: 1, is_active: 1 });

const CollaboratorActivePlanModel = mongoose.model("collaborator_active_plans", activePlanSchema);
export default CollaboratorActivePlanModel;
