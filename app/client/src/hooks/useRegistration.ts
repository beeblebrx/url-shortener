import { useState } from 'react';

const MINIMUM_USERNAME_LENGTH = 4;

export const useRegistration = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const trimmedUsername = username.trim();
        const trimmedPassword = password.trim();
        const trimmedConfirmPassword = confirmPassword.trim();

        if (
            trimmedUsername === '' ||
            trimmedPassword === '' ||
            trimmedConfirmPassword === ''
        ) {
            setError('All fields are required');
            return false;
        }
        // Don't match trimmed passwords! Allow whitespaces in them.
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        if (trimmedUsername.length < MINIMUM_USERNAME_LENGTH) {
            setError(
                `Username must be at least ${MINIMUM_USERNAME_LENGTH} characters long`
            );
            return false;
        }

        const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

        if (!passwordRegex.test(password)) {
            setError(
                'Password must be at least 8 characters long and include lower and uppercase characters and numbers.'
            );
            return false;
        }

        setError(null);
        return true;
    };

    return {
        username,
        setUsername,
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        error,
        setError,
        loading,
        setLoading,
        validate,
    };
};
