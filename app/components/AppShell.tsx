"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useAuth } from "@/contexts/AuthContext";
export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { authenticated, loading } = useAuth();
    const authPaths = ["/login", "/register", "/forgot-password", "/reset-password"];
    const isAuthPage = authPaths.some(path => pathname.startsWith(path));
    // If loading authentication session state, show a clean loading screen
    if (loading) {
        return (
            <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
                <div className="flex flex-col items-center space-y-4">
                    {/* Logo animation / loader spinner */}
                    <div className="relative flex items-center justify-center">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 animate-pulse flex items-center justify-center shadow-lg">
                            <span className="text-white font-black text-2xl tracking-tighter">S</span>
                        </div>
                        <div className="absolute h-16 w-16 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin"></div>
                    </div>
                    <div className="text-center">
                        <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200 tracking-tight">Dikota OS</h2>
                        <p className="text-[10px] text-gray-400 font-medium uppercase mt-1 tracking-widest animate-pulse">Initializing Workspace Environment...</p>
                    </div>
                </div>
            </div>
        );
    }
    // Auth pages do not display sidebar or navbar
    if (isAuthPage) {
        return <div className="h-full w-full bg-[#f8f9fa] dark:bg-gray-950">{children}</div>;
    }
    return (
        <div className="flex flex-col h-screen w-screen bg-gray-50 dark:bg-gray-950 overflow-hidden transition-colors duration-300">
            {/* Top Navbar */}
            <Navbar />

            {/* Workspace Panel */}
            <div className="flex flex-1 overflow-hidden">
                {/* Navigation Sidebar */}
                <Sidebar />

                {/* Dynamic Page Router Children */}
                <main className="flex-1 overflow-y-auto p-5 md:p-7 bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
                    {children}
                </main>
            </div>
        </div>
    );
}
