
export enum ViewMode {
  Dashboard = 'DASHBOARD',
  Metaphysics = 'METAPHYSICS', // 4 Core: Palm, Face, Bazi, Dream
  Western = 'WESTERN',         // Western Mysticism (Astrology, Tarot, Alchemy...)
  Divination = 'DIVINATION',   // Character Divination
  FengShui = 'FENGSHUI',       // AI Feng Shui
  Science = 'SCIENCE',         // Scientific Assessment
  Report = 'REPORT',           // Integrated Report
  Chat = 'CHAT',               // General Chat
  Live = 'LIVE',               // Live Voice
  About = 'ABOUT',             // About Developer & Guide
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  image?: string; // Base64 string
  isStreaming?: boolean;
  timestamp: number;
}

export interface LiveConfig {
  voiceName: string;
}

export interface AnalysisResults {
  palm?: string;
  face?: string;
  bazi?: string;
  dream?: string;
  western?: string;           // Western Metaphysics result
  fengshui?: string;
  divination?: string;
  science?: string;
  birthDate?: string;
  birthTime?: string;
  dailyGuidance?: string;     // Persisted daily guidance text
  dailyGuidanceDate?: string; // Date (YYYY-MM-DD) when guidance was generated
  lastUpdated: number;
}
