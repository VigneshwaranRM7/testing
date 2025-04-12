// Importing package
import { Schema, model } from 'mongoose';

// Importing interfaces
import { YoutubeLearningNotesInterface } from '../interfaces/models.interface';

const schema = new Schema<YoutubeLearningNotesInterface>(
  {
    youtubeLearningNotesId: { type: String, required: true },
    youtubeLearningId: { type: String, required: true },
    videoId: { type: String, required: true },
    notes: { type: String, required: true },
    timestamp: { type: Number, required: true }
  },
  { timestamps: true }
);

export default model<YoutubeLearningNotesInterface>('youtube_learning_notes', schema);
