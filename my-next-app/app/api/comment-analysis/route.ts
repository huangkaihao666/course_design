import { NextRequest, NextResponse } from 'next/server';
import { AIBoxService } from '../../../lib/aibox-service';
import { CommentAnalysisRequest } from '../../types';

export async function POST(request: NextRequest) {
  try {
    const body: CommentAnalysisRequest = await request.json();
    
    // 验证必需字段
    if (!body.reviewBody) {
      return NextResponse.json({
        success: false,
        error: 'reviewBody is required'
      }, { status: 400 });
    }

    const aiboxService = AIBoxService.getInstance();
    const result = await aiboxService.analyzeCommentBoomReason(body);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Comment analysis API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Comment analysis failed'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Comment Analysis API',
    usage: {
      method: 'POST',
      endpoint: '/api/comment-analysis',
      body: {
        reviewBody: 'string (required) - 评论内容',
        avgPrice: 'string (optional) - 平均价格',
        cityName: 'string (optional) - 城市名称',
        dpPoiName: 'string (optional) - 门店名称',
        reviewCount: 'string (optional) - 评论数量',
        overallScore: 'string (optional) - 总体评分',
        platformName: 'string (optional) - 平台名称'
      },
      example: {
        reviewBody: '[薄荷]环境：很金属风格，现代感十足！\\n三明治非常好吃，满口牛肉\\n柠檬苏打也很好喝！喜欢！酸酸甜甜，在夏天喝起来太爽了！',
        avgPrice: '69.07612456747405',
        cityName: '上海',
        dpPoiName: 'BAsdBAN',
        reviewCount: '2258',
        overallScore: '50',
        platformName: 'dp'
      }
    }
  });
}
