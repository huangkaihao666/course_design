import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '../../../lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({
        success: false,
        error: 'productId parameter is required'
      }, { status: 400 });
    }

    const comments = await DatabaseService.getCommentsByProductId(productId);
    
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
