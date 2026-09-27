import mongoose, { Document, Schema } from 'mongoose';
import { GenerationLog } from '../../shared/types';

export interface IGenerationLog extends Document, Omit<GenerationLog, '_id' | 'posterId'> {
  posterId: Schema.Types.ObjectId;
}

const generationLogSchema = new Schema<IGenerationLog>(
  {
    posterId: { type: Schema.Types.ObjectId, ref: 'Poster', required: true },
    geminiPromptUsed: { type: String, required: true },
    tokensUsed: { type: Number, default: 0 },
    latencyMs: { type: Number, default: 0 },
    success: { type: Boolean, required: true },
  },
  { timestamps: true }
);

generationLogSchema.index({ posterId: 1 });
generationLogSchema.index({ createdAt: -1 });

export const GenerationLog = mongoose.model<IGenerationLog>('GenerationLog', generationLogSchema);
