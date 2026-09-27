export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isPremium?: boolean;
  createdAt: Date;
}

export interface TemplateLayoutConfig {
  dimensions: {
    width: number;
    height: number;
  };
  photoSlots: PhotoSlot[];
  textSlots: TextSlot[];
  backgroundConfig: BackgroundConfig;
  decorativeElements: DecorativeElement[];
}

export interface PhotoSlot {
  x: number;
  y: number;
  width: number;
  height: number;
  shape: 'rect' | 'circle';
  order: number;
}

export interface TextSlot {
  key: string;
  x: number;
  y: number;
  maxWidth: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  align: 'left' | 'center' | 'right';
  isBangla: boolean;
}

export interface BackgroundConfig {
  type: 'color' | 'image' | 'pattern' | 'gradient';
  value: string;
  opacity?: number;
}

export interface DecorativeElement {
  type: 'flag' | 'border' | 'motif' | 'dove' | 'rice-paddy' | 'custom';
  position: { x: number; y: number };
  scale: number;
  rotation?: number;
  opacity?: number;
  src?: string;
  color?: string;
}

export interface Template {
  _id: string;
  title: string;
  occasionType: 'victory' | 'condolence' | 'campaign' | 'greeting' | 'eid';
  thumbnailUrl: string;
  layoutConfig: TemplateLayoutConfig;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PosterFormData {
  name: string;
  designation: string;
  party: string;
  district: string;
  upazila: string;
  union: string;
  occasionType: string;
  headlineText: string;
  subHeadline?: string;
  layoutMode?: '1-up' | '2-up' | '3-up';
  fontFamily?: string;
}

export interface Poster {
  _id: string;
  userId: string;
  templateId: string;
  formData: PosterFormData;
  uploadedPhotoUrls: string[];
  generatedImageUrl?: string;
  status: 'draft' | 'generating' | 'completed' | 'failed';
  retryCount: number;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GenerationLog {
  _id: string;
  posterId: string;
  geminiPromptUsed: string;
  tokensUsed: number;
  latencyMs: number;
  success: boolean;
  createdAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type OccasionType = 'victory' | 'condolence' | 'campaign' | 'greeting' | 'eid';

export const OCCASION_LABELS: Record<OccasionType, string> = {
  victory: 'বিজয় দিবস',
  condolence: 'শোক/স্মরণ',
  campaign: 'নির্বাচনী প্রচার',
  greeting: 'শুভেচ্ছা',
  eid: 'ঈদ/উৎসব',
};

export const OCCASION_COLORS: Record<OccasionType, { primary: string; secondary: string; accent: string }> = {
  victory: { primary: '#C8102E', secondary: '#006A4E', accent: '#FFD700' },
  condolence: { primary: '#1A1A1A', secondary: '#4A4A4A', accent: '#C8102E' },
  campaign: { primary: '#0033A0', secondary: '#FF6B00', accent: '#FFFFFF' },
  greeting: { primary: '#E85D04', secondary: '#FFD700', accent: '#FFFFFF' },
  eid: { primary: '#006A4E', secondary: '#FFD700', accent: '#FFFFFF' },
};