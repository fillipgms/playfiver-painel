"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from "react";
import { getSession, getUser } from "@/actions/user";

interface SessionContextType {
    user: User | null;
    session: SessionPayload | null;
    loading: boolean;
    error: string | null;
    refreshSession: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<SessionPayload | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    const refreshSession = useCallback(async () => {
        if (!mounted) return;

        setLoading(true);
        setError(null);
        try {
            const [sessionData, userData] = await Promise.all([
                getSession(),
                getUser(),
            ]);

            if (!sessionData) {
                setUser(null);
                setSession(null);
                return;
            }

            setUser(userData);
            setSession(sessionData);
        } catch (err) {
            setError("Erro ao carregar sessão");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [mounted]);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
            refreshSession();
        }
    }, [mounted, refreshSession]);

    return (
        <SessionContext.Provider
            value={{ user, session, loading, error, refreshSession }}
        >
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = () => {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error("useSession must be used within a SessionProvider");
    }
    return context;
};
