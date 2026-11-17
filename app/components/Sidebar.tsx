"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
    Rocket,
    Layout,
    BrainCircuit,
    Users,
    Globe,
    Settings,
    PieChart,
    Briefcase,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Calendar,
    ListTodo,
    Menu,
    X,
    Layers
} from "lucide-react";

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Load desktop sidebar state from localStorage on mount
    useEffect(() => {
        const savedState = localStorage.getItem("sidebar_collapsed");
        if (savedState) {
            setIsCollapsed(savedState === "true");
        }
    }, []);

    // Close mobile drawer automatically on route change
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    // Listen for optional external toggle event (e.g., from Navbar) & Escape key
    useEffect(() => {
        const handleExternalToggle = () => setIsMobileOpen((prev) => !prev);
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsMobileOpen(false);
        };

        window.addEventListener("toggle-mobile-sidebar", handleExternalToggle);
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("toggle-mobile-sidebar", handleExternalToggle);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    // Lock body scroll when mobile drawer is open
    useEffect(() => {
        if (isMobileOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isMobileOpen]);

    const toggleCollapse = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem("sidebar_collapsed", String(newState));
    };

    const menuGroups = [
        {
            title: "Core",
            items: [
                { name: "Dashboard", href: "/dashboard", icon: Rocket, color: "text-orange-500" },
                { name: "Workflows", href: "/workflow", icon: BrainCircuit, color: "text-purple-500" },
                { name: "Workspace OS", href: "/workspace", icon: Layout, color: "text-blue-500" },
            ]
        },
        {
            title: "Management",
            items: [
                { name: "Projects", href: "/projects", icon: Briefcase, color: "text-indigo-500" },
                { name: "Tasks", href: "/tasks", icon: ListTodo, color: "text-sky-500" },
                { name: "Calendar", href: "/calendar", icon: Calendar, color: "text-emerald-500" },
            ]
        },
        {
            title: "Team & Intelligence",
            items: [
                { name: "Teams", href: "/teams", icon: Users, color: "text-pink-500" },
                { name: "Employees", href: "/employees", icon: Globe, color: "text-teal-500" },
                { name: "Reports & KPIs", href: "/reports", icon: PieChart, color: "text-amber-500" },
            ]
        }
    ];

    const renderNavigationContent = (collapsed: boolean, isMobile = false) => (
        <>
            {/* Mobile Drawer Header */}
            {isMobile && (
                <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 dark:border-gray-800">
                    <Link
                        href="/dashboard"
                        onClick={() => setIsMobileOpen(false)}
                        className="flex items-center gap-2"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-700 shadow-sm">
                            <Layers className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-base font-extrabold tracking-tight text-gray-900 dark:text-white">
                            Dikota<span className="text-blue-600 font-light">.com</span>
                        </span>
                    </Link>
                    <button
                        onClick={() => setIsMobileOpen(false)}
                        aria-label="Close Navigation Drawer"
                        className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            )}

            {/* Navigation Groups */}
            <div className="flex-1 overflow-y-auto py-4 md:py-5 px-3 space-y-5 md:space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {menuGroups.map((group, gIdx) => (
                    <div key={gIdx} className="space-y-1.5">
                        {/* Group Label */}
                        {!collapsed ? (
                            <h3 className="px-2.5 text-[10px] md:text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest transition-opacity duration-300">
                                {group.title}
                            </h3>
                        ) : (
                            <div className="h-[1px] bg-gray-100 dark:bg-gray-800 my-2 mx-1" />
                        )}

                        {/* Menu Items */}
                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const isActive = pathname.startsWith(item.href);
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => isMobile && setIsMobileOpen(false)}
                                        title={collapsed ? item.name : undefined}
                                        className={`flex items-center gap-3 rounded-xl md:rounded-lg px-3 py-3 md:py-2.5 text-sm md:text-xs font-semibold transition-all duration-200 border-l-3 ${
                                            isActive
                                                ? "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-500"
                                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/40 hover:text-gray-900 dark:hover:text-gray-100 border-transparent"
                                        }`}
                                    >
                                        <item.icon className={`h-5 w-5 md:h-4.5 md:w-4.5 shrink-0 ${item.color} ${isActive ? "scale-105" : ""}`} />
                                        {!collapsed && (
                                            <span className="truncate transition-opacity duration-300">{item.name}</span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* User Section / Settings / Logout */}
            <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 space-y-1.5">
                {/* Settings Button */}
                <Link
                    href="/settings"
                    onClick={() => isMobile && setIsMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-xl md:rounded-lg px-3 py-3 md:py-2.5 text-sm md:text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/40 hover:text-gray-900 dark:hover:text-gray-100 border-l-3 ${
                        pathname === "/settings"
                            ? "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-500"
                            : "border-transparent"
                    }`}
                    title={collapsed ? "Settings" : undefined}
                >
                    <Settings className="h-5 w-5 md:h-4.5 md:w-4.5 text-gray-400 dark:text-gray-500 shrink-0" />
                    {!collapsed && <span>Settings</span>}
                </Link>

                {/* Profile/User Card */}
                {!collapsed && user && (
                    <div className="flex items-center gap-2.5 p-2.5 md:p-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-xl my-1.5 shadow-2xs">
                        <div className={`h-9 w-9 md:h-8.5 md:w-8.5 rounded-lg ${user.color || 'bg-blue-600'} text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs`}>
                            {user.avatar || user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs md:text-[11px] font-bold text-gray-800 dark:text-gray-200 truncate leading-tight">{user.name}</p>
                            <p className="text-[10px] md:text-[9px] text-gray-400 dark:text-gray-500 truncate leading-none mt-1">{user.role}</p>
                        </div>
                    </div>
                )}

                {/* Logout Button */}
                <button
                    onClick={() => {
                        if (isMobile) setIsMobileOpen(false);
                        logout();
                    }}
                    className="flex items-center gap-3 w-full rounded-xl md:rounded-lg px-3 py-3 md:py-2.5 text-sm md:text-xs font-semibold text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer border-l-3 border-transparent"
                    title={collapsed ? "Log Out" : undefined}
                >
                    <LogOut className="h-5 w-5 md:h-4.5 md:w-4.5 text-red-500 dark:text-red-400 shrink-0" />
                    {!collapsed && <span>Log Out</span>}
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* MOBILE FLOATING SIDEBAR LAUNCHER (Visible only on < md screens) */}
            <button
                onClick={() => setIsMobileOpen(true)}
                aria-label="Open Workspace Menu"
                className="md:hidden fixed bottom-5 right-5 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
                <Menu className="h-4.5 w-4.5" />
                <span>Menu</span>
            </button>

            {/* MOBILE SLIDE-OVER DRAWER & BACKDROP */}
            {isMobileOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex">
                    {/* Backdrop */}
                    <div
                        onClick={() => setIsMobileOpen(false)}
                        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
                        aria-hidden="true"
                    />

                    {/* Drawer Panel */}
                    <aside className="relative flex flex-col w-[275px] max-w-[82vw] h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-2xl z-10 select-none animate-in slide-in-from-left duration-200">
                        {renderNavigationContent(false, true)}
                    </aside>
                </div>
            )}

            {/* DESKTOP COLLAPSIBLE SIDEBAR */}
            <aside
                className={`relative flex-shrink-0 flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 h-full shadow-sm transition-all duration-300 z-30 select-none hidden md:flex ${
                    isCollapsed ? "w-[72px]" : "w-[240px]"
                }`}
            >
                {/* Collapse Toggle Arrow */}
                <button
                    onClick={toggleCollapse}
                    aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    className="absolute top-4 -right-3 h-6 w-6 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-300 hover:text-blue-600 hover:border-blue-400 shadow-xs cursor-pointer z-50 transition-all hover:scale-105"
                >
                    {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
                </button>

                {renderNavigationContent(isCollapsed, false)}
            </aside>
        </>
    );
}
