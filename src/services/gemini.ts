import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config';

const genAI = new GoogleGenerativeAI(config.gemini.apiKey);

export interface GeminiLayoutSuggestion {
  colorAdjustments?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
  decorativeElements?: Array<{
    type: 'flag' | 'border' | 'motif' | 'dove' | 'rice-paddy';
    position: { x: number; y: number };
    scale: number;
    rotation?: number;
    opacity?: number;
  }>;
  photoAdjustments?: Array<{
    slotIndex: number;
    crop?: { x: number; y: number; width: number; height: number };
    filter?: string;
    borderColor?: string;
    borderWidth?: number;
  }>;
  textAdjustments?: Array<{
    slotKey: string;
    fontSize?: number;
    color?: string;
    fontWeight?: string;
    textShadow?: string;
  }>;
}

export const getLayoutSuggestions = async (
  templateLayout: any,
  formData: any,
  occasionType: string
): Promise<GeminiLayoutSuggestion> => {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
You are an expert Bangladeshi political poster designer. Given a template layout and user data, suggest visual adjustments.

TEMPLATE LAYOUT:
${JSON.stringify(templateLayout, null, 2)}

USER DATA:
- Name: ${formData.name}
- Designation: ${formData.designation}
- Party: ${formData.party}
- District: ${formData.district}
- Upazila: ${formData.upazila}
- Union: ${formData.union}
- Occasion: ${occasionType}
- Headline: ${formData.headlineText}
- Sub-headline: ${formData.subHeadline || 'N/A'}

OCCASION STYLE GUIDE:
- victory (বিজয় দিবস): Red/Green flag colors, gold accents, celebratory, flag motifs, doves, floral borders
- condolence (শোক/স্মরণ): Black/white/grey, subtle red, somber, dove motifs, minimal decoration
- campaign (নির্বাচনী প্রচার): Party colors, high contrast, dynamic, party symbols, bold text
- greeting (শুভেচ্ছা): Warm colors, festive, floral, decorative borders
- eid (ঈদ/উৎসব): Green/gold, Islamic motifs, crescent, stars, festive

Return ONLY valid JSON with suggested adjustments:
{
  "colorAdjustments": { "primary": "#hex", "secondary": "#hex", "accent": "#hex" },
  "decorativeElements": [
    { "type": "flag|border|motif|dove|rice-paddy", "position": { "x": 0-1, "y": 0-1 }, "scale": 0.5-2, "rotation": 0-360, "opacity": 0-1 }
  ],
  "photoAdjustments": [
    { "slotIndex": 0, "crop": { "x": 0-1, "y": 0-1, "width": 0-1, "height": 0-1 }, "filter": "grayscale|sepia|none", "borderColor": "#hex", "borderWidth": 0-10 }
  ],
  "textAdjustments": [
    { "slotKey": "headline", "fontSize": number, "color": "#hex", "fontWeight": "normal|bold", "textShadow": "2px 2px 4px rgba(0,0,0,0.5)" }
  ]
}

IMPORTANT: Return ONLY the JSON object, no markdown, no explanation.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('No valid JSON in response');
  } catch (error) {
    console.error('Gemini API error:', error);
    // Return default suggestions on failure
    return getDefaultSuggestions(occasionType);
  }
};

const getDefaultSuggestions = (occasionType: string): GeminiLayoutSuggestion => {
  const defaults: Record<string, GeminiLayoutSuggestion> = {
    victory: {
      colorAdjustments: { primary: '#C8102E', secondary: '#006A4E', accent: '#FFD700' },
      decorativeElements: [
        { type: 'flag', position: { x: 0.1, y: 0.1 }, scale: 0.8 },
        { type: 'border', position: { x: 0.5, y: 0.95 }, scale: 1.2 },
        { type: 'dove', position: { x: 0.8, y: 0.2 }, scale: 0.6 },
      ],
    },
    condolence: {
      colorAdjustments: { primary: '#1A1A1A', secondary: '#4A4A4A', accent: '#C8102E' },
      decorativeElements: [
        { type: 'dove', position: { x: 0.5, y: 0.15 }, scale: 0.7, opacity: 0.7 },
        { type: 'border', position: { x: 0.5, y: 0.95 }, scale: 1, opacity: 0.5 },
      ],
    },
    campaign: {
      colorAdjustments: { primary: '#0033A0', secondary: '#FF6B00', accent: '#FFFFFF' },
      decorativeElements: [
        { type: 'motif', position: { x: 0.1, y: 0.1 }, scale: 0.9 },
        { type: 'flag', position: { x: 0.9, y: 0.1 }, scale: 0.7 },
      ],
    },
  };
  return defaults[occasionType] || {};
};
