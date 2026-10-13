import { useEffect, useState } from "react";
import { auth, refreshSession, setAccessToken } from "../api/api";
import type { AuthResponse } from "../api/auth";
import { AuthContext } from "./context";

export interface User {
    userName: string;
    email: string;
    role: string;
}

function userFromResponse(response: AuthResponse): User {
    return {
        userName: response.userName,
        email: response.email,
        role: response.rol.toUpperCase()
    };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    function login(newToken: string, newUser: User) {
        setAccessToken(newToken);
        setToken(newToken);
        setUser({ ...newUser, role: newUser.role.toUpperCase() });
    }

    async function logout() {
        try {
            await auth.post("/logout");
        } finally {
            setAccessToken(null);
            setToken(null);
            setUser(null);
        }
    }

    useEffect(() => {
        let mounted = true;

        refreshSession()
            .then((response) => {
                if (mounted) {
                    login(response.token, userFromResponse(response));
                }
            })
            .catch(() => {
                if (mounted) {
                    setAccessToken(null);
                    setToken(null);
                    setUser(null);
                }
            })
            .finally(() => {
                if (mounted) {
                    setIsLoading(false);
                }
            });

        const handleExpiredSession = () => {
            setAccessToken(null);
            setToken(null);
            setUser(null);
        };

        window.addEventListener("auth:expired", handleExpiredSession);

        return () => {
            mounted = false;
            window.removeEventListener("auth:expired", handleExpiredSession);
        };
    }, []);

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                isLoading,
                login,
                logout,
                isAuthenticated: !!token
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
