import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { DatabaseService } from '../../../lib/database';

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
    const { productId, maxPages, useDatabase = true } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: '商品ID不能为空' },
        { status: 400 }
      );
    }

    let cookies = '';
    let actualMaxPages = maxPages || 3;

    // 如果启用数据库，尝试从数据库获取配置
    if (useDatabase) {
      try {
        const configs = await DatabaseService.getSpiderConfigByProductId(productId) as any[];
        if (configs && configs.length > 0) {
          const config = configs[0]; // 使用最新的配置
          cookies = config.cookies || '';
          actualMaxPages = config.max_pages || maxPages || 3;
          console.log(`从数据库获取配置: cookies长度=${cookies.length}, maxPages=${actualMaxPages}`);
        } else {
          console.log('数据库中未找到该商品的配置，使用默认参数');
        }
      } catch (error) {
        console.error('从数据库获取配置失败:', error);
        console.log('使用默认参数继续执行');
      }
    }

    // Python爬虫脚本路径
    const spiderPath = path.join(process.cwd(), '..', 'crawl', 'spider.py');
    const outputDir = path.join(process.cwd(), '..', 'crawl', 'output');

    // 执行Python爬虫
    const result = await runSpider(spiderPath, productId, actualMaxPages, cookies);

    if (result.success) {
      // 等待文件写入完成
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 读取爬取的数据
      const { comments, productInfo } = await readLatestComments(outputDir, productId);
      
      // 保存评论数据到数据库
      if (comments.length > 0) {
        try {
          const saveResult = await DatabaseService.saveComments(productId, comments, productInfo);
          console.log(`成功保存 ${saveResult.count} 条评论到数据库`);
        } catch (error) {
          console.error('保存评论到数据库失败:', error);
          // 即使保存失败，也返回爬取的数据
        }
      }
      
      return NextResponse.json({
        success: true,
        data: comments,
        productInfo: productInfo,
        message: `成功爬取 ${comments.length} 条评论并保存到数据库`
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
    const maxPages = parseInt(searchParams.get('maxPages') || '3');
    const useDatabase = searchParams.get('useDatabase') !== 'false'; // 默认启用数据库

    if (!productId) {
      return NextResponse.json(
        { error: '商品ID不能为空' },
        { status: 400 }
      );
    }

    let cookies = '';
    let actualMaxPages = maxPages;

    // 如果启用数据库，尝试从数据库获取配置
    if (useDatabase) {
      try {
        const configs = await DatabaseService.getSpiderConfigByProductId(productId) as any[];
        if (configs && configs.length > 0) {
          const config = configs[0]; // 使用最新的配置
          cookies = config.cookies || '';
          actualMaxPages = config.max_pages || maxPages;
          console.log(`从数据库获取配置: cookies长度=${cookies.length}, maxPages=${actualMaxPages}`);
        } else {
          console.log('数据库中未找到该商品的配置，使用默认参数');
          // 使用默认cookies作为后备
          cookies = 't=8f8c6b0acfd465866dd8e9e2ef3f1e52; _tb_token_=e7f5e347e7467; thw=cn; sca=7620b646; xlly_s=1; _samesite_flag_=true; cookie2=1a394e6c096d55ee8ed6c05e8a3f252b; 3PcFlag=1758275266324; wk_cookie2=11ef152c8328fbab96c52320c81863f0; wk_unb=UUBfRqE2sd0fJQ%3D%3D; _hvn_lgc_=0; havana_lgc2_0=eyJoaWQiOjI4NzQ1NzE4MjIsInNnIjoiZjM3YmUyN2EzZDAzM2U3ZjEzYWI1NWZiZmZmNTkxZTkiLCJzaXRlIjowLCJ0b2tlbiI6IjF1NWVkLWFMY0F1dWZCcjJpZlFGenRRIn0; unb=2874571822; lgc=tb52079771; cancelledSubSites=empty; cookie17=UUBfRqE2sd0fJQ%3D%3D; dnk=tb52079771; tracknick=tb52079771; _l_g_=Ug%3D%3D; sg=12e; _nk_=tb52079771; cookie1=VT5Zk6h2%2BqNVOo4UBujinMRjF69%2FJohkVTOspWEVctU%3D; sn=; aui=2874571822; mtop_partitioned_detect=1; _m_h5_tk=66588b7909ea6afc1d6c0bd60dde6158_1758449754843; _m_h5_tk_enc=742f3070a5e46ccea0cf52607bfbf0b2; havana_sdkSilent=1758470276989; uc1=cookie16=URm48syIJ1yk0MX2J7mAAEhTuw%3D%3D&cookie21=W5iHLLyFeYZ1WM9hVnmS&cookie15=WqG3DMC9VAQiUQ%3D%3D&pas=0&cookie14=UoYbw1taX6hRAw%3D%3D&existShop=false; uc3=id2=UUBfRqE2sd0fJQ%3D%3D&lg2=Vq8l%2BKCLz3%2F65A%3D%3D&nk2=F5RAQI%2B%2FeGflCQ%3D%3D&vt3=F8dD2k69gqGk3XVIlgo%3D; csg=a62f9b06; skt=c9d6387eec7fb0da; existShop=MTc1ODQ0MTU3OQ%3D%3D; uc4=id4=0%40U2LNaXTVr%2BzfReMs%2FDEO7cDKxRBX&nk4=0%40FY4L7HCZjsAW%2BYbe61%2Be6wnAHnPQ; _cc_=VFC%2FuZ9ajQ%3D%3D; sgcookie=E100M%2B6txI5nmIp1SERy1%2Bdp3xmQSqB7D7jQGyLwO4gDReFhgJkzimsUNeEHtLEyr4ZdwjylLY%2BFmrijRPN0tJVcsGNzi8o7qzB%2Bp75bh8AufaaXUwmq8EmkLsjdePMKJrXA; havana_lgc_exp=1789545579179; sdkSilent=1758470379179; cna=WHpUIQ+wqxYCAQAAAABTmeyU; isg=BKKiPJV3PjI41CLsOhGAfNWi8y4E86YNQMmcm-wqWp3tv045w4KOHGp37vtDmx6l; tfstk=gE9rKJDZq9YbRvbRZK6U0T1L2AXR19us8p_CxHxhVabkNwweLZ-i2aGKweR2-EC5rQ_QLp72rJ1WLHeFxHYK2wi-G3KRp90s5Hk623L7iotDUaXconIGxucfZ0Pgf0us5AMjZoXEzVTCH1v93MQcq8bltmycYM6hxwjo0ZjFXW4k-emViMIF-ujh-tqcfZbhK9YHmmSCogXhKfJOg1kVj_mV9nhVSz1GaNxluRxX3gc57AQ0Kr9c4CFw4Z5fGKSPaN53-Yp6QhxkBMJKjW7eXQY5DekZutvyzLfVLvyAFhRDzsRr8-5vihphgI3a6hKkzCfMExoPgLK1EZJKvJQkNHvCTL0gAavJPK59pzufRCtXEs8il-8dTQAGEpuZngz8JiD7dpdz-W5lDi7s0mr-TsGaenezjWFdiesV50K89WCo-i7s0mPL9_HF0NiJ2';
        }
      } catch (error) {
        console.error('从数据库获取配置失败:', error);
        console.log('使用默认参数继续执行');
        // 使用默认cookies作为后备
        cookies = 't=8f8c6b0acfd465866dd8e9e2ef3f1e52; _tb_token_=e7f5e347e7467; thw=cn; sca=7620b646; xlly_s=1; _samesite_flag_=true; cookie2=1a394e6c096d55ee8ed6c05e8a3f252b; 3PcFlag=1758275266324; wk_cookie2=11ef152c8328fbab96c52320c81863f0; wk_unb=UUBfRqE2sd0fJQ%3D%3D; _hvn_lgc_=0; havana_lgc2_0=eyJoaWQiOjI4NzQ1NzE4MjIsInNnIjoiZjM3YmUyN2EzZDAzM2U3ZjEzYWI1NWZiZmZmNTkxZTkiLCJzaXRlIjowLCJ0b2tlbiI6IjF1NWVkLWFMY0F1dWZCcjJpZlFGenRRIn0; unb=2874571822; lgc=tb52079771; cancelledSubSites=empty; cookie17=UUBfRqE2sd0fJQ%3D%3D; dnk=tb52079771; tracknick=tb52079771; _l_g_=Ug%3D%3D; sg=12e; _nk_=tb52079771; cookie1=VT5Zk6h2%2BqNVOo4UBujinMRjF69%2FJohkVTOspWEVctU%3D; sn=; aui=2874571822; mtop_partitioned_detect=1; _m_h5_tk=66588b7909ea6afc1d6c0bd60dde6158_1758449754843; _m_h5_tk_enc=742f3070a5e46ccea0cf52607bfbf0b2; havana_sdkSilent=1758470276989; uc1=cookie16=URm48syIJ1yk0MX2J7mAAEhTuw%3D%3D&cookie21=W5iHLLyFeYZ1WM9hVnmS&cookie15=WqG3DMC9VAQiUQ%3D%3D&pas=0&cookie14=UoYbw1taX6hRAw%3D%3D&existShop=false; uc3=id2=UUBfRqE2sd0fJQ%3D%3D&lg2=Vq8l%2BKCLz3%2F65A%3D%3D&nk2=F5RAQI%2B%2FeGflCQ%3D%3D&vt3=F8dD2k69gqGk3XVIlgo%3D; csg=a62f9b06; skt=c9d6387eec7fb0da; existShop=MTc1ODQ0MTU3OQ%3D%3D; uc4=id4=0%40U2LNaXTVr%2BzfReMs%2FDEO7cDKxRBX&nk4=0%40FY4L7HCZjsAW%2BYbe61%2Be6wnAHnPQ; _cc_=VFC%2FuZ9ajQ%3D%3D; sgcookie=E100M%2B6txI5nmIp1SERy1%2Bdp3xmQSqB7D7jQGyLwO4gDReFhgJkzimsUNeEHtLEyr4ZdwjylLY%2BFmrijRPN0tJVcsGNzi8o7qzB%2Bp75bh8AufaaXUwmq8EmkLsjdePMKJrXA; havana_lgc_exp=1789545579179; sdkSilent=1758470379179; cna=WHpUIQ+wqxYCAQAAAABTmeyU; isg=BKKiPJV3PjI41CLsOhGAfNWi8y4E86YNQMmcm-wqWp3tv045w4KOHGp37vtDmx6l; tfstk=gE9rKJDZq9YbRvbRZK6U0T1L2AXR19us8p_CxHxhVabkNwweLZ-i2aGKweR2-EC5rQ_QLp72rJ1WLHeFxHYK2wi-G3KRp90s5Hk623L7iotDUaXconIGxucfZ0Pgf0us5AMjZoXEzVTCH1v93MQcq8bltmycYM6hxwjo0ZjFXW4k-emViMIF-ujh-tqcfZbhK9YHmmSCogXhKfJOg1kVj_mV9nhVSz1GaNxluRxX3gc57AQ0Kr9c4CFw4Z5fGKSPaN53-Yp6QhxkBMJKjW7eXQY5DekZutvyzLfVLvyAFhRDzsRr8-5vihphgI3a6hKkzCfMExoPgLK1EZJKvJQkNHvCTL0gAavJPK59pzufRCtXEs8il-8dTQAGEpuZngz8JiD7dpdz-W5lDi7s0mr-TsGaenezjWFdiesV50K89WCo-i7s0mPL9_HF0NiJ2';
      }
    } else {
      // 使用默认cookies
      cookies = 't=8f8c6b0acfd465866dd8e9e2ef3f1e52; _tb_token_=e7f5e347e7467; thw=cn; sca=7620b646; xlly_s=1; _samesite_flag_=true; cookie2=1a394e6c096d55ee8ed6c05e8a3f252b; 3PcFlag=1758275266324; wk_cookie2=11ef152c8328fbab96c52320c81863f0; wk_unb=UUBfRqE2sd0fJQ%3D%3D; _hvn_lgc_=0; havana_lgc2_0=eyJoaWQiOjI4NzQ1NzE4MjIsInNnIjoiZjM3YmUyN2EzZDAzM2U3ZjEzYWI1NWZiZmZmNTkxZTkiLCJzaXRlIjowLCJ0b2tlbiI6IjF1NWVkLWFMY0F1dWZCcjJpZlFGenRRIn0; unb=2874571822; lgc=tb52079771; cancelledSubSites=empty; cookie17=UUBfRqE2sd0fJQ%3D%3D; dnk=tb52079771; tracknick=tb52079771; _l_g_=Ug%3D%3D; sg=12e; _nk_=tb52079771; cookie1=VT5Zk6h2%2BqNVOo4UBujinMRjF69%2FJohkVTOspWEVctU%3D; sn=; aui=2874571822; mtop_partitioned_detect=1; _m_h5_tk=66588b7909ea6afc1d6c0bd60dde6158_1758449754843; _m_h5_tk_enc=742f3070a5e46ccea0cf52607bfbf0b2; havana_sdkSilent=1758470276989; uc1=cookie16=URm48syIJ1yk0MX2J7mAAEhTuw%3D%3D&cookie21=W5iHLLyFeYZ1WM9hVnmS&cookie15=WqG3DMC9VAQiUQ%3D%3D&pas=0&cookie14=UoYbw1taX6hRAw%3D%3D&existShop=false; uc3=id2=UUBfRqE2sd0fJQ%3D%3D&lg2=Vq8l%2BKCLz3%2F65A%3D%3D&nk2=F5RAQI%2B%2FeGflCQ%3D%3D&vt3=F8dD2k69gqGk3XVIlgo%3D; csg=a62f9b06; skt=c9d6387eec7fb0da; existShop=MTc1ODQ0MTU3OQ%3D%3D; uc4=id4=0%40U2LNaXTVr%2BzfReMs%2FDEO7cDKxRBX&nk4=0%40FY4L7HCZjsAW%2BYbe61%2Be6wnAHnPQ; _cc_=VFC%2FuZ9ajQ%3D%3D; sgcookie=E100M%2B6txI5nmIp1SERy1%2Bdp3xmQSqB7D7jQGyLwO4gDReFhgJkzimsUNeEHtLEyr4ZdwjylLY%2BFmrijRPN0tJVcsGNzi8o7qzB%2Bp75bh8AufaaXUwmq8EmkLsjdePMKJrXA; havana_lgc_exp=1789545579179; sdkSilent=1758470379179; cna=WHpUIQ+wqxYCAQAAAABTmeyU; isg=BKKiPJV3PjI41CLsOhGAfNWi8y4E86YNQMmcm-wqWp3tv045w4KOHGp37vtDmx6l; tfstk=gE9rKJDZq9YbRvbRZK6U0T1L2AXR19us8p_CxHxhVabkNwweLZ-i2aGKweR2-EC5rQ_QLp72rJ1WLHeFxHYK2wi-G3KRp90s5Hk623L7iotDUaXconIGxucfZ0Pgf0us5AMjZoXEzVTCH1v93MQcq8bltmycYM6hxwjo0ZjFXW4k-emViMIF-ujh-tqcfZbhK9YHmmSCogXhKfJOg1kVj_mV9nhVSz1GaNxluRxX3gc57AQ0Kr9c4CFw4Z5fGKSPaN53-Yp6QhxkBMJKjW7eXQY5DekZutvyzLfVLvyAFhRDzsRr8-5vihphgI3a6hKkzCfMExoPgLK1EZJKvJQkNHvCTL0gAavJPK59pzufRCtXEs8il-8dTQAGEpuZngz8JiD7dpdz-W5lDi7s0mr-TsGaenezjWFdiesV50K89WCo-i7s0mPL9_HF0NiJ2';
    }

    const outputDir = path.join(process.cwd(), '..', 'crawl', 'output');
    console.log(`开始爬取商品 ${productId} 的数据，页数: ${actualMaxPages}，输出目录: ${outputDir}`);
    
    // 总是重新爬取，不读取缓存
    console.log(`开始自动爬取 ${actualMaxPages} 页...`);
    
    let comments: Comment[] = [];
    
    try {
      const spiderPath = path.join(process.cwd(), '..', 'crawl', 'spider.py');
      console.log(`爬虫脚本路径: ${spiderPath}`);
      
      const result = await runSpider(spiderPath, productId, actualMaxPages, cookies);
      console.log(`爬虫执行结果:`, result);
      
      if (result.success) {
        // 使用轮询等待文件写入完成
        console.log('等待文件写入完成...');
        let attempts = 0;
        const maxAttempts = 30; // 最多等待30秒
        const pollInterval = 1000; // 每秒检查一次
        
        while (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, pollInterval));
          const { comments: latestComments, productInfo } = await readLatestComments(outputDir, productId);
          comments = latestComments;
          
        if (comments.length > 0) {
          console.log(`自动爬取完成，获取到 ${comments.length} 条评论`);
          
          // 保存评论数据到数据库
          try {
            const saveResult = await DatabaseService.saveComments(productId, comments, productInfo);
            console.log(`成功保存 ${saveResult.count} 条评论到数据库`);
          } catch (error) {
            console.error('保存评论到数据库失败:', error);
          }
          
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
      cwd: path.join(process.cwd(), '..', 'crawl'),
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
async function readLatestComments(outputDir: string, productId: string): Promise<{ comments: Comment[], productInfo: any }> {
  try {
    // 确保输出目录存在
    if (!fs.existsSync(outputDir)) {
      return { comments: [], productInfo: null };
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
      return { comments: [], productInfo: null };
    }

    const latestFile = path.join(outputDir, commentFiles[0]);
    const fileContent = fs.readFileSync(latestFile, 'utf-8');
    const data = JSON.parse(fileContent);
    
    // 处理新格式（包含商品信息）和旧格式（只有评论数组）
    if (data.comments && data.product_info) {
      return { comments: data.comments, productInfo: data.product_info };
    } else if (Array.isArray(data)) {
      return { comments: data, productInfo: null };
    } else {
      return { comments: [], productInfo: null };
    }
  } catch (error) {
    console.error('读取评论文件错误:', error);
    return { comments: [], productInfo: null };
  }
}
