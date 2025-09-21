-- 创建curl解析数据表
USE curl_parser_db;

-- 主表：存储curl解析的基本信息
CREATE TABLE IF NOT EXISTS curl_parses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id VARCHAR(100) NOT NULL COMMENT '商品ID',
    url TEXT NOT NULL COMMENT '请求URL',
    method VARCHAR(10) NOT NULL COMMENT '请求方法',
    cookies TEXT COMMENT '所有cookies，以分号分隔的字符串',
    headers JSON COMMENT '请求头，存储为JSON格式',
    query_params JSON COMMENT '查询参数，存储为JSON格式',
    request_body TEXT COMMENT '请求体',
    base_url TEXT COMMENT '基础URL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_product_id (product_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Curl解析数据表';

-- 爬虫配置表：存储解析后的爬虫配置
CREATE TABLE IF NOT EXISTS spider_configs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    curl_parse_id INT NOT NULL COMMENT '关联的curl解析ID',
    product_id VARCHAR(100) NOT NULL COMMENT '商品ID',
    cookies TEXT NOT NULL COMMENT 'cookies字符串',
    max_pages INT DEFAULT 3 COMMENT '最大页数',
    page_size INT DEFAULT 20 COMMENT '每页大小',
    headers JSON COMMENT '请求头配置',
    base_url TEXT NOT NULL COMMENT '基础URL',
    api_params JSON COMMENT 'API参数配置',
    config_name VARCHAR(255) COMMENT '配置名称',
    config_description TEXT COMMENT '配置描述',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (curl_parse_id) REFERENCES curl_parses(id) ON DELETE CASCADE,
    INDEX idx_product_id (product_id),
    INDEX idx_config_name (config_name),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='爬虫配置表';

-- 创建视图：方便查询解析数据
CREATE OR REPLACE VIEW curl_parse_summary AS
SELECT 
    cp.id,
    cp.product_id,
    cp.url,
    cp.method,
    cp.created_at,
    JSON_LENGTH(cp.headers) as header_count,
    JSON_LENGTH(cp.query_params) as param_count,
    LENGTH(cp.cookies) as cookie_length,
    sc.config_name,
    sc.config_description
FROM curl_parses cp
LEFT JOIN spider_configs sc ON cp.id = sc.curl_parse_id;
