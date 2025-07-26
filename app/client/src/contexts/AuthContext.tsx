import { createContext, useState, useContext, useEffect } from 'react';
import { ApiService } from '../services/api';

interface AuthContextType {
    isAuthenticated: boolean;
    username: string | null;
    logout: () => Promise<void>;
    checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const TokenProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [username, setUsername] = useState<string | null>(null);

    const checkAuthStatus = async () => {
        try {
            const status = await ApiService.checkAuthStatus();
            setIsAuthenticated(status.authenticated);
            setUsername(status.username || null);
        } catch (error) {
            setIsAuthenticated(false);
            setUsername(null);
        }
    };

    const logout = async () => {
        try {
            await ApiService.logout();
        } catch (error) {
            // Even if logout fails, clear local state
        } finally {
            setIsAuthenticated(false);
            setUsername(null);
        }
    };

    useEffect(() => {
        checkAuthStatus();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                username,
                logout,
                checkAuthStatus,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useToken must be used within a AuthProvider');
    }
    return context;
};
