import { TemplateLayoutConfig, PosterFormData } from '../../shared/types';

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
    if (process.env.VERCEL) {
      const puppeteer = (await import('puppeteer-core')).default || await import('puppeteer-core');
      const chromium = (await import('@sparticuz/chromium')).default || await import('@sparticuz/chromium');
      
      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      });
    } else {
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
  const photoAdjustments = geminiSuggestions?.photoAdjustments || [];
  const textAdjustments = geminiSuggestions?.textAdjustments || [];

  const width = dimensions.width;
  const height = dimensions.height;

  // Background styling
  let backgroundStyle = '';
  if (backgroundConfig.type === 'color') {
    backgroundStyle = `background-color: ${backgroundConfig.value};`;
  } else if (backgroundConfig.type === 'gradient') {
    backgroundStyle = `background: ${backgroundConfig.value};`;
  } else if (backgroundConfig.type === 'image') {
    backgroundStyle = `background-image: url(${backgroundConfig.value}); background-size: cover; background-position: center;`;
  }

  // Build content map from formData + textAdjustments
  const contentMap: Record<string, string> = {
    headline: formData.headlineText || '',
    subHeadline: formData.subHeadline || '',
    name: formData.name || '',
    designation: formData.designation || '',
    party: formData.party || '',
    location: formData.district ? `${formData.union}, ${formData.upazila}, ${formData.district}` : '',
    credit: `প্রচারে: ${formData.name}, ${formData.designation}, ${formData.party}`,
  };

  // Process Photo Slots
  const photosHTML = photoSlots.map((slot, index) => {
    const photoUrl = photoUrls[index] || '';
    const adjustment = photoAdjustments.find((pa: any) => pa.slotIndex === index) || {};
    const borderColor = adjustment.borderColor || colors.accent;
    const borderWidth = adjustment.borderWidth || 4;
    const filter = adjustment.filter || 'none';
    
    const x = slot.x;
    const y = slot.y;
    const w = slot.width;
    const h = slot.height;
    
    let shapeStyle = '';
    if (slot.shape === 'circle') {
      shapeStyle = 'border-radius: 50%;';
    }
    
    let objectFit = 'cover';
    if (adjustment.crop) {
      objectFit = 'cover';
    }

    return `
      <div class="photo-slot" style="
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        width: ${w}px;
        height: ${h}px;
        ${shapeStyle}
        border: ${borderWidth}px solid ${borderColor};
        box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        overflow: hidden;
        z-index: 5;
        filter: ${filter};
      ">
        ${photoUrl ? `<img src="${photoUrl}" alt="Photo ${index + 1}" style="width: 100%; height: 100%; object-fit: ${objectFit}; object-position: center;">` : `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #333; color: #666; font-size: 14px;">Photo ${index + 1}</div>`}
      </div>
    `;
  }).join('');

  // Process Text Slots
  const textsHTML = textSlots.map((slot) => {
    const adjustment = textAdjustments.find((ta: any) => ta.slotKey === slot.key) || {};
    const fontSize = adjustment.fontSize || slot.fontSize;
    const color = adjustment.color || slot.color;
    const fontWeight = adjustment.fontWeight || 'bold';
    const textShadow = adjustment.textShadow || `2px 2px 4px rgba(0,0,0,0.5)`;
    
    let text = contentMap[slot.key] || '';
    
    if (!text && slot.key !== 'credit') return '';
    
    return `
      <div class="text-slot" style="
        position: absolute;
        left: ${slot.x}px;
        top: ${slot.y}px;
        max-width: ${slot.maxWidth}px;
        font-size: ${fontSize}px;
        font-family: '${slot.fontFamily}', 'Noto Sans Bengali', 'Kalpurush', 'Hind Siliguri', sans-serif;
        color: ${color};
        text-align: ${slot.align};
        font-weight: ${fontWeight};
        text-shadow: ${textShadow};
        z-index: 10;
        ${slot.isBangla ? 'line-height: 1.3;' : ''}
        white-space: pre-wrap;
        word-wrap: break-word;
      ">${text}</div>
    `;
  }).join('');

  // Process Decorative Elements
  const decorationsHTML = decorations.map((dec: any) => {
    const x = dec.position.x * width;
    const y = dec.position.y * height;
    const scale = dec.scale || 1;
    const rotation = dec.rotation || 0;
    const opacity = dec.opacity !== undefined ? dec.opacity : 1;
    
    let content = '';
    if (dec.type === 'flag') {
      content = `<div style="width: ${120 * scale}px; height: ${80 * scale}px; background: linear-gradient(135deg, ${colors.primary} 50%, ${colors.secondary} 50%); border: 4px solid ${colors.accent}; border-radius: 8px; box-shadow: 0 15px 30px rgba(0,0,0,0.8);"></div>`;
    } else if (dec.type === 'border') {
      content = `<div style="width: ${width * 0.9 * scale}px; height: ${40 * scale}px; border-top: 4px solid ${colors.accent}; border-radius: 50%; opacity: ${opacity};"></div>`;
    } else if (dec.type === 'dove') {
      content = `<svg viewBox="0 0 100 100" style="width: ${80 * scale}px; height: ${80 * scale}px; fill: ${colors.accent}; opacity: ${opacity};" transform="rotate(${rotation})"><path d="M50,10 Q30,30 20,50 Q30,40 50,60 Q70,40 80,50 Q70,30 50,10"/></svg>`;
    } else if (dec.type === 'motif' && dec.src) {
      content = `<img src="${dec.src}" alt="motif" style="width: ${100 * scale}px; height: ${100 * scale}px; opacity: ${opacity};">`;
    } else if (dec.type === 'rice-paddy') {
      content = `<div style="width: ${width * scale}px; height: ${80 * scale}px; background: repeating-linear-gradient(90deg, ${colors.secondary} 0, ${colors.secondary} 2px, transparent 2px, transparent 4px); opacity: ${opacity};"></div>`;
    }
    
    return `<div class="decoration" style="position: absolute; left: ${x}px; top: ${y}px; transform: translate(-50%, -50%) rotate(${rotation}deg); opacity: ${opacity}; z-index: 1;">${content}</div>`;
  }).join('');

  // Font imports
  const fontImports = `
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700;800;900&family=Kalpurush&family=Hind+Siliguri:wght@400;500;600;700&display=swap" rel="stylesheet">
  `;

  return `
<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Political Poster</title>
  ${fontImports}
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
      overflow: hidden;
    }
    
    .poster-canvas {
      width: 100%;
      height: 100%;
      position: relative;
      ${backgroundStyle}
      overflow: hidden;
    }
    
    .photo-slot img { display: block; }
    
    .text-slot { 
      pointer-events: none; 
    }
    
    .decoration { 
      pointer-events: none; 
    }
  </style>
</head>
<body>
  <div class="poster-canvas">
    ${decorationsHTML}
    ${photosHTML}
    ${textsHTML}
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
  const pngBuffer = await renderPosterToBuffer(options);
  
  const { PDFDocument } = await import('pdf-lib');
  
  const pdfDoc = await PDFDocument.create();
  const pngImage = await pdfDoc.embedPng(pngBuffer);
  
  const { width, height } = pngImage.scale(1);
  const page = pdfDoc.addPage([width, height]);
  
  page.drawImage(pngImage, {
    x: 0,
    y: 0,
    width,
    height,
  });
  
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
};