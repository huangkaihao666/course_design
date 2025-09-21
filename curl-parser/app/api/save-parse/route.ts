import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '../../../lib/database';

export async function POST(request: NextRequest) {
  try {
    const { parsedData, configName, configDescription } = await request.json();

    if (!parsedData || !parsedData.parsed || !parsedData.config) {
      return NextResponse.json(
        { error: '解析数据不完整' },
        { status: 400 }
      );
    }

    const { parsed, config } = parsedData;

    // 保存curl解析数据到数据库
    const curlParseId = await DatabaseService.saveCurlParse({
      productId: config.productId,
      url: parsed.url,
      method: parsed.method,
      cookies: config.cookies,
      headers: parsed.headers,
      queryParams: parsed.queryParams,
      requestBody: parsed.body,
      baseUrl: config.baseUrl
    });

    // 保存爬虫配置到数据库
    const spiderConfigId = await DatabaseService.saveSpiderConfig({
      curlParseId,
      productId: config.productId,
      cookies: config.cookies,
      maxPages: config.maxPages,
      pageSize: config.pageSize,
      headers: config.headers,
      baseUrl: config.baseUrl,
      apiParams: config.apiParams,
      configName,
      configDescription
    });

    return NextResponse.json({
      success: true,
      data: {
        curlParseId,
        spiderConfigId,
        message: '数据已成功保存到数据库'
      }
    });

  } catch (error) {
    console.error('保存解析数据到数据库失败:', error);
    return NextResponse.json(
      { error: '保存数据失败' },
      { status: 500 }
    );
  }
}
