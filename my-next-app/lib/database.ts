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
        `SELECT sc.*, cp.url, cp.method 
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
        `SELECT sc.*, cp.url, cp.method 
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
        `SELECT sc.*, cp.url, cp.method 
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
        avgRating: (ratingRows as any)[0].avg_rating
      };
    } finally {
      connection.release();
    }
  }
}
