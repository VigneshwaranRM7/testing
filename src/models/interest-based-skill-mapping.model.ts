// Importing package
import { Schema, model } from "mongoose";
import { InterestBasedSkillMappingInterface } from "../interfaces/models.interface";

// Importing interfaces

const schema = new Schema<InterestBasedSkillMappingInterface>(
    {
        interestBasedSkillMappingId: { type: String, required: true },
        studentId: { type: String, required: true },
        skillId: { type: String, required: true },
    },
    { timestamps: true }
);

export default model<InterestBasedSkillMappingInterface>("interest_based_skill_mappings", schema);
