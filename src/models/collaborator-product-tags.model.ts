// Importing package
import { Schema, model } from "mongoose";

// Importing interfaces
import { CollaboratorProductTagsInterface } from "../interfaces/models.interface";

const schema = new Schema<CollaboratorProductTagsInterface>(
    {
        tag_id: { type: String, required: true, unique: true },
        tag_name: { type: String, required: true, unique: true },
        collaborator_id: { type: String, required: false },
        is_global: { type: Boolean, default: false },
        is_active: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const CollaboratorProductTagsModel = model<CollaboratorProductTagsInterface>("collaborator_product_tags", schema);

export default CollaboratorProductTagsModel;
