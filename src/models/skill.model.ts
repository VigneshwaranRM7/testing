// Importing package
import { Schema, model } from 'mongoose';

// Importing interfaces
import { skillInterface } from '../interfaces/models.interface';

const schema = new Schema<skillInterface>(
  {
    skillId: { type: String, required: true },
    subSkillCategoryId: { type: String, default: null },
    name: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default model<skillInterface>('skills', schema);
