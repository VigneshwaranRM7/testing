import { Schema, model } from 'mongoose';
import { StudentSignUpTokenInterface } from '../interfaces/models.interface';

const schema = new Schema<StudentSignUpTokenInterface>(
  {
    studentSignUpTokenId: { type: String, required: true },
    studentId: { type: String, required: true }
  },
  { timestamps: true }
);

export default model<StudentSignUpTokenInterface>('student_signup_tokens', schema);
