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
  content: string;
  product_name: string;
  rating: string;
  user_nick: string;
  date: string;
  sku_info: string;
  useful_count: string;
  reply: string;
  prompt: string;
}

export interface CommentAnalysisResult {
  tag: string;
  reason: string;
}

// AI工作流分析结果类型
export interface SentimentAnalysisResult {
  emotion_type: 'positive' | 'negative' | 'neutral';
  confidence_score: number;
  emotion_intensity: 'high' | 'medium' | 'low';
  key_emotions: string[];
  analysis_reasons: string;
  key_points: string[];
  improvement_suggestions: string;
  overall_assessment: string;
}

export interface BoomReasonAnalysisResult {
  tag: string;
  reason: string;
}

export interface CommentWithAnalysis {
  id?: number;
  product_id: string;
  product_name: string;
  user_nick: string;
  content: string;
  rating: number;
  date: string;
  useful_count: number;
  reply: string;
  sku_info: string;
  pics: string[];
  created_at?: string;
  updated_at?: string;
  analysis?: SentimentAnalysisResult | BoomReasonAnalysisResult;
  analysisError?: string;
  analysisType?: 'sentiment_analysis' | 'boom_reason';
}
