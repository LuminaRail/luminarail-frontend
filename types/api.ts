export interface ApiErrorDetail {
  code?: string;
  message?: string;
  details?: unknown;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  success?: boolean;
  data?: T;
  message?: string;
  code?: string;
  error?: ApiErrorDetail | string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
