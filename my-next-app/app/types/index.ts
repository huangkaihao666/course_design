export interface Comment {
  user_nick: string;
  content: string;
  rating: number;
  date: string;
  useful_count: number;
  reply: string;
  sku_info: string;
  pics: string[];
}

export interface SentimentResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  confidence: number;
}

export interface CommentWithSentiment extends Comment {
  sentiment: SentimentResult;
}

export interface Statistics {
  total: number;
  sentimentDistribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  averageRating: number;
  keywords: Array<{
    word: string;
    count: number;
  }>;
}

export interface AnalysisResult {
  comments: CommentWithSentiment[];
  statistics: Statistics;
}
