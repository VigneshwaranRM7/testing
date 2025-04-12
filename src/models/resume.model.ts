import { Schema, model } from 'mongoose';
import { ResumeModelInterface } from '../interfaces/models.interface';

const resumeSchema = new Schema<ResumeModelInterface>(
  {
    resumeId: {
      type: String,
      required: true,
    },
    studentId: {
      type: String,
      required: true,
    },
    resumeTemplateId: {
      type: String,
      required: true,
    },
    skillIds: [{
      type: String,
      required: true,
    }],
    resumeUrl: {
      type: String,
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

export default model<ResumeModelInterface>('resumes', resumeSchema);
