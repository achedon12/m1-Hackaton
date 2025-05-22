import {createContext, useState, useContext, useEffect} from "react";
import config from "./apiConfig.js";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token && token !== 'undefined') {
            try {
                const decodedToken = jwtDecode(token);
                const currentTime = Date.now() / 1000;

                if (decodedToken.exp < currentTime) {
                    logout(); // Token expiré
                } else {
                    setIsAuthenticated(true);

                    // Déconnexion automatique à l'expiration
                    const timeout = (decodedToken.exp - currentTime) * 1000;
                    setTimeout(() => {
                        logout();
                    }, timeout);
                }
            } catch (error) {
                console.error("Token invalide :", error);
                logout();
            }
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
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({email, password})
        });

        if (response.ok) {
            const data = await response.json();
            handleStoreData(data);
        }
    };

    const logout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        localStorage.removeItem('client');
    };

    const handleStoreData = (data) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('client', JSON.stringify(data.client));
        setIsAuthenticated(true);
    }

    return (
        <AuthContext.Provider value={{isAuthenticated, login, register, logout, loading}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);