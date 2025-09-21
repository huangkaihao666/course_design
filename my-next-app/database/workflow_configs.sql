-- 工作流配置表
-- 用于存储不同AIBox工作流的配置信息

USE curl_parser_db;

-- 工作流配置表
CREATE TABLE IF NOT EXISTS workflow_configs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    workflow_name VARCHAR(255) NOT NULL COMMENT '工作流名称',
    workflow_key VARCHAR(500) NOT NULL COMMENT '工作流Key',
    bot_key VARCHAR(255) NOT NULL COMMENT 'Bot Key',
    human_id VARCHAR(255) NOT NULL COMMENT 'Human ID',
    token VARCHAR(500) NOT NULL COMMENT 'Token',
    workflow_type ENUM('comment_analysis', 'sentiment_analysis', 'boom_reason', 'custom') NOT NULL COMMENT '工作流类型',
    description TEXT COMMENT '工作流描述',
    prompt_template TEXT NOT NULL COMMENT '提示词模板',
    required_params JSON COMMENT '必需参数列表',
    optional_params JSON COMMENT '可选参数列表',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    created_by VARCHAR(255) COMMENT '创建者',
    UNIQUE KEY uk_workflow_key (workflow_key),
    INDEX idx_workflow_type (workflow_type),
    INDEX idx_is_active (is_active),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AIBox工作流配置表';

-- 插入默认的工作流配置
INSERT INTO workflow_configs (
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
    created_by
) VALUES 
-- 评论爆火原因分析工作流
(
    '评论爆火原因分析',
    '#workflow#bot_main_xubohua0220250825110350148',
    'xubohua0220250825110350148',
    'huangkaihao03',
    'p0stV8PoCjypXjNHGFBjbEX8xTtljdgVOHFclnqotbo=',
    'boom_reason',
    '分析商品评论的爆火原因，识别装修风格、菜品口感、价格优势等因素',
    '背景：你是一位爆火原因分析专家，我会给你提供一家门店的相关评论信息。你的任务是分析这条评论，提炼出这家门店爆火的原因，最后给出判断依据。

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
  请确保返回的JSON数据结构正确，并且符合上述规则，不要返回JSON以外的字符。门店内容如下：%s',
    '["review_body"]',
    '["avg_price", "city_name", "dp_poi_name", "review_count", "overall_score", "platform_name"]',
    'system'
),
-- 评论情感分析工作流（示例配置，需要你提供真实的workflowKey）
(
    '评论情感分析',
    '#workflow#sentiment_analysis_workflow_key',
    'xubohua0220250825110350148',
    'huangkaihao03',
    'p0stV8PoCjypXjNHGFBjbEX8xTtljdgVOHFclnqotbo=',
    'sentiment_analysis',
    '分析商品评论的情感倾向，判断正面、负面或中性评价',
    '你是一位专业的情感分析专家。请分析以下商品评论的情感倾向，并给出详细的分析结果。

评论内容：%s
商品信息：%s
评分：%s

请按照以下JSON格式返回分析结果：
{
  "sentiment": "positive/negative/neutral",
  "confidence": 0.85,
  "emotion_tags": ["满意", "推荐"],
  "key_points": ["质量好", "性价比高"],
  "suggestion": "建议继续关注用户反馈"
}

请确保返回的JSON格式正确，不要包含其他文字。',
    '["content", "product_name", "rating"]',
    '["user_nick", "date", "sku_info", "useful_count", "reply"]',
    'system'
),
-- 评论关键词提取工作流（示例配置）
(
    '评论关键词提取',
    '#workflow#keyword_extraction_workflow_key',
    'xubohua0220250825110350148',
    'huangkaihao03',
    'p0stV8PoCjypXjNHGFBjbEX8xTtljdgVOHFclnqotbo=',
    'comment_analysis',
    '从商品评论中提取关键词和关键信息',
    '你是一位专业的关键词提取专家。请从以下商品评论中提取关键词和关键信息。

评论内容：%s
商品信息：%s

请按照以下JSON格式返回提取结果：
{
  "keywords": ["质量", "价格", "服务"],
  "key_phrases": ["性价比很高", "质量不错"],
  "product_aspects": ["外观", "功能", "价格"],
  "summary": "用户对商品整体评价较好"
}

请确保返回的JSON格式正确，不要包含其他文字。',
    '["content", "product_name"]',
    '["user_nick", "rating", "date", "sku_info"]',
    'system'
);

-- 创建工作流执行记录表（可选，用于记录工作流调用历史）
CREATE TABLE IF NOT EXISTS workflow_execution_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    workflow_config_id INT NOT NULL COMMENT '工作流配置ID',
    product_id VARCHAR(100) COMMENT '商品ID',
    input_params JSON COMMENT '输入参数',
    output_result JSON COMMENT '输出结果',
    execution_time_ms INT COMMENT '执行时间(毫秒)',
    success BOOLEAN NOT NULL COMMENT '是否成功',
    error_message TEXT COMMENT '错误信息',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '执行时间',
    FOREIGN KEY (workflow_config_id) REFERENCES workflow_configs(id) ON DELETE CASCADE,
    INDEX idx_workflow_config_id (workflow_config_id),
    INDEX idx_product_id (product_id),
    INDEX idx_created_at (created_at),
    INDEX idx_success (success)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工作流执行记录表';
