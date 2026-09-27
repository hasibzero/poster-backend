import dotenv from 'dotenv';
dotenv.config();
import { connectDB, disconnectDB } from './src/config/db';
import { renderPosterToBuffer } from './src/services/renderer';
import { Template } from './src/models/Template';
import fs from 'fs';
import path from 'path';

const generateAllPosters = async () => {
  try {
    await connectDB();

    const templates = await Template.find({});
    console.log(`Found ${templates.length} templates`);

    for (let i = 0; i < templates.length; i++) {
      const template = templates[i];
      console.log(`Generating poster for: ${template.title}`);

      // Setup some default dummy data matching the occasion type
      let occasionColors = { primary: '#C8102E', secondary: '#006A4E', accent: '#FFD700' };
      if (template.occasionType === 'condolence') {
        occasionColors = { primary: '#111111', secondary: '#333333', accent: '#FFFFFF' };
      } else if (template.occasionType === 'campaign') {
        occasionColors = { primary: '#0047AB', secondary: '#FF8C00', accent: '#FFFFFF' };
      }

      const options = {
        templateLayout: template.layoutConfig,
        formData: {
          name: 'মো: হাসিবুর রহমান',
          designation: 'সভাপতি, ধানমন্ডি শাখা',
          party: 'বাংলাদেশ আওয়ামী লীগ',
          union: 'ধানমন্ডি',
          upazila: 'ঢাকা',
          district: 'ঢাকা',
          occasionType: template.occasionType,
          headlineText: template.occasionType === 'condolence' ? 'গভীর শোক ও সমবেদনা' : (template.occasionType === 'campaign' ? 'আসন্ন নির্বাচনে ভোট দিন' : 'মহান বিজয় দিবস'),
          subHeadline: template.occasionType === 'condolence' ? 'অকালে চলে গেলেন' : (template.occasionType === 'campaign' ? 'উন্নয়নের মার্কা' : 'শুভেচ্ছা ও অভিনন্দন'),
        },
        photoUrls: [
          'https://placehold.co/800x1000/png',
          'https://placehold.co/300x300/png'
        ],
        occasionColors,
      };

      const buffer = await renderPosterToBuffer(options as any);
      
      // Save to artifacts directory so we can embed them
      const outPath = path.join('C:\\Users\\hasib\\.gemini\\antigravity\\brain\\36b9f9f4-be60-49e0-8031-6d6659d43c4c', `poster_${i + 1}.png`);
      fs.writeFileSync(outPath, buffer);
      console.log(`Saved ${outPath}`);
    }

  } catch (err) {
    console.error(err);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

generateAllPosters();
