import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '../../../lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'list';

    if (action === 'list') {
      // 获取商品列表，按批次分组
      const comments = await DatabaseService.getAllComments();
      const productMap = new Map();
      
      (comments as any[]).forEach((comment: any) => {
        const productId = comment.product_id;
        const batchId = comment.crawl_batch_id || 'legacy'; // 为NULL的批次ID使用'legacy'作为默认值
        const key = `${productId}_${batchId}`;
        
        if (!productMap.has(key)) {
          productMap.set(key, {
            product_id: productId,
            crawl_batch_id: batchId,
            product_name: comment.product_name,
            comment_count: 0,
            created_at: comment.created_at,
            batch_time: comment.created_at
          });
        }
        productMap.get(key).comment_count++;
      });

      const productList = Array.from(productMap.values())
        .sort((a, b) => new Date(b.batch_time).getTime() - new Date(a.batch_time).getTime());

      return NextResponse.json({
        success: true,
        data: productList
      });
    } else if (action === 'stats') {
      try {
        // 获取统计信息
        const stats = await DatabaseService.getCommentStats();
        
        // 获取情感分析统计
        const sentimentStats = await DatabaseService.getSentimentStats();
        
        // 获取评分分布
        const ratingDistribution = await DatabaseService.getRatingDistribution();
        
        // 获取商品类型统计
        const productTypes = await DatabaseService.getProductTypeStats();
        
        // 获取爬虫配置统计
        const configStats = await DatabaseService.getConfigStats();
        
        // 获取最近活动
        const recentActivity = await DatabaseService.getRecentActivity();

        return NextResponse.json({
          success: true,
          data: {
            ...stats,
            ...sentimentStats,
            ...ratingDistribution,
            ...productTypes,
            ...configStats,
            ...recentActivity
          }
        });
      } catch (error) {
        console.error('Stats API error:', error);
        return NextResponse.json({
          success: false,
          error: 'Failed to fetch stats: ' + (error instanceof Error ? error.message : String(error))
        }, { status: 500 });
      }
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid action parameter'
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
