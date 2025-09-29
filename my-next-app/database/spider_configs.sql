-- 爬虫配置表
-- 用于存储商品评论爬取的配置信息

USE curl_parser_db;

-- 爬虫配置表
CREATE TABLE IF NOT EXISTS spider_configs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    curl_parse_id INT COMMENT '关联的curl解析记录ID',
    product_id VARCHAR(255) NOT NULL COMMENT '商品ID',
    product_name VARCHAR(500) NOT NULL COMMENT '商品名称',
    cookies TEXT NOT NULL COMMENT 'Cookie信息',
    max_pages INT DEFAULT 3 COMMENT '最大爬取页数',
    page_size INT DEFAULT 20 COMMENT '每页评论数量',
    config_name VARCHAR(255) COMMENT '配置名称',
    config_description TEXT COMMENT '配置描述',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    last_crawl_at TIMESTAMP NULL COMMENT '最后爬取时间',
    crawl_count INT DEFAULT 0 COMMENT '爬取次数',
    success_count INT DEFAULT 0 COMMENT '成功次数',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    created_by VARCHAR(255) DEFAULT 'admin' COMMENT '创建者',
    UNIQUE KEY uk_product_id (product_id),
    INDEX idx_curl_parse_id (curl_parse_id),
    INDEX idx_is_active (is_active),
    INDEX idx_created_at (created_at),
    INDEX idx_last_crawl_at (last_crawl_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='爬虫配置表';

-- 爬虫执行日志表
CREATE TABLE IF NOT EXISTS spider_execution_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    spider_config_id INT NOT NULL COMMENT '爬虫配置ID',
    product_id VARCHAR(255) NOT NULL COMMENT '商品ID',
    status ENUM('pending', 'running', 'success', 'failed') DEFAULT 'pending' COMMENT '执行状态',
    start_time TIMESTAMP NULL COMMENT '开始时间',
    end_time TIMESTAMP NULL COMMENT '结束时间',
    pages_crawled INT DEFAULT 0 COMMENT '已爬取页数',
    comments_crawled INT DEFAULT 0 COMMENT '已爬取评论数',
    error_message TEXT COMMENT '错误信息',
    execution_log TEXT COMMENT '执行日志',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (spider_config_id) REFERENCES spider_configs(id) ON DELETE CASCADE,
    INDEX idx_spider_config_id (spider_config_id),
    INDEX idx_product_id (product_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='爬虫执行日志表';

-- 插入示例配置
INSERT INTO spider_configs (
    product_id, 
    product_name, 
    cookies, 
    max_pages, 
    page_size, 
    config_name, 
    config_description,
    created_by
) VALUES (
    'example_product_123',
    '示例商品',
    'session_id=abc123; user_token=xyz789;',
    3,
    20,
    '示例爬虫配置',
    '这是一个示例爬虫配置，用于演示功能',
    'admin'
) ON DUPLICATE KEY UPDATE
    product_name = VALUES(product_name),
    cookies = VALUES(cookies),
    max_pages = VALUES(max_pages),
    page_size = VALUES(page_size),
    config_name = VALUES(config_name),
    config_description = VALUES(config_description),
    updated_at = CURRENT_TIMESTAMP;
