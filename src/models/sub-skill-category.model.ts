// Importing package
import { Schema, model } from 'mongoose';

// Importing interfaces
import { SubSkillCategoryInterface } from '../interfaces/models.interface';

const schema = new Schema<SubSkillCategoryInterface>(
  {
    subSkillCategoryId: { type: String, required: true },
    masterSkillCategoryId: { type: String, required: true },
    name: { type: String, required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default model<SubSkillCategoryInterface>('sub_skill_categories', schema);
