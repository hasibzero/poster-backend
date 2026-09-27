import mongoose, { Document, Schema } from 'mongoose';
import { Poster, PosterFormData } from '../../shared/types';

export interface IPoster extends Document, Omit<Poster, '_id' | 'userId' | 'templateId'> {
  userId: Schema.Types.ObjectId;
  templateId: Schema.Types.ObjectId;
}

const formDataSchema = new Schema<PosterFormData>(
  {
    name: { type: String, required: true, trim: true },
    designation: { type: String, required: true, trim: true },
    party: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    upazila: { type: String, required: true, trim: true },
    union: { type: String, required: true, trim: true },
    occasionType: { type: String, required: true, trim: true },
    headlineText: { type: String, required: true, trim: true },
    subHeadline: { type: String, trim: true },
  },
  { _id: false }
);

const posterSchema = new Schema<IPoster>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    templateId: { type: Schema.Types.ObjectId, ref: 'Template', required: true },
    formData: { type: formDataSchema, required: true },
    uploadedPhotoUrls: [{ type: String }],
    generatedImageUrl: { type: String },
    status: { 
      type: String, 
      enum: ['draft', 'generating', 'completed', 'failed'], 
      default: 'draft' 
    },
    retryCount: { type: Number, default: 0 },
    errorMessage: { type: String },
  },
  { timestamps: true }
);

posterSchema.index({ userId: 1, createdAt: -1 });
posterSchema.index({ templateId: 1 });
posterSchema.index({ status: 1 });

export const Poster = mongoose.model<IPoster>('Poster', posterSchema);
