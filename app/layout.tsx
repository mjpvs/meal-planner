'use client';

import './globals.css';
import Link from 'next/link';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

function LoginScreen() {
    const { login, isLoading } = useAuth();
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const success = await login(password);
        if (success) {
            setError(false);
        } else {
            setError(true);
            setPassword('');
        }
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <h1 className="login-title">Meal Planner</h1>
                <p className="login-subtitle">Enter your family password to continue</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError(false);
                            }}
                            placeholder="Password"
                            className={error ? 'input-error' : ''}
                            autoFocus
                            disabled={isLoading}
                        />
                        {error && <p className="error-message">Incorrect password</p>}
                    </div>
                    <button type="submit" className="btn btn-primary btn-full" disabled={isLoading}>
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
}

function AppContent({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, logout } = useAuth();

    if (!isAuthenticated) {
        return <LoginScreen />;
    }

    return (
        <>
            <nav className="nav">
                <div className="nav-content">
                    <h1 className="nav-title">Meal Planner</h1>
                    <div className="nav-right">
                        <div className="nav-links">
                            <Link href="/plan">Weekly Plan</Link>
                            <Link href="/meals">Meals</Link>
                        </div>
                        <button className="btn btn-logout" onClick={logout}>
                            Logout
                        </button>
                    </div>
                </div>
            </nav>
            <main className="main">{children}</main>
        </>
    );
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <AuthProvider>
                    <AppContent>{children}</AppContent>
                </AuthProvider>
            </body>
        </html>
    );
}
