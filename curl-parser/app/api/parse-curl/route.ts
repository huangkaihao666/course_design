
import { NextRequest, NextResponse } from 'next/server';
import { ParsedCurl, TaobaoApiParams, SpiderConfig } from '../../types';

export async function POST(request: NextRequest) {
  try {
    const { curlCommand }: { curlCommand: string } = await request.json();

    if (!curlCommand) {
      return NextResponse.json(
        { error: 'curl命令不能为空' },
        { status: 400 }
      );
    }

    const parsedCurl = parseCurlCommand(curlCommand);
    const config = extractSpiderConfig(parsedCurl);

    return NextResponse.json({
      success: true,
      data: {
        parsed: parsedCurl,
        config: config
      }
    });
  } catch (error) {
    console.error('解析curl命令错误:', error);
    return NextResponse.json(
      { error: '解析curl命令失败' },
      { status: 500 }
    );
  }
}

function parseCurlCommand(curlCommand: string): ParsedCurl {
  // 清理命令，移除换行符和多余空格
  const cleanCommand = curlCommand
    .replace(/\\\s*\n\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // 提取URL
  const urlMatch = cleanCommand.match(/curl\s+['"]([^'"]+)['"]/);
  if (!urlMatch) {
    throw new Error('无法提取URL');
  }
  
  const url = urlMatch[1];
  const urlObj = new URL(url);

  // 提取查询参数
  const queryParams: Record<string, string> = {};
  urlObj.searchParams.forEach((value, key) => {
    queryParams[key] = value;
  });

  // 提取请求头
  const headers: Record<string, string> = {};
  const headerRegex = /-H\s+['"]([^'"]+)['"]/g;
  let headerMatch;
  while ((headerMatch = headerRegex.exec(cleanCommand)) !== null) {
    const headerStr = headerMatch[1];
    const colonIndex = headerStr.indexOf(':');
    if (colonIndex > 0) {
      const key = headerStr.substring(0, colonIndex).trim();
      const value = headerStr.substring(colonIndex + 1).trim();
      headers[key] = value;
    }
  }

  // 提取cookies
  const cookies: Record<string, string> = {};
  const cookieMatch = cleanCommand.match(/-b\s+['"]([^'"]+)['"]/);
  if (cookieMatch) {
    const cookieStr = cookieMatch[1];
    cookieStr.split(';').forEach(cookie => {
      const [key, ...valueParts] = cookie.split('=');
      if (key && valueParts.length > 0) {
        cookies[key.trim()] = valueParts.join('=').trim();
      }
    });
  }

  // 提取请求体
  let body: string | undefined;
  const bodyMatch = cleanCommand.match(/-d\s+['"]([^'"]+)['"]/);
  if (bodyMatch) {
    body = bodyMatch[1];
  }

  return {
    url: urlObj.origin + urlObj.pathname,
    method: cleanCommand.includes('-X POST') || cleanCommand.includes('--data') ? 'POST' : 'GET',
    headers,
    cookies,
    body,
    queryParams
  };
}

function extractSpiderConfig(parsed: ParsedCurl): SpiderConfig {
  // 解析data参数中的JSON
  let apiParams: TaobaoApiParams = {
    auctionNumId: '',
    pageNo: 1,
    pageSize: 20,
    orderType: '',
    searchImpr: '-8',
    expression: '',
    skuVids: '',
    rateSrc: 'pc_rate_list',
    rateType: '',
    showTrueCount: false
  };

  if (parsed.queryParams.data) {
    try {
      const decodedData = decodeURIComponent(parsed.queryParams.data);
      const dataObj = JSON.parse(decodedData);
      
      apiParams = {
        auctionNumId: dataObj.auctionNumId || '',
        pageNo: dataObj.pageNo || 1,
        pageSize: dataObj.pageSize || 20,
        orderType: dataObj.orderType || '',
        searchImpr: dataObj.searchImpr || '-8',
        expression: dataObj.expression || '',
        skuVids: dataObj.skuVids || '',
        rateSrc: dataObj.rateSrc || 'pc_rate_list',
        rateType: dataObj.rateType || '',
        showTrueCount: dataObj.showTrueCount || false
      };
    } catch (error) {
      console.warn('解析data参数失败:', error);
    }
  }

  // 构建cookies字符串
  const cookieString = Object.entries(parsed.cookies)
    .map(([key, value]) => `${key}=${value}`)
    .join('; ');

  return {
    productId: apiParams.auctionNumId,
    cookies: cookieString,
    maxPages: 3,
    pageSize: apiParams.pageSize,
    headers: parsed.headers,
    baseUrl: parsed.url,
    apiParams: apiParams
  };
}
