// Importing package

import { Model, Schema, model } from 'mongoose';

// Importing interfaces
import { StudentInterface, StudentModelWithStatic } from '../interfaces/models.interface';

const schema = new Schema<StudentInterface>(
  {
    studentId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: false },
    dateOfBirth: { type: String, required: false },
    gender: {
      type: String,
      enum: ['MALE', 'FEMALE', 'OTHER'],
      required: false
    },
    phoneNumber: { type: String, required: false },
    isActive: { type: Boolean, default: true },
    googleId: { type: String, required: false },
    profilePictureUrl: { type: String, required: false },
    profilePictureKey: { type: String, required: false },
    about: { type: String, required: false },
    socialMedia: {
      linkedIn: { type: String, required: false },
      instagram: { type: String, required: false },
      twitter: { type: String, required: false },
      youtube: { type: String, required: false },
      behance: { type: String, required: false },
      personalWebsite: { type: String, required: false }
    },
    isPasswordSetUpCompleted: { type: Boolean, default: false },
    isOnBoardingCompleted: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    isProfileCompleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

schema.index({ studentId: 1, email: 1 }, { unique: true });

schema.statics.findById = async function (this: Model<StudentInterface>, id: string) {
  return await this.findOne({ studentId: id });
};

const studentModel = model<StudentInterface, StudentModelWithStatic>('students', schema);

export default studentModel;
