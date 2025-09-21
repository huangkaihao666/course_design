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

// AIBox 工作流相关类型定义
export interface AIBoxRequest {
  botKey: string;
  humanId: string;
  workflowKey: string;
  ext: Record<string, any>;
  token: string;
}

export interface AIBoxResponse {
  success: boolean;
  data?: any;
  error?: string;
  llmErrorCode?: string | number;
}

export interface AIBoxWorkflowConfig {
  botKey: string;
  workflowKey: string;
  humanId: string;
  token: string;
}

export interface CommentAnalysisRequest {
  reviewBody: string;
  avgPrice?: string;
  cityName?: string;
  dpPoiName?: string;
  reviewCount?: string;
  overallScore?: string;
  platformName?: string;
}

export interface CommentAnalysisResult {
  tag: string;
  reason: string;
}
