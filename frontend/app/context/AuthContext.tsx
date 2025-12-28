"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    onAuthStateChanged,
    signInWithPopup,
    signOut,
    User,
    GoogleAuthProvider
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        let unsubscribe: () => void;

        // TIMEOUT FALLBACK: If Firebase hangs or fails, force Dev Access after 3s
        const timer = setTimeout(() => {
            if (loading && process.env.NODE_ENV === 'development') {
                console.warn("⚠️ Auth Timeout: Enabling Dev Bypass");
                setUser({
                    uid: "dev_user_123",
                    email: "dev@platform.com",
                    displayName: "Developer Mode",
                    emailVerified: true,
                    isAnonymous: false,
                    metadata: {},
                    providerData: [],
                    refreshToken: "",
                    tenantId: null,
                    delete: async () => { },
                    getIdToken: async () => "dev_token_bypass",
                    getIdTokenResult: async () => ({} as any),
                    reload: async () => { },
                    toJSON: () => ({}),
                    phoneNumber: null,
                    photoURL: null
                } as any);
                setLoading(false);
            }
        }, 3000);

        try {
            unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
                clearTimeout(timer); // Auth worked!

                if (currentUser) {
                    setUser(currentUser);
                } else {
                    setUser(null);
                }
                setLoading(false);
            }, (error) => {
                console.error("🔥 Firebase Auth Error:", error);
                clearTimeout(timer);
                if (process.env.NODE_ENV === 'development') {
                    // Fallback
                    setUser({ uid: "dev_user_123", getIdToken: async () => "dev_token_bypass" } as any);
                    setLoading(false);
                }
            });
        } catch (err) {
            console.error("Auth Init Failed:", err);
            setLoading(false); // don't block
        }

        return () => {
            if (unsubscribe) unsubscribe();
            clearTimeout(timer);
        };
    }, []);

    const signInWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
            router.push('/dashboard');
        } catch (error) {
            console.error("Login Failed", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            router.push('/');
        } catch (error) {
            console.error("Logout Failed", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
