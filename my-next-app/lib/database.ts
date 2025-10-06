import mysql from 'mysql2/promise';

// 数据库配置
const dbConfig = {
  host: 'localhost',
  user: 'huangkaihao',
  password: 'hkh618618',
  database: 'curl_parser_db',
  charset: 'utf8mb4',
  timezone: '+08:00'
};

// 创建连接池
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;

// 数据库操作函数
export class DatabaseService {
  // 获取所有curl解析数据
  static async getAllCurlParses() {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT * FROM curl_parse_summary ORDER BY created_at DESC`
      );
      return rows;
    } finally {
      connection.release();
    }
  }

  // 根据商品ID获取解析数据
  static async getCurlParseByProductId(productId: string) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT * FROM curl_parses WHERE product_id = ? ORDER BY created_at DESC`,
        [productId]
      );
      return rows;
    } finally {
      connection.release();
    }
  }

  // 获取爬虫配置
  static async getSpiderConfigs() {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT 
           sc.id,
           sc.curl_parse_id,
           sc.product_id,
           COALESCE(
             sc.product_name,
             (SELECT c.product_name FROM comments c WHERE c.product_id = sc.product_id ORDER BY c.created_at DESC LIMIT 1),
             CONCAT('商品ID: ', sc.product_id)
           ) AS product_name,
           sc.cookies,
           sc.max_pages,
           sc.page_size,
           sc.config_name,
           sc.config_description,
           sc.is_active,
           sc.last_crawl_at,
           sc.crawl_count,
           sc.success_count,
           sc.created_at,
           sc.updated_at,
           sc.created_by,
           cp.url,
           cp.method
         FROM spider_configs sc 
         LEFT JOIN curl_parses cp ON sc.curl_parse_id = cp.id 
         ORDER BY sc.created_at DESC`
      );
      return rows;
    } finally {
      connection.release();
    }
  }

  // 根据商品ID获取爬虫配置
  static async getSpiderConfigByProductId(productId: string) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT 
           sc.id,
           sc.curl_parse_id,
           sc.product_id,
           COALESCE(
             sc.product_name,
             (SELECT c.product_name FROM comments c WHERE c.product_id = sc.product_id ORDER BY c.created_at DESC LIMIT 1),
             CONCAT('商品ID: ', sc.product_id)
           ) AS product_name,
           sc.cookies,
           sc.max_pages,
           sc.page_size,
           sc.config_name,
           sc.config_description,
           sc.is_active,
           sc.last_crawl_at,
           sc.crawl_count,
           sc.success_count,
           sc.created_at,
           sc.updated_at,
           sc.created_by,
           cp.url,
           cp.method
         FROM spider_configs sc 
         LEFT JOIN curl_parses cp ON sc.curl_parse_id = cp.id 
         WHERE sc.product_id = ? 
         ORDER BY sc.created_at DESC`,
        [productId]
      );
      return rows;
    } finally {
      connection.release();
    }
  }

  // 获取最新的爬虫配置
  static async getLatestSpiderConfig() {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT 
           sc.id,
           sc.curl_parse_id,
           sc.product_id,
           COALESCE(
             sc.product_name,
             (SELECT c.product_name FROM comments c WHERE c.product_id = sc.product_id ORDER BY c.created_at DESC LIMIT 1),
             CONCAT('商品ID: ', sc.product_id)
           ) AS product_name,
           sc.cookies,
           sc.max_pages,
           sc.page_size,
           sc.config_name,
           sc.config_description,
           sc.is_active,
           sc.last_crawl_at,
           sc.crawl_count,
           sc.success_count,
           sc.created_at,
           sc.updated_at,
           sc.created_by,
           cp.url,
           cp.method
         FROM spider_configs sc 
         LEFT JOIN curl_parses cp ON sc.curl_parse_id = cp.id 
         ORDER BY sc.created_at DESC 
         LIMIT 1`
      );
      return (rows as any[])[0] || null;
    } finally {
      connection.release();
    }
  }

  // 获取所有商品ID列表
  static async getAllProductIds() {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT DISTINCT product_id FROM curl_parses ORDER BY created_at DESC`
      );
      return (rows as any[]).map((row: any) => row.product_id);
    } finally {
      connection.release();
    }
  }

  // 获取解析数据统计
  static async getParseStats() {
    const connection = await pool.getConnection();
    try {
      const [totalRows] = await connection.execute(
        `SELECT COUNT(*) as total FROM curl_parses`
      );
      
      const [configRows] = await connection.execute(
        `SELECT COUNT(*) as total FROM spider_configs`
      );
      
      const [productRows] = await connection.execute(
        `SELECT COUNT(DISTINCT product_id) as total FROM curl_parses`
      );

      return {
        totalParses: (totalRows as any)[0].total,
        totalConfigs: (configRows as any)[0].total,
        uniqueProducts: (productRows as any)[0].total
      };
    } finally {
      connection.release();
    }
  }

  // 保存评论数据
  static async saveComments(productId: string, comments: any[], productInfo: any = null) {
    const connection = await pool.getConnection();
    try {
      // 先删除该商品的历史评论数据
      await connection.execute(
        `DELETE FROM comments WHERE product_id = ?`,
        [productId]
      );

      // 批量插入新评论数据
      if (comments.length > 0) {
        const productName = productInfo?.product_name || `商品ID: ${productId}`;
        
        const values = comments.map(comment => [
          productId,
          productName,
          comment.user_nick || '',
          comment.content || '',
          comment.rating || 0,
          comment.date || '',
          comment.useful_count || 0,
          comment.reply || '',
          comment.sku_info || '',
          JSON.stringify(comment.pics || [])
        ]);

        const placeholders = values.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
        const flatValues = values.flat();

        await connection.execute(
          `INSERT INTO comments (product_id, product_name, user_nick, content, rating, date, useful_count, reply, sku_info, pics) VALUES ${placeholders}`,
          flatValues
        );
      }

      return { success: true, count: comments.length };
    } catch (error) {
      console.error('保存评论数据失败:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // 根据商品ID获取评论数据
  static async getCommentsByProductId(productId: string) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT * FROM comments WHERE product_id = ? ORDER BY created_at DESC`,
        [productId]
      );
      return rows;
    } finally {
      connection.release();
    }
  }

  // 获取所有评论数据
  static async getAllComments() {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT * FROM comments ORDER BY created_at DESC`
      );
      return rows;
    } finally {
      connection.release();
    }
  }

  // 获取评论统计信息
  static async getCommentStats() {
    const connection = await pool.getConnection();
    try {
      const [totalRows] = await connection.execute(
        `SELECT COUNT(*) as total FROM comments`
      );
      
      const [productRows] = await connection.execute(
        `SELECT COUNT(DISTINCT product_id) as total FROM comments`
      );

      const [ratingRows] = await connection.execute(
        `SELECT AVG(rating) as avg_rating FROM comments`
      );

      return {
        totalComments: (totalRows as any)[0].total,
        uniqueProducts: (productRows as any)[0].total,
        avgRating: Number((ratingRows as any)[0].avg_rating) || 0
      };
    } finally {
      connection.release();
    }
  }


  // 根据ID获取爬虫配置
  static async getSpiderConfigById(id: number) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT * FROM spider_configs WHERE id = ?`,
        [id]
      );
      return (rows as any)[0] || null;
    } finally {
      connection.release();
    }
  }

  // 保存爬虫配置
  static async saveSpiderConfig(config: any) {
    const connection = await pool.getConnection();
    try {
      const { id, product_id, product_name, cookies, max_pages, page_size, config_name, config_description } = config;
      
      if (id) {
        // 更新配置
        await connection.execute(
          `UPDATE spider_configs SET 
           product_id = ?, product_name = ?, cookies = ?, max_pages = ?, 
           page_size = ?, config_name = ?, config_description = ? 
           WHERE id = ?`,
          [product_id, product_name, cookies, max_pages, page_size, config_name, config_description, id]
        );
      } else {
        // 新增配置 - 使用默认的curl_parse_id
        await connection.execute(
          `INSERT INTO spider_configs 
           (curl_parse_id, product_id, product_name, cookies, max_pages, page_size, config_name, config_description) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [1, product_id, product_name, cookies, max_pages, page_size, config_name, config_description]
        );
      }
      
      return true;
    } finally {
      connection.release();
    }
  }

  // 删除爬虫配置
  static async deleteSpiderConfig(id: number) {
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        `DELETE FROM spider_configs WHERE id = ?`,
        [id]
      );
      return true;
    } finally {
      connection.release();
    }
  }

  // 获取情感分析统计
  static async getSentimentStats() {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT 
          COUNT(CASE WHEN JSON_EXTRACT(analysis, '$.emotion_type') = 'positive' THEN 1 END) as positive,
          COUNT(CASE WHEN JSON_EXTRACT(analysis, '$.emotion_type') = 'negative' THEN 1 END) as negative,
          COUNT(CASE WHEN JSON_EXTRACT(analysis, '$.emotion_type') = 'neutral' THEN 1 END) as neutral,
          COUNT(CASE WHEN analysis IS NOT NULL AND JSON_EXTRACT(analysis, '$.emotion_type') IS NOT NULL THEN 1 END) as analyzed
         FROM comments`
      );
      
      const result = (rows as any)[0];
      return {
        sentimentStats: {
          positive: result.positive || 0,
          negative: result.negative || 0,
          neutral: result.neutral || 0
        },
        analyzedComments: result.analyzed || 0
      };
    } finally {
      connection.release();
    }
  }

  // 获取评分分布
  static async getRatingDistribution() {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT 
          rating,
          COUNT(*) as count
         FROM comments 
         WHERE rating IS NOT NULL
         GROUP BY rating
         ORDER BY rating DESC`
      );
      
      const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      (rows as any[]).forEach((row: any) => {
        if (row.rating >= 1 && row.rating <= 5) {
          distribution[row.rating as keyof typeof distribution] = row.count;
        }
      });
      
      return { ratingDistribution: distribution };
    } finally {
      connection.release();
    }
  }

  // 获取商品类型统计
  static async getProductTypeStats() {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT 
          CASE 
            WHEN product_name LIKE '%手机%' OR product_name LIKE '%电脑%' OR product_name LIKE '%电子%' THEN '电子产品'
            WHEN product_name LIKE '%衣服%' OR product_name LIKE '%鞋%' OR product_name LIKE '%包%' THEN '服装鞋帽'
            WHEN product_name LIKE '%家具%' OR product_name LIKE '%家居%' OR product_name LIKE '%厨具%' THEN '家居用品'
            WHEN product_name LIKE '%化妆品%' OR product_name LIKE '%护肤%' OR product_name LIKE '%美妆%' THEN '美妆护肤'
            ELSE '其他'
          END as type,
          COUNT(DISTINCT product_id) as count
         FROM comments 
         GROUP BY type
         ORDER BY count DESC`
      );
      
      const total = (rows as any[]).reduce((sum, row) => sum + row.count, 0);
      const productTypes = (rows as any[]).map((row: any) => ({
        type: row.type,
        count: row.count,
        percentage: total > 0 ? Math.round((row.count / total) * 100) : 0
      }));
      
      return { productTypes };
    } finally {
      connection.release();
    }
  }

  // 获取爬虫配置统计
  static async getConfigStats() {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT COUNT(*) as total FROM spider_configs`
      );
      
      const [workflowRows] = await connection.execute(
        `SELECT COUNT(*) as total FROM workflow_configs`
      );
      
      return {
        totalConfigs: (rows as any)[0].total || 0,
        totalWorkflows: (workflowRows as any)[0].total || 0
      };
    } finally {
      connection.release();
    }
  }

  // 获取最近活动
  static async getRecentActivity() {
    const connection = await pool.getConnection();
    try {
      const [commentRows] = await connection.execute(
        `SELECT 
          'comment' as type,
          '新增评论数据' as description,
          created_at as time,
          COUNT(*) as count
         FROM comments 
         WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
         GROUP BY DATE(created_at), HOUR(created_at)
         ORDER BY created_at DESC
         LIMIT 5`
      );
      
      const [configRows] = await connection.execute(
        `SELECT 
          'config' as type,
          '更新爬虫配置' as description,
          created_at as time,
          COUNT(*) as count
         FROM spider_configs 
         WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
         GROUP BY DATE(created_at), HOUR(created_at)
         ORDER BY created_at DESC
         LIMIT 3`
      );
      
      const activities = [
        ...(commentRows as any[]).map((row: any) => ({
          ...row,
          time: `${Math.floor((Date.now() - new Date(row.time).getTime()) / 60000)}分钟前`
        })),
        ...(configRows as any[]).map((row: any) => ({
          ...row,
          time: `${Math.floor((Date.now() - new Date(row.time).getTime()) / 60000)}分钟前`
        }))
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);
      
      return { recentActivity: activities };
    } finally {
      connection.release();
    }
  }

  // 保存工作流执行记录
  static async saveWorkflowExecutionLog(logData: {
    workflowConfigId: number;
    productId?: string;
    inputParams: any;
    outputResult: any;
    executionTimeMs: number;
    success: boolean;
    errorMessage?: string;
  }) {
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        `INSERT INTO workflow_execution_logs 
         (workflow_config_id, product_id, input_params, output_result, execution_time_ms, success, error_message)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          logData.workflowConfigId,
          logData.productId,
          JSON.stringify(logData.inputParams),
          logData.outputResult ? JSON.stringify(logData.outputResult) : null,
          logData.executionTimeMs,
          logData.success ? 1 : 0,
          logData.errorMessage
        ]
      );
      return true;
    } finally {
      connection.release();
    }
  }

  // 更新评论分析结果
  static async updateCommentAnalysis(commentId: number, analysisData: any) {
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        `UPDATE comments SET analysis = ? WHERE id = ?`,
        [JSON.stringify(analysisData), commentId]
      );
      return true;
    } finally {
      connection.release();
    }
  }
}
