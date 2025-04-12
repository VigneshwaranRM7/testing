import mongoose from "mongoose";

const billingPlanSchema = new mongoose.Schema(
    {
        plan_id: {
            type: String,
            required: true,
            unique: true,
        },
        name: {
            type: String,
            required: true,
        },
        plan_tag: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            enum: ["INR", "USD"],
            default: "INR",
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

const CollaboratorBillingPlanModel = mongoose.model("collaborator_billing_plans", billingPlanSchema);
export default CollaboratorBillingPlanModel;
