import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../src/config/db';
import { Template, Poster } from '../src/models';
import { TemplateLayoutConfig } from 'shared/types';

const createVictoryTemplate = (): Partial<TemplateLayoutConfig> => ({
  dimensions: { width: 1200, height: 1600 },
  photoSlots: [
    // Main Photo (User) - Bottom Right Cutout - Massive size
    { x: 300, y: 700, width: 950, height: 1100, shape: 'rect', order: 0 },
    // Leader 1 - Top Left Circle
    { x: 80, y: 80, width: 280, height: 280, shape: 'circle', order: 1 },
    // Leader 2 - Top Left Secondary Circle
    { x: 380, y: 80, width: 200, height: 200, shape: 'circle', order: 2 },
  ],
  textSlots: [
    { key: 'headline', x: 600, y: 380, maxWidth: 1150, fontSize: 140, fontFamily: 'Anek Bangla', color: '#FFFFFF', align: 'center', isBangla: true },
    { key: 'subHeadline', x: 600, y: 540, maxWidth: 1000, fontSize: 50, fontFamily: 'Hind Siliguri', color: '#FFFFFF', align: 'center', isBangla: true },
    { key: 'name', x: 600, y: 1250, maxWidth: 1100, fontSize: 90, fontFamily: 'Anek Bangla', color: '#FFFFFF', align: 'center', isBangla: true },
    { key: 'designation', x: 600, y: 1350, maxWidth: 1100, fontSize: 45, fontFamily: 'Hind Siliguri', color: '#FFD700', align: 'center', isBangla: true },
    { key: 'party', x: 600, y: 1410, maxWidth: 1100, fontSize: 40, fontFamily: 'Hind Siliguri', color: '#FFFFFF', align: 'center', isBangla: true },
    { key: 'location', x: 600, y: 1470, maxWidth: 1100, fontSize: 30, fontFamily: 'Hind Siliguri', color: '#FFD700CC', align: 'center', isBangla: true },
  ],
  backgroundConfig: { type: 'gradient', value: 'radial-gradient(circle at center, #C8102E 0%, #7A0A1C 60%, #002211 100%)' },
  decorativeElements: [
    { type: 'rice-paddy', position: { x: 0.5, y: 0.9 }, scale: 1.5, opacity: 0.4 },
    { type: 'flag', position: { x: 0.85, y: 0.15 }, scale: 2, rotation: 10, opacity: 1 },
    { type: 'border', position: { x: 0.5, y: 0.95 }, scale: 1.2 },
    { type: 'dove', position: { x: 0.15, y: 0.75 }, scale: 1.2, opacity: 0.8 },
    { type: 'dove', position: { x: 0.85, y: 0.45 }, scale: 0.9, opacity: 0.7, rotation: -15 },
  ],
});

const createCondolenceTemplate = (): Partial<TemplateLayoutConfig> => ({
  dimensions: { width: 1200, height: 1600 },
  photoSlots: [
    // Main Photo - Bottom Center
    { x: 100, y: 700, width: 1000, height: 1000, shape: 'rect', order: 0 },
    // Leader 1 - Top Center
    { x: 450, y: 60, width: 300, height: 300, shape: 'circle', order: 1 },
    // Leader 2 - Top Right (Optional)
    { x: 880, y: 80, width: 220, height: 220, shape: 'circle', order: 2 },
  ],
  textSlots: [
    { key: 'headline', x: 600, y: 440, maxWidth: 1150, fontSize: 130, fontFamily: 'Anek Bangla', color: '#FFFFFF', align: 'center', isBangla: true },
    { key: 'subHeadline', x: 600, y: 580, maxWidth: 1000, fontSize: 45, fontFamily: 'Hind Siliguri', color: '#FFFFFF', align: 'center', isBangla: true },
    { key: 'name', x: 600, y: 1250, maxWidth: 1100, fontSize: 90, fontFamily: 'Anek Bangla', color: '#FFFFFF', align: 'center', isBangla: true },
    { key: 'designation', x: 600, y: 1350, maxWidth: 1100, fontSize: 45, fontFamily: 'Hind Siliguri', color: '#CCCCCC', align: 'center', isBangla: true },
    { key: 'party', x: 600, y: 1410, maxWidth: 1100, fontSize: 40, fontFamily: 'Hind Siliguri', color: '#FFFFFF', align: 'center', isBangla: true },
    { key: 'location', x: 600, y: 1470, maxWidth: 1100, fontSize: 30, fontFamily: 'Hind Siliguri', color: '#888888', align: 'center', isBangla: true },
  ],
  backgroundConfig: { type: 'gradient', value: 'radial-gradient(ellipse at center, #1A1A1A 0%, #050505 100%)' },
  decorativeElements: [
    { type: 'dove', position: { x: 0.2, y: 0.2 }, scale: 1.5, opacity: 0.5, rotation: 15 },
    { type: 'dove', position: { x: 0.8, y: 0.3 }, scale: 1.2, opacity: 0.4, rotation: -20 },
    { type: 'border', position: { x: 0.5, y: 0.95 }, scale: 1, opacity: 0.7, color: '#666666' },
  ],
});

const createCampaignTemplate = (): Partial<TemplateLayoutConfig> => ({
  dimensions: { width: 1200, height: 1600 },
  photoSlots: [
    // Main Photo - Left Aligned Large
    { x: -50, y: 650, width: 900, height: 1100, shape: 'rect', order: 0 },
    // Leader 1 - Top Right
    { x: 800, y: 80, width: 320, height: 320, shape: 'circle', order: 1 },
    // Leader 2 - Top Right below 1
    { x: 880, y: 450, width: 220, height: 220, shape: 'circle', order: 2 },
  ],
  textSlots: [
    { key: 'headline', x: 600, y: 320, maxWidth: 1150, fontSize: 150, fontFamily: 'Anek Bangla', color: '#FFFFFF', align: 'center', isBangla: true },
    { key: 'subHeadline', x: 600, y: 480, maxWidth: 1000, fontSize: 50, fontFamily: 'Hind Siliguri', color: '#FFFFFF', align: 'center', isBangla: true },
    { key: 'name', x: 600, y: 1250, maxWidth: 1100, fontSize: 90, fontFamily: 'Anek Bangla', color: '#FFFFFF', align: 'center', isBangla: true },
    { key: 'designation', x: 600, y: 1350, maxWidth: 1100, fontSize: 45, fontFamily: 'Hind Siliguri', color: '#FFD700', align: 'center', isBangla: true },
    { key: 'party', x: 600, y: 1410, maxWidth: 1100, fontSize: 40, fontFamily: 'Hind Siliguri', color: '#FFFFFF', align: 'center', isBangla: true },
    { key: 'location', x: 600, y: 1470, maxWidth: 1100, fontSize: 30, fontFamily: 'Hind Siliguri', color: '#FFD700CC', align: 'center', isBangla: true },
  ],
  backgroundConfig: { type: 'gradient', value: 'radial-gradient(circle at top left, #0033A0 0%, #001A50 40%, #FF4500 100%)' },
  decorativeElements: [
    { type: 'flag', position: { x: 0.15, y: 0.15 }, scale: 1.5, opacity: 0.9 },
    { type: 'border', position: { x: 0.5, y: 0.95 }, scale: 1.1, color: '#FFD700' },
  ],
});

const seedTemplates = async () => {
  // Clear existing templates
  console.log('Clearing old templates...');
  await Template.deleteMany({});
  
  const templates = [
    {
      title: 'বিজয় দিবস - ক্লাসিক লাল-সবুজ (প্রিমিয়াম)',
      occasionType: 'victory' as const,
      thumbnailUrl: 'https://placehold.co/600x800/C8102E/FFFFFF/png?text=Victory+Classic',
      layoutConfig: createVictoryTemplate(),
      isActive: true,
    },
    {
      title: 'বিজয় দিবস - আধুনিক ডিজাইন',
      occasionType: 'victory' as const,
      thumbnailUrl: 'https://placehold.co/600x800/006A4E/FFFFFF/png?text=Victory+Modern',
      layoutConfig: {
        ...createVictoryTemplate(),
        backgroundConfig: { type: 'gradient', value: 'linear-gradient(135deg, #006A4E 0%, #002211 100%)' },
        photoSlots: [
          { x: 300, y: 650, width: 950, height: 1150, shape: 'rect', order: 0 },
          { x: 100, y: 100, width: 320, height: 320, shape: 'circle', order: 1 },
        ],
      },
      isActive: true,
    },
    {
      title: 'শোক ও স্মরণ - মিনিমাল ব্ল্যাক',
      occasionType: 'condolence' as const,
      thumbnailUrl: 'https://placehold.co/600x800/0D0D0D/FFFFFF/png?text=Condolence+Black',
      layoutConfig: createCondolenceTemplate(),
      isActive: true,
    },
    {
      title: 'নির্বাচনী প্রচার - ব্লু-অরেঞ্জ ডাইনামিক',
      occasionType: 'campaign' as const,
      thumbnailUrl: 'https://placehold.co/600x800/0033A0/FFFFFF/png?text=Campaign+Dynamic',
      layoutConfig: createCampaignTemplate(),
      isActive: true,
    },
  ];

  for (const templateData of templates) {
    await Template.create(templateData);
    console.log(`Created template: ${templateData.title}`);
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