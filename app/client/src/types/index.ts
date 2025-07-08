export interface UrlItem {
  original_url: string;
  short_code: string;
  created_at: string;
  expires_at: string | null;
  is_permanent: boolean;
  click_count: number;
  last_accessed: string | null;
  user?: {
    username: string;
  };
}

export interface PaginationInfo {
  page: number;
  per_page: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface SortInfo {
  sort_by: string;
  order: 'asc' | 'desc';
}

export interface ApiResponse {
  urls: UrlItem[];
  pagination: PaginationInfo;
  sort: SortInfo;
}

export interface ApiError {
  error: string;
}

export type SortField = 'created_at' | 'expires_at' | 'click_count' | 'short_code';
export type SortOrder = 'asc' | 'desc';
