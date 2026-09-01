import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => localStorage.getItem("token") || null);
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem("user");
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });
    const [isAdmin, setIsAdmin] = useState(() => {
        return localStorage.getItem("isAdmin") === "true";
    });
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);

    const refreshTeam = useCallback(async () => {
        const currentToken = localStorage.getItem("token");
        const currentIsAdmin = localStorage.getItem("isAdmin") === "true";

        if (!currentToken || currentIsAdmin) {
            setTeam(null);
            return;
        }

        try {
            const data = await api.getMyTeam();
            setTeam(data.team || null);
        } catch (error) {
            // If fetching team fails (e.g. no team registered yet), keep team as null
            setTeam(null);
        }
    }, []);

    const login = (authToken, userData) => {
        localStorage.setItem("token", authToken);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("isAdmin", "false");

        setToken(authToken);
        setUser(userData);
        setIsAdmin(false);

        // Fetch team in background
        refreshTeam();
    };

    const adminLogin = (authToken, adminData) => {
        localStorage.setItem("token", authToken);
        localStorage.setItem("user", JSON.stringify(adminData));
        localStorage.setItem("isAdmin", "true");

        setToken(authToken);
        setUser(adminData);
        setIsAdmin(true);
        setTeam(null);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("isAdmin");

        setToken(null);
        setUser(null);
        setIsAdmin(false);
        setTeam(null);
    };

    useEffect(() => {
        const initAuth = async () => {
            const savedToken = localStorage.getItem("token");
            const savedIsAdmin = localStorage.getItem("isAdmin") === "true";

            if (savedToken) {
                try {
                    if (savedIsAdmin) {
                        const data = await api.getAdminProfile();
                        setUser({ ...data.admin, role: "admin" });
                        setIsAdmin(true);
                    } else {
                        const data = await api.getMe();
                        setUser(data.user);
                        setIsAdmin(false);
                        await refreshTeam();
                    }
                } catch (error) {
                    console.warn("Session verification warning:", error.message);
                    // Only logout if 401 unauthorized
                    if (error.message && (error.message.includes("401") || error.message.includes("expired") || error.message.includes("Invalid"))) {
                        logout();
                    }
                }
            }
            setLoading(false);
        };

        initAuth();
    }, [refreshTeam]);

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                team,
                isAdmin,
                loading,
                login,
                adminLogin,
                logout,
                refreshTeam,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
