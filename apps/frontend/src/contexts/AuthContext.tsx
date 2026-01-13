import React, { createContext, useContext } from 'react';
import { useAuth as useAuthHook } from '../features/auth/hooks/useAuth';

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
    register: (data: any) => Promise<any>;
    logout: () => void;
    refreshUser: () => Promise<any>;
    updateAuthState: (token: string, user: User) => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, login, register, logout, refreshUser, isLoading } = useAuthHook();

    // Compatibility shim: token is not used in Cookie auth, but we keep it null to match type signature if strict
    // Or better: Update the interface to make token optional.

    // We expose a simplified interface
    const value = {
        user: user || null,
        token: null, // No token for SPA
        login,
        register,
        logout,
        refreshUser,
        updateAuthState: () => { },
        isLoading
    };

    return (
        <AuthContext.Provider value={value}>
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
