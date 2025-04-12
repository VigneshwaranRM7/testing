// Importing package
import { Schema, model } from 'mongoose';

// Importing interfaces
import { YoutubeLearningInterface } from '../interfaces/models.interface';

const schema = new Schema<YoutubeLearningInterface>(
  {
    youtubeLearningId: { type: String, required: true },
    playlistId: { type: String },
    studentId: { type: String, required: true },
    courseMetaData: { type: Object, required: true },
    courseContent: { type: Object, required: true },
    courseProgress: { type: Object, required: true },
    status: { type: String, enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'], required: true },
    skillBadges: { type: [String] }
  },
  { timestamps: true }
);

export default model<YoutubeLearningInterface>('youtube_learnings', schema);
