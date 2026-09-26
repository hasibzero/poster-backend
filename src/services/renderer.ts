import puppeteer from 'puppeteer';
import { config } from '../config';
import { TemplateLayoutConfig, PosterFormData } from 'shared/types';

interface RenderOptions {
  templateLayout: TemplateLayoutConfig;
  formData: PosterFormData;
  photoUrls: string[];
  geminiSuggestions?: any;
  occasionColors: { primary: string; secondary: string; accent: string };
}

let browser: puppeteer.Browser | null = null;

export const getBrowser = async (): Promise<puppeteer.Browser> => {
  if (!browser || !browser.isConnected()) {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
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
  
  // Merge Gemini suggestions
  const colors = geminiSuggestions?.colorAdjustments || occasionColors;
  const decorations = [...decorativeElements, ...(geminiSuggestions?.decorativeElements || [])];
  const photoAdjustments = geminiSuggestions?.photoAdjustments || [];
  const textAdjustments = geminiSuggestions?.textAdjustments || [];

  const width = dimensions.width;
  const height = dimensions.height;

  // Background
  let backgroundStyle = '';
  if (backgroundConfig.type === 'color') {
    backgroundStyle = `background-color: ${backgroundConfig.value};`;
  } else if (backgroundConfig.type === 'gradient') {
    backgroundStyle = `background: ${backgroundConfig.value};`;
  } else if (backgroundConfig.type === 'image') {
    backgroundStyle = `background-image: url(${backgroundConfig.value}); background-size: cover; background-position: center;`;
  }

  // Generate decorative elements HTML
  const decorationsHTML = decorations.map((dec: any, index: number) => {
    const x = dec.position.x * width;
    const y = dec.position.y * height;
    const scale = dec.scale || 1;
    const rotation = dec.rotation || 0;
    const opacity = dec.opacity !== undefined ? dec.opacity : 1;
    
    let content = '';
    if (dec.type === 'flag') {
      content = `<div class="flag-motif" style="width: ${100 * scale}px; height: ${60 * scale}px; background: linear-gradient(180deg, ${colors.primary} 50%, ${colors.secondary} 50%); clip-path: polygon(0 0, 100% 0, 100% 50%, 60% 50%, 100% 50%, 100% 100%, 0 100%);"></div>`;
    } else if (dec.type === 'border') {
      content = `<div class="floral-border" style="width: ${width * 0.9 * scale}px; height: ${40 * scale}px; border-top: 3px solid ${colors.accent}; position: relative;"></div>`;
    } else if (dec.type === 'dove') {
      content = `<svg class="dove" viewBox="0 0 100 100" style="width: ${50 * scale}px; height: ${50 * scale}px; fill: ${colors.accent}; opacity: ${opacity};" transform="rotate(${rotation})"><path d="M50,10 Q30,30 20,50 Q30,40 50,60 Q70,40 80,50 Q70,30 50,10"/></svg>`;
    } else if (dec.type === 'rice-paddy') {
      content = `<div class="rice-paddy" style="width: ${width * scale}px; height: ${80 * scale}px; background: repeating-linear-gradient(90deg, ${colors.secondary} 0, ${colors.secondary} 2px, transparent 2px, transparent 4px); opacity: ${opacity};"></div>`;
    } else if (dec.type === 'motif' && dec.src) {
      content = `<img src="${dec.src}" alt="motif" style="width: ${100 * scale}px; height: ${100 * scale}px; opacity: ${opacity};">`;
    }
    
    return `<div class="decoration" style="position: absolute; left: ${x}px; top: ${y}px; transform: translate(-50%, -50%) rotate(${rotation}deg); opacity: ${opacity}; z-index: 1;">${content}</div>`;
  }).join('');

  // Generate photo slots HTML
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
    
    let cropStyle = '';
    if (adjustment.crop) {
      // CSS object-fit crop simulation
      cropStyle = `object-fit: cover;`;
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
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        overflow: hidden;
        z-index: 5;
        filter: ${filter};
      ">
        ${photoUrl ? `<img src="${photoUrl}" alt="Photo ${index + 1}" style="width: 100%; height: 100%; ${cropStyle} object-position: center;">` : `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #eee; color: #999; font-size: 14px;">Photo ${index + 1}</div>`}
      </div>
    `;
  }).join('');

  // Generate text slots HTML
  const textsHTML = textSlots.map((slot) => {
    const adjustment = textAdjustments.find((ta: any) => ta.slotKey === slot.key) || {};
    const fontSize = adjustment.fontSize || slot.fontSize;
    const color = adjustment.color || slot.color;
    const fontWeight = adjustment.fontWeight || 'bold';
    const textShadow = adjustment.textShadow || `2px 2px 4px rgba(0,0,0,0.5)`;
    
    let text = '';
    switch (slot.key) {
      case 'headline':
        text = formData.headlineText;
        break;
      case 'subHeadline':
        text = formData.subHeadline || '';
        break;
      case 'name':
        text = formData.name;
        break;
      case 'designation':
        text = formData.designation;
        break;
      case 'party':
        text = formData.party;
        break;
      case 'location':
        text = `${formData.union}, ${formData.upazila}, ${formData.district}`;
        break;
      case 'credit':
        text = `প্রচারে: ${formData.name}, ${formData.designation}, ${formData.party}`;
        break;
      default:
        text = '';
    }
    
    if (!text) return '';
    
    return `
      <div class="text-slot" style="
        position: absolute;
        left: ${slot.x}px;
        top: ${slot.y}px;
        max-width: ${slot.maxWidth}px;
        font-size: ${fontSize}px;
        font-family: '${slot.fontFamily}', 'Noto Sans Bengali', 'Kalpurush', sans-serif;
        color: ${color};
        text-align: ${slot.align};
        font-weight: ${fontWeight};
        text-shadow: ${textShadow};
        z-index: 10;
        ${slot.isBangla ? 'line-height: 1.3;' : ''}
      ">${text}</div>
    `;
  }).join('');

  // Footer credit bar
  const footerHeight = 80;
  const footerY = height - footerHeight;

  return `
<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Political Poster</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700;800;900&family=Kalpurush&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { width: ${width}px; height: ${height}px; overflow: hidden; font-family: 'Noto Sans Bengali', 'Kalpurush', sans-serif; }
    .poster-container { width: 100%; height: 100%; position: relative; ${backgroundStyle} }
    .footer-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: ${footerHeight}px;
      background: linear-gradient(180deg, transparent, ${colors.primary}DD);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 40px;
      z-index: 20;
    }
    .footer-text {
      color: white;
      font-size: 20px;
      font-weight: 600;
      text-align: center;
      text-shadow: 1px 1px 3px rgba(0,0,0,0.8);
      font-family: 'Noto Sans Bengali', 'Kalpurush', sans-serif;
    }
    .party-symbol {
      position: absolute;
      top: 30px;
      right: 30px;
      width: 80px;
      height: 80px;
      z-index: 15;
    }
  </style>
</head>
<body>
  <div class="poster-container">
    ${decorationsHTML}
    ${photosHTML}
    ${textsHTML}
    <div class="footer-bar">
      <div class="footer-text">প্রচারে: ${formData.name}, ${formData.designation}, ${formData.party}</div>
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
    
    await page.setViewport({
      width: dimensions.width,
      height: dimensions.height,
      deviceScaleFactor: 2, // High DPI for print quality
    });
    
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 });
    
    // Wait for fonts to load
    await page.evaluateHandle('document.fonts.ready');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const buffer = await page.screenshot({
      type: 'png',
      fullPage: true,
      omitBackground: false,
    });
    
    return Buffer.from(buffer);
  } finally {
    await page.close();
  }
};

export const renderPosterToPDF = async (options: RenderOptions): Promise<Buffer> => {
  const browser = await getBrowser();
  const page = await browser.newPage();
  
  try {
    const html = generatePosterHTML(options);
    const { dimensions } = options.templateLayout;
    
    await page.setViewport({
      width: dimensions.width,
      height: dimensions.height,
      deviceScaleFactor: 2,
    });
    
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 });
    await page.evaluateHandle('document.fonts.ready');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const buffer = await page.pdf({
      width: `${dimensions.width}px`,
      height: `${dimensions.height}px`,
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });
    
    return Buffer.from(buffer);
  } finally {
    await page.close();
  }
};