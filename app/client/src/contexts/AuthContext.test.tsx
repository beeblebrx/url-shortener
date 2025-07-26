import { renderHook, act } from '@testing-library/react';
import { TokenProvider, useAuth } from './AuthContext';
import { ApiService } from '../services/api';

jest.mock('../services/api');

const mockApiService = ApiService as jest.Mocked<typeof ApiService>;

describe('AuthContext', () => {
    it('should check auth status on mount and update state if authenticated', async () => {
        mockApiService.checkAuthStatus.mockResolvedValue({
            authenticated: true,
            username: 'testuser',
        });

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <TokenProvider>{children}</TokenProvider>
        );
        const { result } = renderHook(() => useAuth(), { wrapper });

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for the useEffect to run
        });

        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.username).toBe('testuser');
    });

    it('should check auth status on mount and update state if not authenticated', async () => {
        mockApiService.checkAuthStatus.mockResolvedValue({
            authenticated: false,
        });

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <TokenProvider>{children}</TokenProvider>
        );
        const { result } = renderHook(() => useAuth(), { wrapper });

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.username).toBeNull();
    });

    it('should handle logout correctly', async () => {
        mockApiService.checkAuthStatus.mockResolvedValue({
            authenticated: true,
            username: 'testuser',
        });
        mockApiService.logout.mockResolvedValue(undefined);

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <TokenProvider>{children}</TokenProvider>
        );
        const { result } = renderHook(() => useAuth(), { wrapper });

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(result.current.isAuthenticated).toBe(true);

        await act(async () => {
            await result.current.logout();
        });

        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.username).toBeNull();
    });

    it('should handle logout failure but still clear local state', async () => {
        mockApiService.checkAuthStatus.mockResolvedValue({
            authenticated: true,
            username: 'testuser',
        });
        mockApiService.logout.mockRejectedValue(new Error('Logout failed'));

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <TokenProvider>{children}</TokenProvider>
        );
        const { result } = renderHook(() => useAuth(), { wrapper });

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(result.current.isAuthenticated).toBe(true);

        await act(async () => {
            await result.current.logout();
        });

        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.username).toBeNull();
    });

    it('should throw an error if useAuth is used outside of TokenProvider', () => {
        const { result } = renderHook(() => {
            try {
                return useAuth();
            } catch (e) {
                return e;
            }
        });
        expect(result.current).toEqual(
            new Error('useToken must be used within a AuthProvider')
        );
    });
});
