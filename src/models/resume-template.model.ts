// Importing package
import { Schema, model } from 'mongoose';

// Importing interfaces
import { ResumeTemplateInterface } from '../interfaces/models.interface';

const schema = new Schema<ResumeTemplateInterface>(
  {
    resumeTemplateId: { type: String, required: true },
    name: { type: String, required: true },
    htmlContent: { type: String, required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default model<ResumeTemplateInterface>('resume_templates', schema);
