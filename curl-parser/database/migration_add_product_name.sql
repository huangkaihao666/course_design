-- 为spider_configs表添加product_name字段的迁移脚本
USE curl_parser_db;

-- 检查字段是否已存在，如果不存在则添加
SET @sql = (
    SELECT IF(
        (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = 'curl_parser_db' 
         AND TABLE_NAME = 'spider_configs' 
         AND COLUMN_NAME = 'product_name') = 0,
        'ALTER TABLE spider_configs ADD COLUMN product_name VARCHAR(500) COMMENT ''商品名称'' AFTER product_id;',
        'SELECT ''product_name字段已存在'' as message;'
    )
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 为现有记录设置默认的product_name值
UPDATE spider_configs 
SET product_name = CONCAT('商品ID: ', product_id) 
WHERE product_name IS NULL OR product_name = '';

-- 显示更新结果
SELECT 
    COUNT(*) as total_records,
    COUNT(CASE WHEN product_name IS NOT NULL AND product_name != '' THEN 1 END) as records_with_product_name
FROM spider_configs;
