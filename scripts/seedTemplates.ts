import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../src/config/db';
import { Template } from '../src/models';
import { TemplateLayoutConfig, PhotoSlot, TextSlot, BackgroundConfig, DecorativeElement } from 'shared/types';

const createVictoryTemplate = (): Partial<TemplateLayoutConfig> => ({
  dimensions: { width: 1200, height: 1600 },
  photoSlots: [
    { x: 100, y: 80, width: 300, height: 380, shape: 'rect', order: 0 },
    { x: 450, y: 80, width: 300, height: 380, shape: 'rect', order: 1 },
    { x: 800, y: 80, width: 300, height: 380, shape: 'rect', order: 2 },
  ],
  textSlots: [
    { key: 'headline', x: 600, y: 520, maxWidth: 1000, fontSize: 72, fontFamily: 'Noto Sans Bengali', color: '#C8102E', align: 'center', isBangla: true },
    { key: 'subHeadline', x: 600, y: 610, maxWidth: 1000, fontSize: 36, fontFamily: 'Noto Sans Bengali', color: '#FFD700', align: 'center', isBangla: true },
    { key: 'name', x: 600, y: 1350, maxWidth: 1000, fontSize: 28, fontFamily: 'Noto Sans Bengali', color: '#FFFFFF', align: 'center', isBangla: true },
    { key: 'designation', x: 600, y: 1390, maxWidth: 1000, fontSize: 22, fontFamily: 'Noto Sans Bengali', color: '#FFD700', align: 'center', isBangla: true },
    { key: 'party', x: 600, y: 1420, maxWidth: 1000, fontSize: 22, fontFamily: 'Noto Sans Bengali', color: '#FFFFFF', align: 'center', isBangla: true },
    { key: 'location', x: 600, y: 1450, maxWidth: 1000, fontSize: 18, fontFamily: 'Noto Sans Bengali', color: '#FFD700CC', align: 'center', isBangla: true },
  ],
  backgroundConfig: { type: 'gradient', value: 'linear-gradient(180deg, #C8102E 0%, #006A4E 100%)' },
  decorativeElements: [
    { type: 'flag', position: { x: 0.08, y: 0.08 }, scale: 1, rotation: -15 },
    { type: 'flag', position: { x: 0.92, y: 0.08 }, scale: 1, rotation: 15 },
    { type: 'border', position: { x: 0.5, y: 0.94 }, scale: 1.2 },
    { type: 'dove', position: { x: 0.15, y: 0.85 }, scale: 0.7, opacity: 0.8 },
    { type: 'dove', position: { x: 0.85, y: 0.85 }, scale: 0.7, opacity: 0.8 },
  ],
});

const createCondolenceTemplate = (): Partial<TemplateLayoutConfig> => ({
  dimensions: { width: 1200, height: 1600 },
  photoSlots: [
    { x: 300, y: 100, width: 600, height: 750, shape: 'rect', order: 0 },
    { x: 100, y: 900, width: 250, height: 320, shape: 'rect', order: 1 },
    { x: 850, y: 900, width: 250, height: 320, shape: 'rect', order: 2 },
  ],
  textSlots: [
    { key: 'headline', x: 600, y: 880, maxWidth: 1000, fontSize: 64, fontFamily: 'Noto Sans Bengali', color: '#FFFFFF', align: 'center', isBangla: true },
    { key: 'subHeadline', x: 600, y: 960, maxWidth: 1000, fontSize: 28, fontFamily: 'Noto Sans Bengali', color: '#C8102E', align: 'center', isBangla: true },
    { key: 'name', x: 600, y: 1350, maxWidth: 1000, fontSize: 28, fontFamily: 'Noto Sans Bengali', color: '#FFFFFF', align: 'center', isBangla: true },
    { key: 'designation', x: 600, y: 1390, maxWidth: 1000, fontSize: 22, fontFamily: 'Noto Sans Bengali', color: '#CCCCCC', align: 'center', isBangla: true },
    { key: 'party', x: 600, y: 1420, maxWidth: 1000, fontSize: 22, fontFamily: 'Noto Sans Bengali', color: '#FFFFFF', align: 'center', isBangla: true },
    { key: 'location', x: 600, y: 1450, maxWidth: 1000, fontSize: 18, fontFamily: 'Noto Sans Bengali', color: '#888888', align: 'center', isBangla: true },
  ],
  backgroundConfig: { type: 'color', value: '#0D0D0D' },
  decorativeElements: [
    { type: 'dove', position: { x: 0.5, y: 0.08 }, scale: 1, opacity: 0.9 },
    { type: 'border', position: { x: 0.5, y: 0.94 }, scale: 1, opacity: 0.5, color: '#333333' },
    { type: 'motif', position: { x: 0.1, y: 0.5 }, scale: 0.5, opacity: 0.3, rotation: 90 },
    { type: 'motif', position: { x: 0.9, y: 0.5 }, scale: 0.5, opacity: 0.3, rotation: -90 },
  ],
});

const createCampaignTemplate = (): Partial<TemplateLayoutConfig> => ({
  dimensions: { width: 1200, height: 1600 },
  photoSlots: [
    { x: 150, y: 100, width: 400, height: 500, shape: 'rect', order: 0 },
    { x: 650, y: 100, width: 400, height: 500, shape: 'rect', order: 1 },
    { x: 400, y: 650, width: 400, height: 500, shape: 'rect', order: 2 },
  ],
  textSlots: [
    { key: 'headline', x: 600, y: 1180, maxWidth: 1000, fontSize: 68, fontFamily: 'Noto Sans Bengali', color: '#FFFFFF', align: 'center', isBangla: true },
    { key: 'subHeadline', x: 600, y: 1260, maxWidth: 1000, fontSize: 32, fontFamily: 'Noto Sans Bengali', color: '#FFD700', align: 'center', isBangla: true },
    { key: 'name', x: 600, y: 1350, maxWidth: 1000, fontSize: 28, fontFamily: 'Noto Sans Bengali', color: '#FFFFFF', align: 'center', isBangla: true },
    { key: 'designation', x: 600, y: 1390, maxWidth: 1000, fontSize: 22, fontFamily: 'Noto Sans Bengali', color: '#FFD700', align: 'center', isBangla: true },
    { key: 'party', x: 600, y: 1420, maxWidth: 1000, fontSize: 22, fontFamily: 'Noto Sans Bengali', color: '#FFFFFF', align: 'center', isBangla: true },
    { key: 'location', x: 600, y: 1450, maxWidth: 1000, fontSize: 18, fontFamily: 'Noto Sans Bengali', color: '#FFD700CC', align: 'center', isBangla: true },
  ],
  backgroundConfig: { type: 'gradient', value: 'linear-gradient(135deg, #0033A0 0%, #FF6B00 100%)' },
  decorativeElements: [
    { type: 'flag', position: { x: 0.1, y: 0.1 }, scale: 0.8 },
    { type: 'motif', position: { x: 0.9, y: 0.1 }, scale: 0.7, rotation: 45 },
    { type: 'border', position: { x: 0.5, y: 0.94 }, scale: 1.1, color: '#FFD700' },
    { type: 'motif', position: { x: 0.1, y: 0.9 }, scale: 0.6, rotation: -45 },
    { type: 'motif', position: { x: 0.9, y: 0.9 }, scale: 0.6, rotation: 45 },
  ],
});

const seedTemplates = async () => {
  const templates = [
    {
      title: 'বিজয় দিবস - ক্লাসিক লাল-সবুজ',
      occasionType: 'victory' as const,
      thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/v1/posters/victory-classic-thumb.jpg',
      layoutConfig: createVictoryTemplate(),
      isActive: true,
    },
    {
      title: 'বিজয় দিবস - আধুনিক ডিজাইন',
      occasionType: 'victory' as const,
      thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/v1/posters/victory-modern-thumb.jpg',
      layoutConfig: {
        ...createVictoryTemplate(),
        photoSlots: [
          { x: 600, y: 100, width: 500, height: 600, shape: 'circle', order: 0 },
          { x: 100, y: 750, width: 300, height: 380, shape: 'rect', order: 1 },
          { x: 800, y: 750, width: 300, height: 380, shape: 'rect', order: 2 },
        ],
      },
      isActive: true,
    },
    {
      title: 'শোক ও স্মরণ - মিনিমাল ব্ল্যাক',
      occasionType: 'condolence' as const,
      thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/v1/posters/condolence-minimal-thumb.jpg',
      layoutConfig: createCondolenceTemplate(),
      isActive: true,
    },
    {
      title: 'শোক ও স্মরণ - সাদা ডাভের সাথেই',
      occasionType: 'condolence' as const,
      thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/v1/posters/condolence-dove-thumb.jpg',
      layoutConfig: {
        ...createCondolenceTemplate(),
        photoSlots: [
          { x: 600, y: 120, width: 400, height: 500, shape: 'circle', order: 0 },
          { x: 100, y: 700, width: 250, height: 320, shape: 'rect', order: 1 },
          { x: 850, y: 700, width: 250, height: 320, shape: 'rect', order: 2 },
        ],
      },
      isActive: true,
    },
    {
      title: 'নির্বাচনী প্রচার - ব্লু-অরেঞ্জ ডাইনামিক',
      occasionType: 'campaign' as const,
      thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/v1/posters/campaign-blue-orange-thumb.jpg',
      layoutConfig: createCampaignTemplate(),
      isActive: true,
    },
    {
      title: 'নির্বাচনী প্রচার - তিন ফটো গ্রিড',
      occasionType: 'campaign' as const,
      thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/v1/posters/campaign-grid-thumb.jpg',
      layoutConfig: {
        ...createCampaignTemplate(),
        photoSlots: [
          { x: 100, y: 100, width: 333, height: 450, shape: 'rect', order: 0 },
          { x: 434, y: 100, width: 333, height: 450, shape: 'rect', order: 1 },
          { x: 767, y: 100, width: 333, height: 450, shape: 'rect', order: 2 },
        ],
      },
      isActive: true,
    },
  ];

  for (const templateData of templates) {
    const existing = await Template.findOne({ title: templateData.title });
    if (!existing) {
      await Template.create(templateData);
      console.log(`Created template: ${templateData.title}`);
    } else {
      console.log(`Template already exists: ${templateData.title}`);
    }
  }
};

const main = async () => {
  try {
    await connectDB();
    await seedTemplates();
    console.log('Seeding completed!');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

main();