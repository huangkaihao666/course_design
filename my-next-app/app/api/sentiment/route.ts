import { NextRequest, NextResponse } from 'next/server';

interface Comment {
  user_nick: string;
  content: string;
  rating: number;
  date: string;
  useful_count: number;
  reply: string;
  sku_info: string;
  pics: string[];
}

interface SentimentResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  confidence: number;
}

interface CommentWithSentiment extends Comment {
  sentiment: SentimentResult;
}

export async function POST(request: NextRequest) {
  try {
    const { comments }: { comments: Comment[] } = await request.json();

    if (!comments || !Array.isArray(comments)) {
      return NextResponse.json(
        { error: '评论数据格式错误' },
        { status: 400 }
      );
    }

    // 对每条评论进行情感分析
    const commentsWithSentiment: CommentWithSentiment[] = comments.map(comment => ({
      ...comment,
      sentiment: analyzeSentiment(comment.content, comment.rating)
    }));

    // 统计数据
    const stats = generateStatistics(commentsWithSentiment);

    return NextResponse.json({
      success: true,
      data: {
        comments: commentsWithSentiment,
        statistics: stats
      }
    });
  } catch (error) {
    console.error('情感分析错误:', error);
    return NextResponse.json(
      { error: '情感分析失败' },
      { status: 500 }
    );
  }
}

// 简单的情感分析函数
function analyzeSentiment(content: string, rating: number): SentimentResult {
  // 正面词汇
  const positiveWords = [
    '好', '棒', '赞', '优秀', '满意', '推荐', '喜欢', '不错', '完美', '舒服',
    '实惠', '便宜', '值得', '超值', '快', '及时', '准时', '新鲜', '香', '甜',
    '软', '舒适', '漂亮', '美观', '精致', '高质量', '优质', '厚实', '结实'
  ];

  // 负面词汇
  const negativeWords = [
    '差', '坏', '糟糕', '失望', '后悔', '垃圾', '劣质', '难用', '不好', '破',
    '薄', '小', '少', '贵', '慢', '晚', '臭', '苦', '硬', '粗糙', '丑', '假',
    '骗', '欺骗', '退货', '投诉', '问题', '瑕疵', '缺陷', '漏', '裂', '坏了'
  ];

  let positiveScore = 0;
  let negativeScore = 0;

  // 计算正面词汇得分
  positiveWords.forEach(word => {
    const matches = (content.match(new RegExp(word, 'g')) || []).length;
    positiveScore += matches;
  });

  // 计算负面词汇得分
  negativeWords.forEach(word => {
    const matches = (content.match(new RegExp(word, 'g')) || []).length;
    negativeScore += matches;
  });

  // 考虑评分权重
  const ratingWeight = rating / 10; // 评分权重 (0-1)
  positiveScore += ratingWeight * 2; // 高评分增加正面得分

  if (rating <= 3) {
    negativeScore += 2; // 低评分增加负面得分
  }

  // 计算最终得分
  const totalScore = positiveScore + negativeScore;
  const normalizedScore = totalScore > 0 ? positiveScore / totalScore : 0.5;

  // 确定情感倾向
  let sentiment: 'positive' | 'negative' | 'neutral';
  let confidence: number;

  if (normalizedScore > 0.6) {
    sentiment = 'positive';
    confidence = Math.min(normalizedScore, 0.95);
  } else if (normalizedScore < 0.4) {
    sentiment = 'negative';
    confidence = Math.min(1 - normalizedScore, 0.95);
  } else {
    sentiment = 'neutral';
    confidence = 0.5;
  }

  return {
    sentiment,
    score: Math.round(normalizedScore * 100) / 100,
    confidence: Math.round(confidence * 100) / 100
  };
}

// 生成统计数据
function generateStatistics(comments: CommentWithSentiment[]) {
  const total = comments.length;
  const positive = comments.filter(c => c.sentiment.sentiment === 'positive').length;
  const negative = comments.filter(c => c.sentiment.sentiment === 'negative').length;
  const neutral = comments.filter(c => c.sentiment.sentiment === 'neutral').length;

  // 评分分布
  const ratingDistribution = {
    1: comments.filter(c => c.rating >= 1 && c.rating <= 2).length,
    2: comments.filter(c => c.rating >= 3 && c.rating <= 4).length,
    3: comments.filter(c => c.rating >= 5 && c.rating <= 6).length,
    4: comments.filter(c => c.rating >= 7 && c.rating <= 8).length,
    5: comments.filter(c => c.rating >= 9 && c.rating <= 10).length,
  };

  // 平均评分
  const averageRating = comments.reduce((sum, c) => sum + c.rating, 0) / total;

  // 情感分布
  const sentimentDistribution = {
    positive: Math.round((positive / total) * 100),
    negative: Math.round((negative / total) * 100),
    neutral: Math.round((neutral / total) * 100)
  };

  // 热门关键词
  const keywords = extractKeywords(comments);

  return {
    total,
    sentimentDistribution,
    ratingDistribution,
    averageRating: Math.round(averageRating * 10) / 10,
    keywords
  };
}

// 提取关键词
function extractKeywords(comments: CommentWithSentiment[]) {
  const wordCount: Record<string, number> = {};
  const stopWords = ['的', '了', '是', '在', '有', '和', '也', '都', '就', '我', '你', '他', '她', '它', '这', '那', '很', '非常', '比较', '还是', '一个', '可以', '没有', '不是', '不会', '会', '要', '去', '来', '上', '下', '好', '不好'];

  comments.forEach(comment => {
    // 简单的中文分词（基于常见词汇）
    const words = comment.content.match(/[\u4e00-\u9fa5]{2,4}/g) || [];
    
    words.forEach(word => {
      if (!stopWords.includes(word) && word.length >= 2) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });
  });

  // 返回前10个高频词
  return Object.entries(wordCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));
}
