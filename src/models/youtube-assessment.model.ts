// Importing package
import { Schema, model } from 'mongoose';

// Importing interfaces
import { YoutubeAssessmentInterface } from '../interfaces/models.interface';

const schema = new Schema<YoutubeAssessmentInterface>(
  {
    youtubeAssessmentId: { type: String, required: true },
    youtubeLearningId: { type: String, required: true },
    studentId: { type: String, required: true },
    status: { type: String, enum: ['CREATING', 'IN_PROGRESS', 'FAILED', 'PASSED'], required: true },
    correctAnswers: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    certificateUrl: { type: String, default: '' },
    score: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default model<YoutubeAssessmentInterface>('youtube_assessments', schema);
