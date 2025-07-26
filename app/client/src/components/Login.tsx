import { useState } from 'react';
import { ApiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface LoginProps {
    onLoginSuccess: () => void;
    onClose: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onClose }) => {
    const { checkAuthStatus } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (username.trim() === '' || password.trim() === '') {
            setError('Enter both username and password');
            return;
        }
        setLoading(true);
        setError(null);

        try {
            await ApiService.sendLogin(username, password); // Send login credentials
            await checkAuthStatus(); // Update authentication state
            onLoginSuccess();
            onClose();
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close" onClick={onClose}>
                    &times;
                </button>
                <h2>Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" disabled={loading}>
                        {loading ? 'Logging in...' : 'Log in'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
