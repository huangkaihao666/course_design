import { NextRequest, NextResponse } from 'next/server';
import { AIBoxService } from '../../../lib/aibox-service';
import { CommentAnalysisRequest, AIBoxWorkflowConfig } from '../../types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data, config } = body;

    const aiboxService = AIBoxService.getInstance();

    switch (action) {
      case 'analyze-comment':
        return await handleCommentAnalysis(aiboxService, data);
      
      case 'analyze-comment-with-config':
        return await handleCommentAnalysisWithConfig(aiboxService, data, config);
      
      case 'execute-workflow':
        return await handleExecuteWorkflow(aiboxService, data);
      
      case 'get-config':
        return NextResponse.json({
          success: true,
          data: aiboxService.getDefaultConfig()
        });
      
      case 'update-config':
        return await handleUpdateConfig(aiboxService, data);
      
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Supported actions: analyze-comment, analyze-comment-with-config, execute-workflow, get-config, update-config'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('AIBox API Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

/**
 * 处理评论分析请求（使用默认配置）
 */
async function handleCommentAnalysis(
  aiboxService: AIBoxService, 
  data: CommentAnalysisRequest
): Promise<NextResponse> {
  try {
    // 验证必需字段
    if (!data.reviewBody) {
      return NextResponse.json({
        success: false,
        error: 'reviewBody is required'
      }, { status: 400 });
    }

    const result = await aiboxService.analyzeCommentBoomReason(data);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Comment analysis error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Comment analysis failed'
    }, { status: 500 });
  }
}

/**
 * 处理使用自定义配置的评论分析请求
 */
async function handleCommentAnalysisWithConfig(
  aiboxService: AIBoxService,
  data: CommentAnalysisRequest,
  config: AIBoxWorkflowConfig
): Promise<NextResponse> {
  try {
    // 验证必需字段
    if (!data.reviewBody) {
      return NextResponse.json({
        success: false,
        error: 'reviewBody is required'
      }, { status: 400 });
    }

    if (!config || !config.botKey || !config.workflowKey || !config.token) {
      return NextResponse.json({
        success: false,
        error: 'Valid config is required (botKey, workflowKey, token)'
      }, { status: 400 });
    }

    const result = await aiboxService.analyzeCommentWithConfig(data, config);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Comment analysis with config error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Comment analysis with config failed'
    }, { status: 500 });
  }
}

/**
 * 处理通用工作流执行请求
 */
async function handleExecuteWorkflow(
  aiboxService: AIBoxService,
  data: any
): Promise<NextResponse> {
  try {
    const { botKey, workflowKey, ext, humanId, token } = data;

    if (!botKey || !workflowKey || !ext || !token) {
      return NextResponse.json({
        success: false,
        error: 'botKey, workflowKey, ext, and token are required'
      }, { status: 400 });
    }

    const request = aiboxService.buildRequest(
      botKey,
      workflowKey,
      ext,
      humanId || 'huangkaihao03',
      token
    );

    const result = await aiboxService.executeWorkflow(request);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Execute workflow error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Execute workflow failed'
    }, { status: 500 });
  }
}

/**
 * 处理配置更新请求
 */
async function handleUpdateConfig(
  aiboxService: AIBoxService,
  data: Partial<AIBoxWorkflowConfig>
): Promise<NextResponse> {
  try {
    aiboxService.updateDefaultConfig(data);
    
    return NextResponse.json({
      success: true,
      data: aiboxService.getDefaultConfig(),
      message: 'Config updated successfully'
    });
  } catch (error) {
    console.error('Update config error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Update config failed'
    }, { status: 500 });
  }
}
