import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// Context for managing authentication state across the application
const AuthContext = createContext();

// Custom hook to access authentication context
function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// Provider component that wraps the app and manages authentication state
function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Initialize authentication state by checking token from URL (OAuth redirect) or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        
        if (token) {
            localStorage.setItem('token', token);
            const decoded = jwtDecode(token);
            setUser(decoded);
            window.history.replaceState({}, document.title, window.location.pathname);
        } else {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                const decoded = jwtDecode(storedToken);
                setUser(decoded);
            }
        }
        setLoading(false);
    }, []);

    // Redirect to Google OAuth login
    const login = () => {
        window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/auth/google`;
    };

    // Clear authentication state and token
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export { AuthProvider, useAuth }; 