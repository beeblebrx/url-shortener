import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Registration from './Registration';
import { ApiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useRegistration } from '../hooks/useRegistration';

jest.mock('../services/api');
jest.mock('../contexts/AuthContext');
jest.mock('../hooks/useRegistration');

const mockApiService = ApiService as jest.Mocked<typeof ApiService>;
const mockUseAuth = useAuth as jest.Mock;
const mockUseRegistration = useRegistration as jest.Mock;

describe('Registration', () => {
    const onRegistrationSuccess = jest.fn();
    const onClose = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should handle successful registration', async () => {
        mockUseAuth.mockReturnValue({
            checkAuthStatus: jest.fn().mockResolvedValue(undefined),
        });
        mockUseRegistration.mockReturnValue({
            username: 'testuser',
            setUsername: jest.fn(),
            password: 'Password123',
            setPassword: jest.fn(),
            confirmPassword: 'Password123',
            setConfirmPassword: jest.fn(),
            error: null,
            setError: jest.fn(),
            loading: false,
            setLoading: jest.fn(),
            validate: jest.fn().mockReturnValue(true),
        });
        mockApiService.register.mockResolvedValue(undefined);

        render(
            <Registration
                onRegistrationSuccess={onRegistrationSuccess}
                onClose={onClose}
            />
        );

        fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

        await waitFor(() => {
            expect(onRegistrationSuccess).toHaveBeenCalled();
            expect(onClose).toHaveBeenCalled();
        });
    });

    it('should handle unsuccessful registration due to API error', async () => {
        const setError = jest.fn();
        mockUseAuth.mockReturnValue({
            checkAuthStatus: jest.fn(),
        });
        mockUseRegistration.mockReturnValue({
            username: 'testuser',
            setUsername: jest.fn(),
            password: 'Password123',
            setPassword: jest.fn(),
            confirmPassword: 'Password123',
            setConfirmPassword: jest.fn(),
            error: null,
            setError,
            loading: false,
            setLoading: jest.fn(),
            validate: jest.fn().mockReturnValue(true),
        });
        mockApiService.register.mockRejectedValue(
            new Error('Username already exists')
        );

        render(
            <Registration
                onRegistrationSuccess={onRegistrationSuccess}
                onClose={onClose}
            />
        );

        fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

        await waitFor(() => {
            expect(setError).toHaveBeenCalledWith('Username already exists');
        });
    });

    it('should handle unsuccessful registration due to validation error', async () => {
        mockUseAuth.mockReturnValue({
            checkAuthStatus: jest.fn(),
        });
        mockUseRegistration.mockReturnValue({
            username: '',
            setUsername: jest.fn(),
            password: '',
            setPassword: jest.fn(),
            confirmPassword: '',
            setConfirmPassword: jest.fn(),
            error: null,
            setError: jest.fn(),
            loading: false,
            setLoading: jest.fn(),
            validate: jest.fn().mockReturnValue(false),
        });

        render(
            <Registration
                onRegistrationSuccess={onRegistrationSuccess}
                onClose={onClose}
            />
        );

        fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

        await waitFor(() => {
            expect(mockApiService.register).not.toHaveBeenCalled();
        });
    });
});
