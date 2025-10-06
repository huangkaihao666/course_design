import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '../../../lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    
    let configs;
    if (productId) {
      configs = await DatabaseService.getSpiderConfigByProductId(productId);
    } else {
      configs = await DatabaseService.getSpiderConfigs();
    }
    
    return NextResponse.json({
      success: true,
      data: configs
    });
  } catch (error) {
    console.error('Spider configs API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, product_id, product_name, cookies, max_pages, page_size, config_name, config_description } = body;

    if (!product_id || !product_name || !cookies) {
      return NextResponse.json({
        success: false,
        error: 'product_id, product_name, and cookies are required'
      }, { status: 400 });
    }

    await DatabaseService.saveSpiderConfig(body);

    return NextResponse.json({
      success: true,
      message: id ? '配置更新成功' : '配置保存成功'
    });
  } catch (error) {
    console.error('Spider configs POST error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'id parameter is required'
      }, { status: 400 });
    }

    await DatabaseService.deleteSpiderConfig(parseInt(id));

    return NextResponse.json({
      success: true,
      message: '配置删除成功'
    });
  } catch (error) {
    console.error('Spider configs DELETE error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
