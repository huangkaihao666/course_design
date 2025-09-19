export interface ParsedCurl {
  url: string;
  method: string;
  headers: Record<string, string>;
  cookies: Record<string, string>;
  body?: string;
  queryParams: Record<string, string>;
}

export interface TaobaoApiParams {
  auctionNumId: string;      // 商品ID
  pageNo: number;            // 页码
  pageSize: number;          // 每页大小
  orderType: string;         // 排序类型
  searchImpr: string;        // 搜索标记
  expression: string;        // 表达式
  skuVids: string;          // SKU视频ID
  rateSrc: string;          // 评分来源
  rateType: string;         // 评分类型
  showTrueCount: boolean;   // 显示真实数量
}

export interface SpiderConfig {
  productId: string;
  cookies: string;
  maxPages: number;
  pageSize: number;
  headers: Record<string, string>;
  baseUrl: string;
  apiParams: TaobaoApiParams;
}

export interface ConfigPreset {
  id: string;
  name: string;
  description: string;
  config: SpiderConfig;
  createdAt: string;
  updatedAt: string;
}
