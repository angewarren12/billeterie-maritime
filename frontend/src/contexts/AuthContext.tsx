import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    phone?: string;
    passenger_type?: 'adult' | 'child';
    nationality_group?: 'nacional' | 'cedeao' | 'etranger';
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
    updateAuthState: (token: string, user: User) => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
    const [isLoading, setIsLoading] = useState(true);

    const fetchUser = async () => {
        const storedToken = localStorage.getItem('auth_token');
        if (storedToken) {
            try {
                const data = await apiService.getCurrentUser();
                setUser(data.user);
            } catch (error) {
                console.error("Failed to fetch user", error);
                logout();
            }
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchUser();
    }, [token]);

    const login = async (email: string, password: string) => {
        const data = await apiService.login(email, password);
        setToken(data.token);
        setUser(data.user);
    };

    const register = async (regData: any) => {
        const data = await apiService.register(regData);
        setToken(data.token);
        setUser(data.user);
    };

    const logout = () => {
        localStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
        window.location.href = '/';
    };

    const updateAuthState = (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, updateAuthState, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
