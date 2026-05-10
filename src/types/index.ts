export type Purpose = 'learn' | 'research' | 'educational' | 'story' | 'other';

export interface SummarySection {
  title: string;
  items: string[];
}

export interface SummaryResult {
  videoId: string;
  thumbnail: string;
  title: string;
  channelName: string;
  purpose: Purpose;
  summary: string;
  keyTakeaways: string[];
  sections: SummarySection[];
  relatedTopics: string[];
  tags: string[];
  readTime: string;
  quote: string;
  wordCount: number;
}

export interface HistoryItem {
  id: string;
  videoId: string;
  thumbnail: string;
  title: string;
  channelName: string;
  purpose: Purpose;
  summary: string;
  tags: string[];
  createdAt: string;
}
