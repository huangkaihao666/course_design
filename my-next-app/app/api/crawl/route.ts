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
    const { productId, maxPages = 3, cookies = '' } = await request.json();

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
    const result = await runSpider(spiderPath, productId, maxPages, cookies);

    if (result.success) {
      // 等待文件写入完成
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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

// 获取已爬取的评论数据，如果没有数据则自动爬取
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
    console.log(`查找商品 ${productId} 的数据，输出目录: ${outputDir}`);
    
    let comments = await readLatestComments(outputDir, productId);
    console.log(`找到 ${comments.length} 条现有评论`);

    // 如果没有找到数据，自动调用爬虫
    if (comments.length === 0) {
      console.log(`没有找到商品 ${productId} 的数据，开始自动爬取...`);
      
      try {
        const spiderPath = path.join(process.cwd(), '..', 'pachong', 'spider.py');
        console.log(`爬虫脚本路径: ${spiderPath}`);
        
        const result = await runSpider(spiderPath, productId, 3, 'xlly_s=1; dnk=tb52079771; tracknick=tb52079771; lid=tb52079771; _l_g_=Ug%3D%3D; unb=2874571822; lgc=tb52079771; cookie1=VT5Zk6h2%2BqNVOo4UBujinMRjF69%2FJohkVTOspWEVctU%3D; login=true; wk_cookie2=11ef152c8328fbab96c52320c81863f0; cookie17=UUBfRqE2sd0fJQ%3D%3D; cookie2=1a394e6c096d55ee8ed6c05e8a3f252b; _nk_=tb52079771; cancelledSubSites=empty; sg=12e; t=8f8c6b0acfd465866dd8e9e2ef3f1e52; sn=; _tb_token_=e7f5e347e7467; wk_unb=UUBfRqE2sd0fJQ%3D%3D; isg=BG5utQ0ZipRSfP7w7mPZnAMPv8IwbzJpXA3g55g32nEsew7VAP-CeRR4MueXpCqB; havana_sdkSilent=1758304110832; uc1=pas=0&cookie21=Vq8l%2BKCLjhS4UhJVbhgU&cookie16=UtASsssmPlP%2Ff1IHDsDaPRu%2BPw%3D%3D&cookie15=UIHiLt3xD8xYTw%3D%3D&cookie14=UoYbw12iqFcnxw%3D%3D&existShop=false; uc3=vt3=F8dD2k%2FkqtAXbdSM%2B0g%3D&lg2=U%2BGCWk%2F75gdr5Q%3D%3D&nk2=F5RAQI%2B%2FeGflCQ%3D%3D&id2=UUBfRqE2sd0fJQ%3D%3D; uc4=id4=0%40U2LNaXTVr%2BzfReMs%2FDEO6yqBBCVA&nk4=0%40FY4L7HCZjsAW%2BYbe61%2Be7QuxIflL; havana_lgc_exp=1789379310832; sgcookie=E100XRzzBI4FsakfR5IEXtyUYgxxKEGtdnkyO2fJpXfAjhUL2E2Q2Y5xL5OImz3taTq7qqEjpR8ahvSks4KoAceJyDoKXKyKy9k72W%2FJw3RpVjg33x7b2gWd3q%2FBl6UQPMEn; csg=fc7d23e6; mtop_partitioned_detect=1; _m_h5_tk=fa69dcb6ac62e22452533f22ae5e27aa_1758298239087; _m_h5_tk_enc=178d568bcb785ebbe1cb127a8696ac1f; tfstk=gbAjBE9Qvhdz7-1T5t0zFAXyP6f6C4lEhP_9-FF4WsCA55THfE5wWGR113xRBI52u3G6-H6VBCSw1rAWA5PqmxYT115tYDlETEvcs1nUU97w6ibMyG3PH-59R2CtYDlzUzBm01KNEc0nVUIl5SQADhI-wNSRW-KODTERRwfO6hQOeUQF5oeOkS3WygbO6GKOH46RqNh9nAQ_hiTjJcz9VawRbEI765djstsBBRPT6Q_fhO8AVLJyNZ6fAOETYsRBJEdh5C0LCGTHHn7kfXi5wItXMT1s17f2RLKfFKi_NTvJ-CBWEDwH-EKXp9dxNq6Wie5AVC0gsip2WCW6MDUNDIx2N9Agc0SwLURAFHnzNhX6HpCv1DGR42VFAsrzCz631asEP4wgI1C1obpifImAHabXo4g7cOXAragjP4wgItQlzx3SPo6G.');
        console.log(`爬虫执行结果:`, result);
        
        if (result.success) {
          // 使用轮询等待文件写入完成
          console.log('等待文件写入完成...');
          let attempts = 0;
          const maxAttempts = 30; // 最多等待30秒
          const pollInterval = 1000; // 每秒检查一次
          
          while (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, pollInterval));
            comments = await readLatestComments(outputDir, productId);
            
            if (comments.length > 0) {
              console.log(`自动爬取完成，获取到 ${comments.length} 条评论`);
              break;
            }
            
            attempts++;
            console.log(`等待中... (${attempts}/${maxAttempts})`);
          }
          
          if (comments.length === 0) {
            console.log('等待超时，未获取到数据');
          }
        } else {
          console.error('自动爬取失败:', result.error);
        }
      } catch (error) {
        console.error('爬虫调用异常:', error);
      }
    }

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
function runSpider(spiderPath: string, productId: string, maxPages: number, cookies: string = ''): Promise<{ success: boolean; error?: string }> {
  console.log('Running spider with:', { productId, maxPages, cookiesLength: cookies.length });
  
  return new Promise((resolve) => {
    const pythonProcess = spawn('python3', ['spider.py'], {
      cwd: path.join(process.cwd(), '..', 'pachong'),
      env: {
        ...process.env,
        PRODUCT_ID: productId,
        MAX_PAGES: maxPages.toString(),
        COOKIES: cookies
      }
    });

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      const chunk = data.toString();
      output += chunk;
      console.log('Python stdout:', chunk);
    });

    pythonProcess.stderr.on('data', (data) => {
      const chunk = data.toString();
      errorOutput += chunk;
      console.log('Python stderr:', chunk);
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
    }, 120000); // 120秒超时
  });
}

// 读取最新的评论文件
async function readLatestComments(outputDir: string, productId: string): Promise<Comment[]> {
  try {
    // 确保输出目录存在
    if (!fs.existsSync(outputDir)) {
      return [];
    }

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
