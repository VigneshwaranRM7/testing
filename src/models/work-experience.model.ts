// Importing package
import { Schema, model } from 'mongoose';

// Importing interfaces
import { WorkExperienceInterface } from '../interfaces/models.interface';

const schema = new Schema<WorkExperienceInterface>(
  {
    workExperienceId: { type: String, required: true },
    studentId: { type: String, required: true },
    role: { type: String, required: true },
    companyName: { type: String, required: true },
    employeeId: { type: String, required: false },
    location: { type: String, required: true },
    locationType: { type: String, enum: ['REMOTE', 'ON_SITE', 'HYBRID'], required: true },
    startMonth: { type: String, required: true },
    startYear: { type: String, required: true },
    endMonth: { type: String, required: false },
    endYear: { type: String, required: false },
    currentlyWorking: { type: Boolean, default: false },
    description: { type: String, required: false },
    workType: {
      type: String,
      enum: ['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'FREELANCE', 'SELF_EMPLOYED', 'TRAINEE'],
      required: true
    },
    organizationWebsiteUrl: { type: String, required: false },
    verifierEmail: { type: String, required: false },
    isVerified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['VERIFICATION_PENDING', 'REQUEST_VERIFICATION', 'REVISION_REQUIRED', 'VERIFIED'],
      default: 'REQUEST_VERIFICATION'
    }
  },
  { timestamps: true }
);

export default model<WorkExperienceInterface>('work_experiences', schema);
