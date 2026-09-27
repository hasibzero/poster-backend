import { TemplateLayoutConfig, PosterFormData } from 'shared/types';

interface RenderOptions {
  templateLayout: TemplateLayoutConfig;
  formData: PosterFormData;
  photoUrls: string[];
  geminiSuggestions?: any;
  occasionColors: { primary: string; secondary: string; accent: string };
}

let browser: any = null;

export const getBrowser = async (): Promise<any> => {
  if (!browser || !browser.isConnected()) {
    const puppeteer = (await import('puppeteer')).default || await import('puppeteer');
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
      ],
    });
  }
  return browser;
};

export const closeBrowser = async (): Promise<void> => {
  if (browser) {
    await browser.close();
    browser = null;
  }
};

const generatePosterHTML = (options: RenderOptions): string => {
  const { templateLayout, formData, photoUrls, geminiSuggestions, occasionColors } = options;
  const { dimensions, photoSlots, textSlots, backgroundConfig, decorativeElements } = templateLayout;
  
  const colors = geminiSuggestions?.colorAdjustments || occasionColors;
  const decorations = [...decorativeElements, ...(geminiSuggestions?.decorativeElements || [])];
  
  const width = dimensions.width;
  const height = dimensions.height;

  // Find text configurations
  const getTextProps = (key: string) => {
    const slot = textSlots.find(t => t.key === key);
    const adjustment = geminiSuggestions?.textAdjustments?.find((ta: any) => ta.slotKey === key) || {};
    return {
      fontSize: slot?.fontSize || 40,
      color: adjustment.color || slot?.color || '#FFFFFF',
      fontFamily: slot?.fontFamily || 'Hind Siliguri',
    };
  };

  const texts = {
    headline: getTextProps('headline'),
    subHeadline: getTextProps('subHeadline'),
    name: getTextProps('name'),
    designation: getTextProps('designation'),
    party: getTextProps('party'),
    location: getTextProps('location'),
  };

  const content = {
    headline: formData.headlineText || '',
    subHeadline: formData.subHeadline || '',
    name: formData.name || '',
    designation: formData.designation || '',
    party: formData.party || '',
    location: formData.district ? `${formData.union}, ${formData.upazila}, ${formData.district}` : '',
  };

  // Process Photos
  const mainPhotoSlot = photoSlots.find(p => p.order === 0);
  const mainPhotoUrl = mainPhotoSlot && photoUrls[0] ? photoUrls[0] : '';
  const leaderPhotosHTML = photoSlots
    .filter(p => p.order > 0)
    .map((slot, idx) => {
      // index in photoUrls array is order index. (main is 0, leader 1 is 1)
      const pUrl = photoUrls[slot.order];
      if (!pUrl) return '';
      return `
        <div class="leader-photo" style="
          position: absolute; 
          left: ${slot.x}px; 
          top: ${slot.y}px; 
          width: ${slot.width}px; 
          height: ${slot.height}px;
          border-radius: 50%;
          border: 12px solid ${colors.accent};
          box-shadow: 0 15px 35px rgba(0,0,0,0.8);
          overflow: hidden;
          z-index: 5;
        ">
          <img src="${pUrl}" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
      `;
    }).join('');

  // Background styling
  let backgroundStyle = '';
  if (backgroundConfig.type === 'color') {
    backgroundStyle = `background-color: ${backgroundConfig.value};`;
  } else if (backgroundConfig.type === 'gradient') {
    backgroundStyle = `background: ${backgroundConfig.value};`;
  }

  // Decorations
  const decorationsHTML = decorations.map((dec: any) => {
    const x = dec.position.x * width;
    const y = dec.position.y * height;
    const scale = dec.scale || 1;
    const rotation = dec.rotation || 0;
    const opacity = dec.opacity !== undefined ? dec.opacity : 1;
    let content = '';
    if (dec.type === 'flag') {
      content = `<div style="width: ${120 * scale}px; height: ${80 * scale}px; background: linear-gradient(135deg, ${colors.primary} 50%, ${colors.secondary} 50%); border: 4px solid ${colors.accent}; border-radius: 8px; box-shadow: 0 15px 30px rgba(0,0,0,0.8);"></div>`;
    } else if (dec.type === 'dove') {
      content = `<svg viewBox="0 0 100 100" style="width: ${80 * scale}px; height: ${80 * scale}px; fill: #FFFFFF; opacity: ${opacity};" transform="rotate(${rotation})"><path d="M50,10 Q30,30 20,50 Q30,40 50,60 Q70,40 80,50 Q70,30 50,10"/></svg>`;
    }
    return `<div style="position: absolute; left: ${x}px; top: ${y}px; transform: translate(-50%, -50%) rotate(${rotation}deg); z-index: 1;">${content}</div>`;
  }).join('');

  return `
<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Anek+Bangla:wght@800;900&family=Hind+Siliguri:wght@700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page {
      size: ${width}px ${height}px;
      margin: 0;
    }
    body { 
      width: ${width}px; 
      height: ${height}px; 
      background: #000;
      font-family: 'Hind Siliguri', sans-serif;
    }
    
    .poster-canvas {
      width: 100%;
      height: 100%;
      position: relative;
      ${backgroundStyle}
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .sunburst {
      position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
      background: repeating-conic-gradient(from 0deg, transparent 0deg 10deg, rgba(255,255,255,0.06) 10deg 20deg);
      z-index: 0;
    }
    .texture {
      position: absolute; inset: 0;
      background-image: radial-gradient(rgba(0,0,0,0.3) 2px, transparent 2px);
      background-size: 8px 8px; z-index: 1; opacity: 0.8; pointer-events: none;
    }

    /* Content Structure */
    .content-layer {
      position: relative;
      z-index: 10;
      flex: 1;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .header-region {
      text-align: center;
      padding-top: 140px;
      z-index: 15;
    }
    
    .headline-text {
      font-family: 'Anek Bangla', sans-serif;
      font-size: ${texts.headline.fontSize}px;
      color: ${texts.headline.color};
      font-weight: 900;
      text-shadow: 0px 4px 15px rgba(0,0,0,0.7);
      line-height: 1.1;
      padding: 0 40px;
    }

    .subheadline-ribbon {
      display: inline-block;
      margin-top: 30px;
      background: ${colors.primary};
      padding: 15px 60px;
      border-radius: 80px;
      border: 6px solid #FFF;
      box-shadow: 0 10px 20px rgba(0,0,0,0.6);
      font-size: ${texts.subHeadline.fontSize}px;
      color: ${texts.subHeadline.color};
      font-weight: 700;
      text-shadow: 0px 2px 8px rgba(0,0,0,0.5);
    }

    .hero-region {
      flex: 1;
      position: relative;
      display: flex;
      justify-content: center;
      align-items: flex-end;
      z-index: 5;
    }

    .main-portrait {
      max-width: 1100px;
      max-height: 100%;
      object-fit: contain;
      object-position: bottom;
      -webkit-mask-image: linear-gradient(to top, transparent 0%, black 15%, black 100%);
      mask-image: linear-gradient(to top, transparent 0%, black 15%, black 100%);
      filter: drop-shadow(0 0 30px rgba(0,0,0,0.6));
    }

    .footer-region {
      background: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 70%, rgba(0,0,0,0) 100%);
      text-align: center;
      padding: 80px 40px 60px 40px;
      position: relative;
      z-index: 20;
      min-height: 380px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      border-top: 5px solid rgba(255,215,0,0.3);
    }

    .prochare-badge {
      position: absolute;
      top: -35px;
      left: 50%;
      transform: translateX(-50%);
      background: #000;
      color: ${colors.accent};
      border: 3px solid ${colors.accent};
      padding: 8px 40px;
      border-radius: 50px;
      font-size: 32px;
      font-weight: 700;
      letter-spacing: 3px;
      box-shadow: 0 10px 20px rgba(0,0,0,0.8);
      z-index: 25;
    }

    .candidate-name {
      font-family: 'Anek Bangla', sans-serif;
      font-size: ${texts.name.fontSize}px;
      color: ${texts.name.color};
      font-weight: 900;
      text-shadow: 0px 4px 10px rgba(0,0,0,0.8);
      line-height: 1;
      margin-bottom: 20px;
    }

    .designation {
      font-size: ${texts.designation.fontSize}px;
      color: ${texts.designation.color};
      font-weight: 700;
      text-shadow: 0px 2px 8px rgba(0,0,0,0.8);
      margin-bottom: 10px;
    }

    .party {
      font-size: ${texts.party.fontSize}px;
      color: ${texts.party.color};
      font-weight: 700;
      text-shadow: 0px 2px 8px rgba(0,0,0,0.8);
      margin-bottom: 5px;
    }

    .location {
      font-size: ${texts.location.fontSize}px;
      color: ${texts.location.color};
      font-weight: 700;
      opacity: 0.9;
    }
  </style>
</head>
<body>
  <div class="poster-canvas">
    <div class="sunburst"></div>
    <div class="texture"></div>
    ${decorationsHTML}
    ${leaderPhotosHTML}

    <div class="content-layer">
      <!-- HEADER -->
      <div class="header-region">
        ${content.headline ? `<div class="headline-text">${content.headline}</div>` : ''}
        ${content.subHeadline ? `<div class="subheadline-ribbon">${content.subHeadline}</div>` : ''}
      </div>

      <!-- HERO PHOTO -->
      <div class="hero-region">
        ${mainPhotoUrl ? `<img src="${mainPhotoUrl}" class="main-portrait" />` : ''}
      </div>

      <!-- FOOTER -->
      <div class="footer-region">
        <div class="prochare-badge">প্রচারে</div>
        ${content.name ? `<div class="candidate-name">${content.name}</div>` : ''}
        ${content.designation ? `<div class="designation">${content.designation}</div>` : ''}
        ${content.party ? `<div class="party">${content.party}</div>` : ''}
        ${content.location ? `<div class="location">${content.location}</div>` : ''}
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

export const renderPosterToBuffer = async (options: RenderOptions): Promise<Buffer> => {
  const browser = await getBrowser();
  const page = await browser.newPage();
  
  try {
    const html = generatePosterHTML(options);
    const { dimensions } = options.templateLayout;
    
    await page.setViewport({ width: dimensions.width, height: dimensions.height, deviceScaleFactor: 2 });
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 });
    await page.evaluateHandle('document.fonts.ready');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const buffer = await page.screenshot({ 
      type: 'png', 
      clip: { x: 0, y: 0, width: dimensions.width, height: dimensions.height } 
    });
    return Buffer.from(buffer);
  } finally {
    await page.close();
  }
};

export const renderPosterToPDF = async (options: RenderOptions): Promise<Buffer> => {
  // First, generate the perfect PNG buffer
  const pngBuffer = await renderPosterToBuffer(options);
  
  // Dynamically import pdf-lib to prevent top-level Serverless crashes
  const { PDFDocument } = await import('pdf-lib');
  
  // Create a new PDF Document
  const pdfDoc = await PDFDocument.create();
  
  // Embed the PNG image bytes
  const pngImage = await pdfDoc.embedPng(pngBuffer);
  
  // Get width/height
  const { width, height } = pngImage.scale(1);
  
  // Add a blank page to the document matching the image dimensions
  const page = pdfDoc.addPage([width, height]);
  
  // Draw the PNG image on the page
  page.drawImage(pngImage, {
    x: 0,
    y: 0,
    width,
    height,
  });
  
  // Serialize the PDFDocument to bytes (a Uint8Array)
  const pdfBytes = await pdfDoc.save();
  
  // Return as Node Buffer
  return Buffer.from(pdfBytes);
};