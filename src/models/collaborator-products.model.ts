import mongoose from "mongoose";

const collaboratorProductsSchema = new mongoose.Schema(
    {
        collaborator_id: {
            type: String,
            required: true,
        },
        product_id: {
            type: String,
            required: true,
        },
        product_thumbnail: {
            type: String,
            required: true,
        },
        product_title: {
            type: String,
            required: true,
        },
        product_tags: {
            type: [
                {
                    type: String,
                },
            ],
            required: true,
        },

        product_mode: {
            type: String,
            enum: ["ONLINE", "OFFLINE", "HYBRID"],
            required: true,
        },
        product_type: {
            type: String,
            required: true,
        },
        product_price: {
            type: Number,
            required: true,
        },
        product_currency: {
            type: String,
            required: true,
        },
        product_duration: {
            type: String,
            required: true,
        }, //TODO: Need clarification
        product_link: {
            type: String,
        },
        trigger_assessment: {
            type: Boolean,
            required: true,
        },
        product_brochure_or_details: {
            type: String,
            required: false,
            default: null,
        },
        skill_badges: {
            type: [
                {
                    type: String,
                },
            ],
            required: true,
        },
        is_active: {
            type: Boolean,
            required: true,
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

const CollaboratorProductsModel = mongoose.model("collaborator_products", collaboratorProductsSchema);

export default CollaboratorProductsModel;
