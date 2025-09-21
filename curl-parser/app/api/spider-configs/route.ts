import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '../../../lib/database';

export async function GET() {
  try {
    const configs = await DatabaseService.getSpiderConfigs();

    return NextResponse.json({
      success: true,
      data: configs
    });

  } catch (error) {
    console.error('获取爬虫配置失败:', error);
    return NextResponse.json(
      { error: '获取配置失败' },
      { status: 500 }
    );
  }
}
