import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '../../../lib/database';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 开始自动同步商品名称...');
    
    // 执行同步SQL：将spider_configs表中的商品名称同步到comments表
    const connection = await DatabaseService.getConnection();
    
    try {
      // 更新comments表中product_name为空的记录
      const [updateResult] = await connection.execute(`
        UPDATE comments c
        INNER JOIN spider_configs sc ON c.product_id = sc.product_id
        SET c.product_name = sc.product_name
        WHERE (c.product_name IS NULL OR c.product_name = '') 
        AND sc.product_name IS NOT NULL 
        AND sc.product_name != ''
      `);
      
      const updatedRows = (updateResult as any).affectedRows || 0;
      console.log(`✅ 已更新 ${updatedRows} 条评论记录的商品名称`);
      
      // 将仍然为空的商品名称设置为'其他'
      const [defaultResult] = await connection.execute(`
        UPDATE comments 
        SET product_name = '其他'
        WHERE product_name IS NULL OR product_name = ''
      `);
      
      const defaultRows = (defaultResult as any).affectedRows || 0;
      console.log(`✅ 已将 ${defaultRows} 条记录的商品名称设置为'其他'`);
      
      return NextResponse.json({
        success: true,
        updatedCount: updatedRows,
        defaultCount: defaultRows,
        message: `同步完成：更新了 ${updatedRows} 条记录，设置了 ${defaultRows} 条默认值`
      });
      
    } finally {
      connection.release();
    }
    
  } catch (error) {
    console.error('自动同步商品名称失败:', error);
    return NextResponse.json({
      success: false,
      error: '同步失败: ' + (error instanceof Error ? error.message : String(error))
    }, { status: 500 });
  }
}
