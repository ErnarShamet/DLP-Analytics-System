// frontend/src/contexts/AuthContext.tsx
// Example AuthContext (if not using Redux for auth)
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiService from '../services/apiService'; // Your axios instance
import { User } from '../types'; // Your User type

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
    login: (token: string, userData: User) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadUserFromToken = async () => {
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
            apiService.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            try {
            const response = await apiService.get('/auth/me');
            setUser(response.data.data);
            setToken(storedToken);
            } catch (error) {
            console.error('Failed to load user from token', error);
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
            apiService.defaults.headers.common['Authorization'] = '';
            }
        }
        setIsLoading(false);
        };
        loadUserFromToken();
    }, []);

    const login = (newToken: string, userData: User) => {
        localStorage.setItem('authToken', newToken);
        localStorage.setItem('user', JSON.stringify(userData)); // Store user info
        apiService.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        setToken(newToken);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        apiService.defaults.headers.common['Authorization'] = '';
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated: !!token && !!user, user, token, login, logout, isLoading }}>
        {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};