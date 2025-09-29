import { NextRequest, NextResponse } from 'next/server';
import { WorkflowService } from '../../../lib/workflow-service';

export async function GET(request: NextRequest) {
  try {
    const workflowService = WorkflowService.getInstance();
    const configs = await workflowService.getAllWorkflowConfigs();
    
    return NextResponse.json({
      success: true,
      data: configs
    });
  } catch (error) {
    console.error('Workflow configs API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      id, 
      workflow_name, 
      workflow_key, 
      bot_key, 
      human_id, 
      token, 
      workflow_type, 
      description, 
      prompt_template, 
      required_params, 
      optional_params, 
      is_active 
    } = body;

    if (!workflow_name || !workflow_key || !bot_key || !human_id || !token || !workflow_type) {
      return NextResponse.json({
        success: false,
        error: 'workflow_name, workflow_key, bot_key, human_id, token, and workflow_type are required'
      }, { status: 400 });
    }

    const connection = await (WorkflowService as any).pool.getConnection();
    try {
      if (id) {
        // 更新配置
        await connection.execute(
          `UPDATE workflow_configs SET 
           workflow_name = ?, workflow_key = ?, bot_key = ?, human_id = ?, 
           token = ?, workflow_type = ?, description = ?, prompt_template = ?, 
           required_params = ?, optional_params = ?, is_active = ? 
           WHERE id = ?`,
          [
            workflow_name, workflow_key, bot_key, human_id, token, workflow_type,
            description || '', prompt_template, JSON.stringify(required_params || []),
            JSON.stringify(optional_params || []), is_active ? 1 : 0, id
          ]
        );
      } else {
        // 新增配置
        await connection.execute(
          `INSERT INTO workflow_configs 
           (workflow_name, workflow_key, bot_key, human_id, token, workflow_type, 
            description, prompt_template, required_params, optional_params, is_active, created_by) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            workflow_name, workflow_key, bot_key, human_id, token, workflow_type,
            description || '', prompt_template, JSON.stringify(required_params || []),
            JSON.stringify(optional_params || []), is_active ? 1 : 0, 'admin'
          ]
        );
      }

      return NextResponse.json({
        success: true,
        message: id ? '工作流配置更新成功' : '工作流配置保存成功'
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Workflow configs POST error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, is_active } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'id parameter is required'
      }, { status: 400 });
    }

    const connection = await (WorkflowService as any).pool.getConnection();
    try {
      await connection.execute(
        `UPDATE workflow_configs SET is_active = ? WHERE id = ?`,
        [is_active ? 1 : 0, id]
      );

      return NextResponse.json({
        success: true,
        message: '工作流状态更新成功'
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Workflow configs PUT error:', error);
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

    const connection = await (WorkflowService as any).pool.getConnection();
    try {
      await connection.execute(
        `DELETE FROM workflow_configs WHERE id = ?`,
        [id]
      );

      return NextResponse.json({
        success: true,
        message: '工作流配置删除成功'
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Workflow configs DELETE error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
