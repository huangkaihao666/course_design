import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

interface Comment {
  user_nick: string;
  content: string;
  rating: number;
  date: string;
  useful_count: number;
  reply: string;
  sku_info: string;
  pics: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { productId, maxPages = 3 } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: '商品ID不能为空' },
        { status: 400 }
      );
    }

    // Python爬虫脚本路径
    const spiderPath = path.join(process.cwd(), '..', 'pachong', 'spider.py');
    const outputDir = path.join(process.cwd(), '..', 'pachong', 'output');

    // 执行Python爬虫
    const result = await runSpider(spiderPath, productId, maxPages);

    if (result.success) {
      // 读取爬取的数据
      const comments = await readLatestComments(outputDir, productId);
      
      return NextResponse.json({
        success: true,
        data: comments,
        message: `成功爬取 ${comments.length} 条评论`
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

// 获取已爬取的评论数据
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: '商品ID不能为空' },
        { status: 400 }
      );
    }

    const outputDir = path.join(process.cwd(), '..', 'pachong', 'output');
    const comments = await readLatestComments(outputDir, productId);

    return NextResponse.json({
      success: true,
      data: comments,
      message: `找到 ${comments.length} 条评论`
    });
  } catch (error) {
    console.error('获取评论错误:', error);
    return NextResponse.json(
      { error: '获取评论失败' },
      { status: 500 }
    );
  }
}

// 运行Python爬虫
function runSpider(spiderPath: string, productId: string, maxPages: number): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    const pythonProcess = spawn('python3', [spiderPath], {
      env: {
        ...process.env,
        PRODUCT_ID: productId,
        MAX_PAGES: maxPages.toString()
      }
    });

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true });
      } else {
        resolve({ 
          success: false, 
          error: errorOutput || '爬虫执行失败' 
        });
      }
    });

    // 设置超时
    setTimeout(() => {
      pythonProcess.kill();
      resolve({ 
        success: false, 
        error: '爬虫执行超时' 
      });
    }, 60000); // 60秒超时
  });
}

// 读取最新的评论文件
async function readLatestComments(outputDir: string, productId: string): Promise<Comment[]> {
  try {
    const files = fs.readdirSync(outputDir);
    const commentFiles = files
      .filter(file => file.includes(productId) && file.endsWith('.json'))
      .sort((a, b) => {
        const aTime = a.match(/_(\d+)\.json$/)?.[1] || '0';
        const bTime = b.match(/_(\d+)\.json$/)?.[1] || '0';
        return parseInt(bTime) - parseInt(aTime);
      });

    if (commentFiles.length === 0) {
      return [];
    }

    const latestFile = path.join(outputDir, commentFiles[0]);
    const fileContent = fs.readFileSync(latestFile, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('读取评论文件错误:', error);
    return [];
  }
}
