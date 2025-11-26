export enum OutfitStyle {
  CASUAL = 'Casual',
  BUSINESS = 'Business',
  NIGHT_OUT = 'Night Out',
  SPORTY = 'Sporty',
  FORMAL = 'Formal'
}

export interface GeneratedImage {
  id: string;
  url: string;
  videoUrl?: string; // URL for the generated video (blob URL)
  description: string;
  style?: OutfitStyle;
  isOriginal: boolean;
}

export interface GenerationState {
  isGenerating: boolean;
  error: string | null;
}

export enum EditorMode {
  VIEW = 'VIEW',
  EDIT = 'EDIT'
}