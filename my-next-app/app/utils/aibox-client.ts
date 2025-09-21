import { CommentAnalysisRequest, AIBoxResponse, AIBoxWorkflowConfig } from '../types';

export class AIBoxClient {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  /**
   * 分析评论爆火原因
   */
  async analyzeComment(analysisRequest: CommentAnalysisRequest): Promise<AIBoxResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/comment-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analysisRequest),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * 使用自定义配置分析评论
   */
  async analyzeCommentWithConfig(
    analysisRequest: CommentAnalysisRequest,
    config: AIBoxWorkflowConfig
  ): Promise<AIBoxResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/aibox`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'analyze-comment-with-config',
          data: analysisRequest,
          config: config,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * 执行通用工作流
   */
  async executeWorkflow(workflowData: {
    botKey: string;
    workflowKey: string;
    ext: Record<string, any>;
    humanId?: string;
    token: string;
  }): Promise<AIBoxResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/aibox`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'execute-workflow',
          data: workflowData,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * 获取当前配置
   */
  async getConfig(): Promise<AIBoxResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/aibox`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get-config',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * 更新配置
   */
  async updateConfig(config: Partial<AIBoxWorkflowConfig>): Promise<AIBoxResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/aibox`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update-config',
          data: config,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }
}

// 创建默认实例
export const aiboxClient = new AIBoxClient();
