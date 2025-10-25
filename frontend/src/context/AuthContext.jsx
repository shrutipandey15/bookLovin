import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authApi from '@components/auth';
import { Loader } from 'lucide-react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    const checkAuthStatus = useCallback(async () => {
        setLoading(true);
        try {
            const currentUser = await authApi.fetchCurrentUser();
            setUser(currentUser);
            setIsAuthenticated(true);
        } catch (error) {
            localStorage.removeItem('token');
            setUser(null);
            setIsAuthenticated(false);
            console.error('Auth check failed:', error);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    const login = async (email, password) => {
        const loggedInUser = await authApi.login(email, password);
        setUser(loggedInUser);
        setIsAuthenticated(true);
    };

    const logout = () => {
        authApi.logout();
        setUser(null);
        setIsAuthenticated(false);
    };
    
    const register = async (username, email, password) => {
        const newUser = await authApi.register(username, email, password);
        setUser(newUser);
        setIsAuthenticated(true);
    };

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader className="animate-spin h-12 w-12 text-primary" />
            </div>
        );
    }

    const value = { 
        user, 
        isAuthenticated, 
        loading, 
        login, 
        logout, 
        register,
        checkAuth: checkAuthStatus
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};