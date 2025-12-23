import { createContext, useContext, useEffect, useState } from "react";
import { UserRole } from "@/types";

interface User {
    id: number;
    email: string;
    full_name: string;
    role: UserRole;
    department_name?: string;
}

interface AuthContextType {
    user: User | null;
    role: UserRole | null;
    loading: boolean;
    login: (token: string, userData: User) => void;
    signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    role: null,
    loading: true,
    login: () => { },
    signOut: () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<UserRole | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (savedToken && savedUser) {
            const userData = JSON.parse(savedUser);
            setUser(userData);
            setRole(userData.role);
        }
        setLoading(false);
    }, []);

    const login = (token: string, userData: User) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setRole(userData.role);
    };

    const signOut = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setRole(null);
        window.location.href = "/auth";
    };

    return (
        <AuthContext.Provider value={{ user, role, loading, login, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
