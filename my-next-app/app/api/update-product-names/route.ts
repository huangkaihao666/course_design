import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '../../../lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({
        success: false,
        error: 'productId is required'
      }, { status: 400 });
    }

    // 获取该商品的所有爬取记录
    const records = await DatabaseService.getSpiderConfigByProductId(productId);
    
    // 更新没有商品名称的记录
    let updatedCount = 0;
    for (const record of records as any[]) {
      if (!record.product_name || record.product_name.trim() === '') {
        // 更新为"其他"
        await DatabaseService.updateSpiderConfigProductName(record.id, '其他');
        updatedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `已更新 ${updatedCount} 条记录的商品名称`,
      updatedCount
    });
  } catch (error) {
    console.error('Update product names API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
