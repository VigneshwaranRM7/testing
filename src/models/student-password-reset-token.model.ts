import { Schema, model } from 'mongoose';
import { StudentPasswordResetTokenInterface } from '../interfaces/models.interface';

const schema = new Schema<StudentPasswordResetTokenInterface>(
  {
    studentPasswordResetTokenId: { type: String, required: true },
    studentId: { type: String, required: true }
  },
  { timestamps: true }
);

export default model<StudentPasswordResetTokenInterface>('student_password_reset_tokens', schema);
