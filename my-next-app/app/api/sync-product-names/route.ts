import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '../../../lib/database';

export async function POST(request: NextRequest) {
  try {
    // 获取所有spider_configs中的商品信息
    const configs = await DatabaseService.getSpiderConfigs();
    
    let updatedCount = 0;
    for (const config of configs as any[]) {
      if (config.product_name && config.product_name.trim() !== '') {
        // 更新comments表中对应商品的product_name
        await DatabaseService.updateCommentsProductName(config.product_id, config.product_name);
        updatedCount++;
      }
    }
    
    // 对于没有在spider_configs中的商品，设置为"其他"
    await DatabaseService.updateEmptyProductNames();
    
    return NextResponse.json({
      success: true,
      message: `已同步 ${updatedCount} 个商品的名称`,
      updatedCount
    });
  } catch (error) {
    console.error('Sync product names API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
