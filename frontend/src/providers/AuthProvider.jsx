import {createContext, useState, useContext, useEffect} from "react";
import config from "./apiConfig.js";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token && token !== 'undefined') {
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, []);

    const register = async (registerForm) => {
        const response = await fetch(`${config.apiBaseUrl}/client/register`, {
            method: 'POST',
            headers: config.headers,
            body: JSON.stringify(registerForm)
        });

        if (response.ok) {
            const data = await response.json();
            handleStoreData(data);
        }
    }

    const login = async (email, password) => {
        const response = await fetch(`${config.apiBaseUrl}/client/login`, {
            method: 'POST',
            headers: config.headers,
            body: JSON.stringify({email, password})
        });

        if (response.ok) {
            const data = await response.json();
            handleStoreData(data);
        }
    };

    const logout = () => {
        setIsAuthenticated(false);
    };

    const handleStoreData = (data) => {
        localStorage.setItem('token', data.token);
        setIsAuthenticated(true);
    }

        return (
        <AuthContext.Provider value={{ isAuthenticated, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);