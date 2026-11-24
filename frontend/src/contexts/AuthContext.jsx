import React, { createContext, useState, useEffect, useContext } from 'react';
import { login as apiLogin } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');
        if (token && username) {
            setUser({ username });
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        const data = await apiLogin(username, password);
        localStorage.setItem('token', data.access_token);
        // Decode token or just save username for display if available? 
        // The backend /token endpoint returns access_token. 
        // Usually we decode JWT to get username, but for simplicity let's assume we store the username passed in
        // or we decode it. Since I don't want to add jwt-decode lib unless necessary, 
        // and the backend verifies the token anyway, I'll store the username provided on successful login.
        localStorage.setItem('username', username);
        setUser({ username });
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
