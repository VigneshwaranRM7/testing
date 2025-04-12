import { Schema, model } from 'mongoose';
import { StudentSessionTokenInterface } from '../interfaces/models.interface';

const schema = new Schema<StudentSessionTokenInterface>(
  {
    studentSessionTokenId: { type: String, required: true },
    token: { type: String, required: true }
  },
  { timestamps: true }
);

export default model<StudentSessionTokenInterface>('student_session_tokens', schema);
