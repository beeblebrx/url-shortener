import { ApiResponse, ApiError, SortField, SortOrder } from '../types';
import { ErrorWithStatus } from './ErrorWithCode';

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
        if (params.per_page)
            searchParams.append('per_page', params.per_page.toString());
        if (params.sort_by) searchParams.append('sort_by', params.sort_by);
        if (params.order) searchParams.append('order', params.order);

        const url = `${API_BASE_URL}/my-urls${
            searchParams.toString() ? '?' + searchParams.toString() : ''
        }`;

        try {
            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData: ApiError = await response.json();
                throw new ErrorWithStatus(
                    errorData.error || `HTTP error! status: ${response.status}`,
                    response.status
                );
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

    static async shortenUrl(url: string) {
        const response = await fetch(`${API_BASE_URL}/shorten`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ url }),
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Login required to create shortened URLs');
            }
            const errorData: ApiError = await response.json();
            throw new Error(
                errorData.error || `HTTP error! status: ${response.status}`
            );
        }
    }

    static async login(username: string, password: string) {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            const errorData: ApiError = await response.json();
            throw new Error(
                errorData.error || `HTTP error! status: ${response.status}`
            );
        }

        return response.json();
    }

    static async register(username: string, password: string) {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            const errorData: ApiError = await response.json();
            throw new Error(
                errorData.error || `HTTP error! status: ${response.status}`
            );
        }

        return response.json();
    }

    static async logout() {
        const response = await fetch(`${API_BASE_URL}/logout`, {
            method: 'POST',
            credentials: 'include',
        });

        if (!response.ok) {
            const errorData: ApiError = await response.json();
            throw new Error(
                errorData.error || `HTTP error! status: ${response.status}`
            );
        }

        return response.json();
    }

    static async checkAuthStatus(): Promise<{
        authenticated: boolean;
        username?: string;
    }> {
        try {
            const response = await fetch(`${API_BASE_URL}/auth-status`, {
                method: 'GET',
                credentials: 'include',
            });

            if (response.ok) {
                return response.json();
            } else {
                return { authenticated: false };
            }
        } catch (error) {
            return { authenticated: false };
        }
    }
}
