import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { ConfigPreset, SpiderConfig } from '../../types';

const CONFIG_DIR = path.join(process.cwd(), 'data');
const CONFIG_FILE = path.join(CONFIG_DIR, 'configs.json');

// 确保数据目录存在
async function ensureDataDir() {
  try {
    await fs.access(CONFIG_DIR);
  } catch {
    await fs.mkdir(CONFIG_DIR, { recursive: true });
  }
}

// 读取配置文件
async function readConfigs(): Promise<ConfigPreset[]> {
  try {
    const data = await fs.readFile(CONFIG_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// 写入配置文件
async function writeConfigs(configs: ConfigPreset[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(CONFIG_FILE, JSON.stringify(configs, null, 2));
}

// 获取所有配置
export async function GET() {
  try {
    const configs = await readConfigs();
    return NextResponse.json({
      success: true,
      data: configs
    });
  } catch (error) {
    console.error('读取配置失败:', error);
    return NextResponse.json(
      { error: '读取配置失败' },
      { status: 500 }
    );
  }
}

// 保存新配置
export async function POST(request: NextRequest) {
  try {
    const { name, description, config }: { 
      name: string; 
      description: string; 
      config: SpiderConfig; 
    } = await request.json();

    if (!name || !config) {
      return NextResponse.json(
        { error: '配置名称和配置数据不能为空' },
        { status: 400 }
      );
    }

    const configs = await readConfigs();
    
    const newConfig: ConfigPreset = {
      id: Date.now().toString(),
      name,
      description: description || '',
      config,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    configs.push(newConfig);
    await writeConfigs(configs);

    return NextResponse.json({
      success: true,
      data: newConfig
    });
  } catch (error) {
    console.error('保存配置失败:', error);
    return NextResponse.json(
      { error: '保存配置失败' },
      { status: 500 }
    );
  }
}

// 更新配置
export async function PUT(request: NextRequest) {
  try {
    const { id, name, description, config }: { 
      id: string;
      name: string; 
      description: string; 
      config: SpiderConfig; 
    } = await request.json();

    if (!id || !name || !config) {
      return NextResponse.json(
        { error: 'ID、配置名称和配置数据不能为空' },
        { status: 400 }
      );
    }

    const configs = await readConfigs();
    const configIndex = configs.findIndex(c => c.id === id);

    if (configIndex === -1) {
      return NextResponse.json(
        { error: '配置不存在' },
        { status: 404 }
      );
    }

    configs[configIndex] = {
      ...configs[configIndex],
      name,
      description: description || '',
      config,
      updatedAt: new Date().toISOString()
    };

    await writeConfigs(configs);

    return NextResponse.json({
      success: true,
      data: configs[configIndex]
    });
  } catch (error) {
    console.error('更新配置失败:', error);
    return NextResponse.json(
      { error: '更新配置失败' },
      { status: 500 }
    );
  }
}

// 删除配置
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: '配置ID不能为空' },
        { status: 400 }
      );
    }

    const configs = await readConfigs();
    const filteredConfigs = configs.filter(c => c.id !== id);

    if (filteredConfigs.length === configs.length) {
      return NextResponse.json(
        { error: '配置不存在' },
        { status: 404 }
      );
    }

    await writeConfigs(filteredConfigs);

    return NextResponse.json({
      success: true,
      message: '配置删除成功'
    });
  } catch (error) {
    console.error('删除配置失败:', error);
    return NextResponse.json(
      { error: '删除配置失败' },
      { status: 500 }
    );
  }
}
