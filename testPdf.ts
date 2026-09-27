import fs from 'fs';
import { renderPosterToPDF } from './src/services/renderer';

const test = async () => {
  try {
    const options = {
      templateLayout: {
        dimensions: { width: 1200, height: 1600 },
        photoSlots: [],
        textSlots: [],
        decorativeElements: [],
        backgroundConfig: { type: 'color', value: '#000' }
      },
      formData: {
        name: 'test',
        designation: 'test',
        party: 'test',
        district: 'test',
        upazila: 'test',
        union: 'test',
        occasionType: 'victory',
        headlineText: 'test',
      },
      photoUrls: [],
      occasionColors: { primary: '#000', secondary: '#111', accent: '#fff' }
    };
    try {
      const pdfBuffer = await renderPosterToPDF(options as any);
      fs.writeFileSync('test.pdf', pdfBuffer);
      console.log('PDF written successfully');
    } catch (e) {
      console.error("INNER ERROR:", e);
    }
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
};
test();
