export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface QueryFilters {
  [key: string]: any;
}

export interface SortOptions {
  field: string;
  order: 'ASC' | 'DESC';
}