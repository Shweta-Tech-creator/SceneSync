import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    // Configure axios defaults
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common['Authorization'];
    }

    useEffect(() => {
        const checkAuth = async () => {
            console.log('checkAuth running, token:', !!token);
            if (token) {
                try {
                    console.log('Making profile API call...');
                    // Verify token with backend
                    const res = await axios.get('http://localhost:3000/api/auth/profile');
                    console.log('Profile API response:', res.data);
                    if (res.data.success) {
                        console.log('Profile fetch success', res.data.user);
                        setUser(res.data.user);
                    } else {
                        console.log('Profile fetch failed (success=false)');
                        logout();
                    }
                } catch (error) {
                    console.error('Auth check failed:', error.response?.data || error.message);
                    logout();
                }
            } else {
                console.log('No token, setting loading=false');
            }
            setLoading(false);
        };
        checkAuth();
    }, [token]);

    const login = async (email, password) => {
        try {
            const res = await axios.post('http://localhost:3000/api/auth/login', { email, password });
            const { token, user } = res.data;

            localStorage.setItem('token', token);
            setToken(token);
            setUser(user);

            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const signup = async (name, email, password, role) => {
        try {
            // Note: Backend expects 'username', but frontend form sends 'name'
            const res = await axios.post('http://localhost:3000/api/auth/register', {
                username: name,
                email,
                password,
                role
            });

            const { token, user } = res.data;

            localStorage.setItem('token', token);
            setToken(token);
            setUser(user);

            return { success: true };
        } catch (error) {
            console.error('Signup error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Signup failed'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };

    const loginWithGoogle = () => {
        window.location.href = 'http://localhost:3000/api/auth/google';
    };

    const loginWithGithub = () => {
        window.location.href = 'http://localhost:3000/api/auth/github';
    };

    const loginWithToken = (token) => {
        console.log('loginWithToken called, setting loading=true');
        setLoading(true);
        localStorage.setItem('token', token);
        setToken(token);
        // The useEffect will trigger and fetch the user profile
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            signup,
            logout,
            loginWithGoogle,
            loginWithGithub,
            loginWithToken
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
