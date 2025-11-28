import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('userToken'));
    const [user, setUser] = useState(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                try {
                    setUser({
                        email: "test@gmail.com",
                        id: "user_id_123"
                    });
                } catch (error) {
                    localStorage.removeItem('userToken');
                    setToken(null);
                }
            }
            setIsAuthLoading(false);
        };

        loadUser();
    }, [token]);
    const login = (newToken, userData) => {
        localStorage.setItem('userToken', newToken);
        setToken(newToken);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('userToken');
        setToken(null);
        setUser(null);
    };

    const value = {
        token,
        user,
        isLoggedIn: !!token,
        isAuthLoading,
        login,
        logout,
    };

    if (isAuthLoading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Checking user session...</div>;
    }
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};