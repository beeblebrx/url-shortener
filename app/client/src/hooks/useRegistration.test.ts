import { renderHook, act } from '@testing-library/react';
import { useRegistration } from './useRegistration';

describe('useRegistration', () => {
    it('should have correct initial state', () => {
        const { result } = renderHook(() => useRegistration());

        expect(result.current.username).toBe('');
        expect(result.current.password).toBe('');
        expect(result.current.confirmPassword).toBe('');
        expect(result.current.error).toBeNull();
        expect(result.current.loading).toBe(false);
    });

    it('should set error if any field is empty', () => {
        const { result } = renderHook(() => useRegistration());

        act(() => {
            result.current.validate();
        });

        expect(result.current.error).toBe('All fields are required');
    });

    it('should set error if passwords do not match', () => {
        const { result } = renderHook(() => useRegistration());

        act(() => {
            result.current.setUsername('testuser');
            result.current.setPassword('Password123');
            result.current.setConfirmPassword('Password1234');
        });

        act(() => {
            result.current.validate();
        });

        expect(result.current.error).toBe('Passwords do not match');
    });

    it('should set error if username is too short', () => {
        const { result } = renderHook(() => useRegistration());

        act(() => {
            result.current.setUsername('abc');
            result.current.setPassword('Password123');
            result.current.setConfirmPassword('Password123');
        });

        act(() => {
            result.current.validate();
        });

        expect(result.current.error).toContain('Username must be at least');
    });

    it('should set error if password does not meet complexity requirements', () => {
        const { result } = renderHook(() => useRegistration());

        act(() => {
            result.current.setUsername('testuser');
            result.current.setPassword('password');
            result.current.setConfirmPassword('password');
        });

        act(() => {
            result.current.validate();
        });

        expect(result.current.error).toContain('Password must be at least');
    });

    it('should return true on successful validation', () => {
        const { result } = renderHook(() => useRegistration());

        act(() => {
            result.current.setUsername('testuser');
            result.current.setPassword('Password123');
            result.current.setConfirmPassword('Password123');
        });

        let validationResult: boolean | undefined;
        act(() => {
            validationResult = result.current.validate();
        });

        expect(validationResult).toBe(true);
        expect(result.current.error).toBeNull();
    });
});
