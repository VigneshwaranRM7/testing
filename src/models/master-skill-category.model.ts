// Importing package
import { Schema, model } from "mongoose";

// Importing interfaces
import { MasterSkillCategoryInterface } from "../interfaces/models.interface";
const schema = new Schema<MasterSkillCategoryInterface>(
    {
        masterSkillCategoryId: { type: String, required: true },
        name: { type: String, required: true },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default model<MasterSkillCategoryInterface>("master_skill_categories", schema);
