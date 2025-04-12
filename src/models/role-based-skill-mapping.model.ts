// Importing package
import { Schema, model } from 'mongoose';

// Importing interfaces
import { RoleBasedSkillMappingInterface } from '../interfaces/models.interface';

const schema = new Schema<RoleBasedSkillMappingInterface>(
  {
    roleBasedSkillMappingId: { type: String, required: true },
    studentId: { type: String, required: true },
    skillId: { type: String, required: true },
    associationType: { type: String, enum: ['WORK_EXPERIENCE', 'PROJECT', 'ASSESSMENT'], required: true },
    associationId: { type: String, required: true },
    isEndorsed: { type: Boolean, default: false },
    isHit: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default model<RoleBasedSkillMappingInterface>('role_based_skill_mappings', schema);
