import { AIBoxRequest, AIBoxResponse, CommentAnalysisRequest } from '../app/types';
import pool from './database';

export interface WorkflowConfig {
  id: number;
  workflow_name: string;
  workflow_key: string;
  bot_key: string;
  human_id: string;
  token: string;
  workflow_type: string;
  description: string;
  prompt_template: string;
  required_params: string[];
  optional_params: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export class WorkflowService {
  private static instance: WorkflowService;
  private baseUrl = 'https://aibox.sankuai.com/aibox/chat';

  public static getInstance(): WorkflowService {
    if (!WorkflowService.instance) {
      WorkflowService.instance = new WorkflowService();
    }
    return WorkflowService.instance;
  }

  /**
   * 从数据库获取工作流配置
   */
  async getWorkflowConfig(workflowType: string): Promise<WorkflowConfig | null> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT * FROM workflow_configs WHERE workflow_type = ? AND is_active = 1 ORDER BY created_at DESC LIMIT 1`,
        [workflowType]
      );
      return (rows as any[])[0] || null;
    } finally {
      connection.release();
    }
  }

  /**
   * 获取所有活跃的工作流配置
   */
  async getAllWorkflowConfigs(): Promise<WorkflowConfig[]> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT * FROM workflow_configs WHERE is_active = 1 ORDER BY created_at DESC`
      );
      return rows as WorkflowConfig[];
    } finally {
      connection.release();
    }
  }

  /**
   * 执行AIBox工作流
   */
  async executeWorkflow(request: AIBoxRequest): Promise<AIBoxResponse> {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'turing-pdl': 'default',
      };

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
      });

      const result = await response.json();
      
      if (result.code === 0 || (response.ok && result.code === undefined)) {
        let responseData = {};
        
        if (result.data && result.data.ext) {
          responseData = result.data.ext;
        } else if (result.data && result.data.content) {
          try {
            responseData = JSON.parse(result.data.content);
          } catch (e) {
            responseData = { content: result.data.content };
          }
        } else if (result.data) {
          responseData = result.data;
        }
        
        return {
          success: true,
          data: responseData,
          llmErrorCode: "200",
          ...responseData
        };
      } else {
        return {
          success: false,
          error: result.msg || 'AIBox工作流返回格式异常',
          llmErrorCode: result.code || 'FORMAT_ERROR'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * 分析评论情感（使用数据库配置）
   */
  async analyzeCommentSentiment(commentData: CommentAnalysisRequest): Promise<AIBoxResponse> {
    const config = await this.getWorkflowConfig('sentiment_analysis');
    if (!config) {
      return {
        success: false,
        error: '未找到情感分析工作流配置'
      };
    }

    // 构建工作流参数
    const ext: Record<string, any> = {
      op_id: 0,
      prompt: config.prompt_template,
      __sys_sync_call: 'sync'
    };

    // 添加必需参数
    config.required_params.forEach(param => {
      if (param === 'content' && commentData.content) {
        ext.content = commentData.content;
      } else if (param === 'product_name' && commentData.product_name) {
        ext.product_name = commentData.product_name;
      } else if (param === 'rating' && commentData.rating) {
        ext.rating = commentData.rating;
      }
    });

    // 添加可选参数
    config.optional_params.forEach(param => {
      if (param === 'user_nick' && commentData.user_nick) {
        ext.user_nick = commentData.user_nick;
      } else if (param === 'date' && commentData.date) {
        ext.date = commentData.date;
      } else if (param === 'sku_info' && commentData.sku_info) {
        ext.sku_info = commentData.sku_info;
      } else if (param === 'useful_count' && commentData.useful_count) {
        ext.useful_count = commentData.useful_count;
      } else if (param === 'reply' && commentData.reply) {
        ext.reply = commentData.reply;
      }
    });

    const request: AIBoxRequest = {
      botKey: config.bot_key,
      humanId: config.human_id,
      workflowKey: config.workflow_key,
      ext,
      token: config.token,
    };

    return await this.executeWorkflow(request);
  }

  /**
   * 分析评论爆火原因（使用数据库配置）
   */
  async analyzeCommentBoomReason(commentData: CommentAnalysisRequest): Promise<AIBoxResponse> {
    const config = await this.getWorkflowConfig('boom_reason');
    if (!config) {
      return {
        success: false,
        error: '未找到爆火原因分析工作流配置'
      };
    }

    // 构建工作流参数
    const ext: Record<string, any> = {
      op_id: 0,
      prompt: config.prompt_template.replace('%s', commentData.content || ''),
      __sys_sync_call: 'sync'
    };

    // 添加必需参数
    config.required_params.forEach(param => {
      if (param === 'review_body' && commentData.content) {
        ext.review_body = commentData.content;
      }
    });

    // 添加可选参数
    config.optional_params.forEach(param => {
      if (param === 'avg_price' && commentData.avg_price) {
        ext.avg_price = commentData.avg_price;
      } else if (param === 'city_name' && commentData.city_name) {
        ext.city_name = commentData.city_name;
      } else if (param === 'dp_poi_name' && commentData.dp_poi_name) {
        ext.dp_poi_name = commentData.dp_poi_name;
      } else if (param === 'review_count' && commentData.review_count) {
        ext.review_count = commentData.review_count;
      } else if (param === 'overall_score' && commentData.overall_score) {
        ext.overall_score = commentData.overall_score;
      } else if (param === 'platform_name' && commentData.platform_name) {
        ext.platform_name = commentData.platform_name;
      }
    });

    const request: AIBoxRequest = {
      botKey: config.bot_key,
      humanId: config.human_id,
      workflowKey: config.workflow_key,
      ext,
      token: config.token,
    };

    return await this.executeWorkflow(request);
  }

  /**
   * 批量分析评论
   */
  async batchAnalyzeComments(comments: any[], analysisType: 'sentiment_analysis' | 'boom_reason' = 'sentiment_analysis'): Promise<any[]> {
    const results = [];
    
    for (const comment of comments) {
      try {
        const commentData: CommentAnalysisRequest = {
          content: comment.content,
          product_name: comment.product_name,
          rating: comment.rating?.toString(),
          user_nick: comment.user_nick,
          date: comment.date,
          sku_info: comment.sku_info,
          useful_count: comment.useful_count?.toString(),
          reply: comment.reply
        };

        let analysisResult;
        if (analysisType === 'sentiment_analysis') {
          analysisResult = await this.analyzeCommentSentiment(commentData);
        } else {
          analysisResult = await this.analyzeCommentBoomReason(commentData);
        }

        results.push({
          ...comment,
          analysis: analysisResult.success ? analysisResult.data : null,
          analysisError: analysisResult.success ? null : analysisResult.error
        });

        // 添加延迟避免请求过于频繁
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        results.push({
          ...comment,
          analysis: null,
          analysisError: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return results;
  }
}
