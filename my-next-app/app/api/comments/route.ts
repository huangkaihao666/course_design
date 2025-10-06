import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '../../../lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const batchId = searchParams.get('batchId');

    if (!productId) {
      return NextResponse.json({
        success: false,
        error: 'productId parameter is required'
      }, { status: 400 });
    }

    let comments;
    if (batchId) {
      if (batchId === 'legacy') {
        // 处理legacy数据（批次ID为NULL的记录）
        comments = await DatabaseService.getCommentsByProductId(productId);
      } else {
        // 按批次ID获取评论
        comments = await DatabaseService.getCommentsByBatchId(productId, batchId);
      }
    } else {
      // 获取该商品的所有评论
      comments = await DatabaseService.getCommentsByProductId(productId);
    }
    
    return NextResponse.json({
      success: true,
      data: comments
    });
  } catch (error) {
    console.error('Comments API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
