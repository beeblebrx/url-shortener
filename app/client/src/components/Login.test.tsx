import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from './Login';
import { ApiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

jest.mock('../services/api');
jest.mock('../contexts/AuthContext');

const mockApiService = ApiService as jest.Mocked<typeof ApiService>;
const mockUseAuth = useAuth as jest.Mock;

describe('Login', () => {
    const onLoginSuccess = jest.fn();
    const onClose = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseAuth.mockReturnValue({
            checkAuthStatus: jest.fn().mockResolvedValue(undefined),
        });
    });

    it('should handle successful login', async () => {
        mockApiService.sendLogin.mockResolvedValue(undefined);

        render(<Login onLoginSuccess={onLoginSuccess} onClose={onClose} />);

        fireEvent.change(screen.getByLabelText(/username/i), {
            target: { value: 'testuser' },
        });
        fireEvent.change(screen.getByLabelText(/password/i), {
            target: { value: 'password' },
        });
        fireEvent.click(screen.getByRole('button', { name: /log in/i }));

        await waitFor(() => {
            expect(onLoginSuccess).toHaveBeenCalled();
            expect(onClose).toHaveBeenCalled();
        });
    });

    it('should handle unsuccessful login due to API error', async () => {
        mockApiService.sendLogin.mockRejectedValue(
            new Error('Invalid credentials')
        );

        render(<Login onLoginSuccess={onLoginSuccess} onClose={onClose} />);

        fireEvent.change(screen.getByLabelText(/username/i), {
            target: { value: 'testuser' },
        });
        fireEvent.change(screen.getByLabelText(/password/i), {
            target: { value: 'wrongpassword' },
        });
        fireEvent.click(screen.getByRole('button', { name: /log in/i }));

        await waitFor(() => {
            expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
        });
    });

    it('should show validation error if fields are empty', async () => {
        render(<Login onLoginSuccess={onLoginSuccess} onClose={onClose} />);

        fireEvent.click(screen.getByRole('button', { name: /log in/i }));

        await waitFor(() => {
            expect(
                screen.getByText('Enter both username and password')
            ).toBeInTheDocument();
        });
    });
});
