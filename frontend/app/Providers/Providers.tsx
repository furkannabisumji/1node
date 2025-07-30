'use client'

import { AuthProvider } from "~/auth/AuthProvider";
import { Web3Provider } from "./Web3Providers";

export const Providers = ({ children }: { children: React.ReactNode }) => {
    return (
        <AuthProvider>
            <Web3Provider>
                {children}
            </Web3Provider>
        </AuthProvider>
    );
};
