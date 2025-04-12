// Importing package
import { Schema, model } from 'mongoose';

// Importing interfaces
import { YoutubeAssessmentMcqInterface } from '../interfaces/models.interface';

const schema = new Schema<YoutubeAssessmentMcqInterface>(
  {
    youtubeAssessmentMcqId: { type: String, required: true },
    youtubeAssessmentId: { type: String, required: true },
    question: { type: String, required: true },
    options: { type: [String], required: true },
    correctAnswerIndex: { type: Number, required: true },
    lastSavedAnswerIndex: { type: Number, default: -1 }
  },
  { timestamps: true }
);

export default model<YoutubeAssessmentMcqInterface>('youtube_assessment_mcqs', schema);
