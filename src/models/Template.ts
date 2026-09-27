import mongoose, { Document, Schema } from 'mongoose';
import { Template, TemplateLayoutConfig, PhotoSlot, TextSlot, BackgroundConfig, DecorativeElement } from '../../shared/types';

export interface ITemplate extends Document, Omit<Template, '_id' | 'layoutConfig'> {
  layoutConfig: TemplateLayoutConfig;
}

const photoSlotSchema = new Schema<PhotoSlot>(
  {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    shape: { type: String, enum: ['rect', 'circle'], default: 'rect' },
    order: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

const textSlotSchema = new Schema<TextSlot>(
  {
    key: { type: String, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    maxWidth: { type: Number, required: true },
    fontSize: { type: Number, required: true },
    fontFamily: { type: String, required: true, default: 'Noto Sans Bengali' },
    color: { type: String, required: true },
    align: { type: String, enum: ['left', 'center', 'right'], default: 'center' },
    isBangla: { type: Boolean, default: true },
  },
  { _id: false }
);

const backgroundConfigSchema = new Schema<BackgroundConfig>(
  {
    type: { type: String, enum: ['color', 'image', 'pattern', 'gradient'], required: true },
    value: { type: String, required: true },
    opacity: { type: Number, default: 1 },
  },
  { _id: false }
);

const decorativeElementSchema = new Schema<DecorativeElement>(
  {
    type: { type: String, enum: ['flag', 'border', 'motif', 'dove', 'rice-paddy', 'custom'], required: true },
    position: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
    },
    scale: { type: Number, required: true, default: 1 },
    rotation: { type: Number, default: 0 },
    opacity: { type: Number, default: 1 },
    src: { type: String },
    color: { type: String },
  },
  { _id: false }
);

const layoutConfigSchema = new Schema<TemplateLayoutConfig>(
  {
    dimensions: {
      width: { type: Number, required: true, default: 1200 },
      height: { type: Number, required: true, default: 1600 },
    },
    photoSlots: [photoSlotSchema],
    textSlots: [textSlotSchema],
    backgroundConfig: { type: backgroundConfigSchema, required: true },
    decorativeElements: [decorativeElementSchema],
  },
  { _id: false }
);

const templateSchema = new Schema<ITemplate>(
  {
    title: { type: String, required: true, trim: true },
    occasionType: { 
      type: String, 
      enum: ['victory', 'condolence', 'campaign', 'greeting', 'eid'], 
      required: true 
    },
    thumbnailUrl: { type: String, required: true },
    layoutConfig: { type: layoutConfigSchema, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

templateSchema.index({ occasionType: 1, isActive: 1 });

export const Template = mongoose.model<ITemplate>('Template', templateSchema);
