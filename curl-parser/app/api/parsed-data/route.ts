import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '../../../lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    let data;
    if (productId) {
      // 根据商品ID获取特定数据
      data = await DatabaseService.getCurlParseByProductId(productId);
    } else {
      // 获取所有数据
      data = await DatabaseService.getAllCurlParses();
    }

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('获取解析数据失败:', error);
    return NextResponse.json(
      { error: '获取数据失败' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type'); // 'curl' or 'spider'

    if (!id) {
      return NextResponse.json(
        { error: '缺少ID参数' },
        { status: 400 }
      );
    }

    let result;
    if (type === 'spider') {
      result = await DatabaseService.deleteSpiderConfig(parseInt(id));
    } else {
      result = await DatabaseService.deleteCurlParse(parseInt(id));
    }

    if (result) {
      return NextResponse.json({
        success: true,
        message: '删除成功'
      });
    } else {
      return NextResponse.json(
        { error: '删除失败' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('删除数据失败:', error);
    return NextResponse.json(
      { error: '删除数据失败' },
      { status: 500 }
    );
  }
}
