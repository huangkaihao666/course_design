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
  // 保存curl解析数据
  static async saveCurlParse(data: {
    productId: string;
    url: string;
    method: string;
    cookies: string;
    headers: Record<string, string>;
    queryParams: Record<string, string>;
    requestBody?: string;
    baseUrl: string;
  }) {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        `INSERT INTO curl_parses (product_id, url, method, cookies, headers, query_params, request_body, base_url) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.productId,
          data.url,
          data.method,
          data.cookies,
          JSON.stringify(data.headers),
          JSON.stringify(data.queryParams),
          data.requestBody || null,
          data.baseUrl
        ]
      );
      
      return (result as any).insertId;
    } finally {
      connection.release();
    }
  }

  // 保存爬虫配置
  static async saveSpiderConfig(data: {
    curlParseId: number;
    productId: string;
    productName?: string;
    cookies: string;
    maxPages: number;
    pageSize: number;
    headers: Record<string, string>;
    baseUrl: string;
    apiParams: any;
    configName?: string;
    configDescription?: string;
  }) {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        `INSERT INTO spider_configs (curl_parse_id, product_id, product_name, cookies, max_pages, page_size, headers, base_url, api_params, config_name, config_description) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.curlParseId,
          data.productId,
          data.productName || `商品ID: ${data.productId}`,
          data.cookies,
          data.maxPages,
          data.pageSize,
          JSON.stringify(data.headers),
          data.baseUrl,
          JSON.stringify(data.apiParams),
          data.configName || null,
          data.configDescription || null
        ]
      );
      
      return (result as any).insertId;
    } finally {
      connection.release();
    }
  }

  // 获取所有解析数据
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

  // 删除解析数据
  static async deleteCurlParse(id: number) {
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        `DELETE FROM curl_parses WHERE id = ?`,
        [id]
      );
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
}
