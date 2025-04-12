import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        payment_id: {
            type: String,
            required: true,
            unique: true,
        },
        collaborator_id: {
            type: String,
            required: true,
        },
        product_id: {
            type: String,
            required: true,
        },
        plan_id: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            enum: ["INR", "USD"],
            default: "INR",
            required: true,
        },
        status: {
            type: String,
            enum: ["PENDING", "SUCCESS", "FAILED"],
            default: "PENDING",
            required: true,
        },
        razorpay_order_id: {
            type: String,
            required: true,
        },
        razorpay_payment_id: {
            type: String,
            sparse: true,
        },
        razorpay_signature: {
            type: String,
            sparse: true,
        },
        student_count: {
            type: Number,
            required: true,
        },
        students: {
            type: [
                {
                    email: String,
                    name: String,
                },
            ],
            required: true,
        },
        is_active: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    }
);

const CollaboratorPaymentModel = mongoose.model("collaborator_payments", paymentSchema);
export default CollaboratorPaymentModel;
