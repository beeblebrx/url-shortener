import { ApiResponse, ApiError, SortField, SortOrder } from '../types';

const API_BASE_URL = 'http://localhost:5000';

export interface FetchUrlsParams {
  page?: number;
  per_page?: number;
  sort_by?: SortField;
  order?: SortOrder;
}

export class ApiService {
  static async fetchUrls(params: FetchUrlsParams = {}): Promise<ApiResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.per_page) searchParams.append('per_page', params.per_page.toString());
    if (params.sort_by) searchParams.append('sort_by', params.sort_by);
    if (params.order) searchParams.append('order', params.order);

    const url = `${API_BASE_URL}/urls${searchParams.toString() ? '?' + searchParams.toString() : ''}`;

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }
}
