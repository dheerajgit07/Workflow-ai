"use client";
import React from "react";
import { AuthProvider } from "@/contexts/AuthContext";
// Yahan curly braces { } lagana zaroori hai
import { ThemeProvider } from "@/contexts/ThemeContext";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <AuthProvider>
                {children}
            </AuthProvider>
        </ThemeProvider>
    );
}