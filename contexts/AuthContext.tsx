'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiPath } from '@/lib/paths';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (password: string) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'meal-planner-auth';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'true') {
            setIsAuthenticated(true);
        }
        setMounted(true);
    }, []);

    async function login(password: string): Promise<boolean> {
        setIsLoading(true);
        try {
            const res = await fetch(apiPath('auth'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });
            const data = await res.json();
            
            if (data.success) {
                localStorage.setItem(STORAGE_KEY, 'true');
                setIsAuthenticated(true);
                return true;
            }
            return false;
        } catch {
            return false;
        } finally {
            setIsLoading(false);
        }
    }

    function logout() {
        localStorage.removeItem(STORAGE_KEY);
        setIsAuthenticated(false);
    }

    if (!mounted) {
        return null;
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
