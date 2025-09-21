import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '../../../lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const type = searchParams.get('type') || 'all'; // all, configs, stats

    let data;
    
    switch (type) {
      case 'configs':
        if (productId) {
          data = await DatabaseService.getSpiderConfigByProductId(productId);
        } else {
          data = await DatabaseService.getSpiderConfigs();
        }
        break;
      case 'stats':
        data = await DatabaseService.getParseStats();
        break;
      case 'products':
        data = await DatabaseService.getAllProductIds();
        break;
      case 'latest':
        data = await DatabaseService.getLatestSpiderConfig();
        break;
      case 'comments':
        if (productId) {
          data = await DatabaseService.getCommentsByProductId(productId);
        } else {
          data = await DatabaseService.getAllComments();
        }
        break;
      case 'comment-stats':
        data = await DatabaseService.getCommentStats();
        break;
      default:
        if (productId) {
          data = await DatabaseService.getCurlParseByProductId(productId);
        } else {
          data = await DatabaseService.getAllCurlParses();
        }
    }

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('获取curl数据失败:', error);
    return NextResponse.json(
      { error: '获取数据失败' },
      { status: 500 }
    );
  }
}
