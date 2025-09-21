import { AIBoxRequest, AIBoxResponse, AIBoxWorkflowConfig, CommentAnalysisRequest, CommentAnalysisResult } from '../app/types';

export class AIBoxService {
  private static instance: AIBoxService;
  private baseUrl = 'https://aibox.sankuai.com/aibox/chat';
  private defaultConfig: AIBoxWorkflowConfig;

  constructor() {
    // 使用你提供的真实参数作为默认配置
    this.defaultConfig = {
      botKey: 'xubohua0220250825110350148',
      workflowKey: '#workflow#bot_main_xubohua0220250825110350148',
      humanId: 'huangkaihao03',
      token: 'p0stV8PoCjypXjNHGFBjbEX8xTtljdgVOHFclnqotbo='
    };
  }

  public static getInstance(): AIBoxService {
    if (!AIBoxService.instance) {
      AIBoxService.instance = new AIBoxService();
    }
    return AIBoxService.instance;
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
   * 构建AIBox请求
   */
  buildRequest(
    botKey: string,
    workflowKey: string,
    ext: Record<string, any>,
    humanId: string = 'huangkaihao03',
    token: string
  ): AIBoxRequest {
    return {
      botKey,
      humanId,
      workflowKey,
      ext,
      token,
    };
  }

  /**
   * 分析评论爆火原因（使用默认配置）
   */
  async analyzeCommentBoomReason(analysisRequest: CommentAnalysisRequest): Promise<AIBoxResponse> {
    const prompt = `背景：你是一位爆火原因分析专家，我会给你提供一家门店的相关评论信息。你的任务是分析这条评论，提炼出这家门店爆火的原因，最后给出判断依据。

  一、提炼门店爆火原因时可以参考如下分类：
  1. 装修风格独特：拍照打卡、易出图、古风、日式居酒屋、欧式宫廷风、典雅之类
  2. 互动性强：饭店有特殊节目才命中，比如变装，变脸，唱歌跳舞表演等，不包含生日祝福
  3. 菜品口感好：菜品口感好：好吃、推荐、某个菜品具有特色、独特的菜品做法等
  4. 价格便宜：性价比高、价格低、实惠、分量大
  5. 地理位置好：周边是旅游景点、风景好、有著名地标等
  6. 食材新鲜：原材料食材新鲜、有养殖基地、有屠宰场、专有供货渠道等
  7. 服务周到：除了基本接待服务外，有溢价服务，例如帮忙剥虾等
  8. 烟火气重：周边热闹、人气旺、步行街、小吃一条街等
  9. 网红效应：必须提到网红，明星等知名人士的带动才算命中，不包含排队，必吃，外地游客打卡等含义
  10. 厨师有名：米其林出身、多年老师傅等
  11. 米其林等榜单效应：米其林餐厅、米其林推荐入榜、必吃榜、黑珍珠等
  12. 热帖推荐：必须是小红书、 抖音、 大众点评、 携程等内容平台引流而来的，不包含排队，必吃，外地游客打卡等含义

  二、输出格式：使用JSON格式返回提取的信息，示例格式如下：
  {"tag":"菜品口感好、装修风格独特","reason":"口感出众：可颂酥脆层次分明、蛋挞香甜不腻；工业风易出图"}

  tag返回这家门店的爆火原因标签，一条评论可能有多种原因，使用顿号分隔即可，理由放在reason中；
  reason返回做出判断的理由，需要按照要求的结构总结一下再返回，格式为"具体分类：具体描述"，多个原因之间用分号分隔。

  注意：上面的爆火原因分类可能没有完全列举出来所有具体情况，你可以按照上面的输出格式去适当补充，然后返回给我。
  请确保返回的JSON数据结构正确，并且符合上述规则，不要返回JSON以外的字符。门店内容如下：%s`;

    const ext = {
      op_id: 0,
      prompt: prompt.replace('%s', analysisRequest.reviewBody),
      avg_price: analysisRequest.avgPrice || "0",
      city_name: analysisRequest.cityName || "未知",
      dp_poi_name: analysisRequest.dpPoiName || "未知门店",
      review_body: analysisRequest.reviewBody,
      review_count: analysisRequest.reviewCount || "0",
      overall_score: analysisRequest.overallScore || "0",
      platform_name: analysisRequest.platformName || "dp"
    };

    const request = this.buildRequest(
      this.defaultConfig.botKey,
      this.defaultConfig.workflowKey,
      ext,
      this.defaultConfig.humanId,
      this.defaultConfig.token
    );

    return await this.executeWorkflow(request);
  }

  /**
   * 使用自定义配置分析评论
   */
  async analyzeCommentWithConfig(
    analysisRequest: CommentAnalysisRequest,
    config: AIBoxWorkflowConfig
  ): Promise<AIBoxResponse> {
    const prompt = `背景：你是一位爆火原因分析专家，我会给你提供一家门店的相关评论信息。你的任务是分析这条评论，提炼出这家门店爆火的原因，最后给出判断依据。

  一、提炼门店爆火原因时可以参考如下分类：
  1. 装修风格独特：拍照打卡、易出图、古风、日式居酒屋、欧式宫廷风、典雅之类
  2. 互动性强：饭店有特殊节目才命中，比如变装，变脸，唱歌跳舞表演等，不包含生日祝福
  3. 菜品口感好：菜品口感好：好吃、推荐、某个菜品具有特色、独特的菜品做法等
  4. 价格便宜：性价比高、价格低、实惠、分量大
  5. 地理位置好：周边是旅游景点、风景好、有著名地标等
  6. 食材新鲜：原材料食材新鲜、有养殖基地、有屠宰场、专有供货渠道等
  7. 服务周到：除了基本接待服务外，有溢价服务，例如帮忙剥虾等
  8. 烟火气重：周边热闹、人气旺、步行街、小吃一条街等
  9. 网红效应：必须提到网红，明星等知名人士的带动才算命中，不包含排队，必吃，外地游客打卡等含义
  10. 厨师有名：米其林出身、多年老师傅等
  11. 米其林等榜单效应：米其林餐厅、米其林推荐入榜、必吃榜、黑珍珠等
  12. 热帖推荐：必须是小红书、 抖音、 大众点评、 携程等内容平台引流而来的，不包含排队，必吃，外地游客打卡等含义

  二、输出格式：使用JSON格式返回提取的信息，示例格式如下：
  {"tag":"菜品口感好、装修风格独特","reason":"口感出众：可颂酥脆层次分明、蛋挞香甜不腻；工业风易出图"}

  tag返回这家门店的爆火原因标签，一条评论可能有多种原因，使用顿号分隔即可，理由放在reason中；
  reason返回做出判断的理由，需要按照要求的结构总结一下再返回，格式为"具体分类：具体描述"，多个原因之间用分号分隔。

  注意：上面的爆火原因分类可能没有完全列举出来所有具体情况，你可以按照上面的输出格式去适当补充，然后返回给我。
  请确保返回的JSON数据结构正确，并且符合上述规则，不要返回JSON以外的字符。门店内容如下：%s`;

    const ext = {
      op_id: 0,
      prompt: prompt.replace('%s', analysisRequest.reviewBody),
      avg_price: analysisRequest.avgPrice || "0",
      city_name: analysisRequest.cityName || "未知",
      dp_poi_name: analysisRequest.dpPoiName || "未知门店",
      review_body: analysisRequest.reviewBody,
      review_count: analysisRequest.reviewCount || "0",
      overall_score: analysisRequest.overallScore || "0",
      platform_name: analysisRequest.platformName || "dp"
    };

    const request = this.buildRequest(
      config.botKey,
      config.workflowKey,
      ext,
      config.humanId,
      config.token
    );

    return await this.executeWorkflow(request);
  }

  /**
   * 获取默认配置
   */
  getDefaultConfig(): AIBoxWorkflowConfig {
    return { ...this.defaultConfig };
  }

  /**
   * 更新默认配置
   */
  updateDefaultConfig(config: Partial<AIBoxWorkflowConfig>): void {
    this.defaultConfig = { ...this.defaultConfig, ...config };
  }
}
