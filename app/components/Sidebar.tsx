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
    ListTodo
} from "lucide-react";

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Load sidebar state from localStorage on mount
    useEffect(() => {
        const savedState = localStorage.getItem("sidebar_collapsed");
        if (savedState) {
            setIsCollapsed(savedState === "true");
        }
    }, []);

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

    return (
        <aside
            className={`relative flex-shrink-0 flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 h-full shadow-sm transition-all duration-300 z-30 select-none hidden md:flex ${isCollapsed ? "w-[72px]" : "w-[240px]"
                }`}
        >
            {/* Collapse Toggle Arrow */}
            <button
                onClick={toggleCollapse}
                className="absolute top-4 -right-3 h-6 w-6 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-300 hover:text-blue-600 hover:border-blue-400 shadow-xs cursor-pointer z-50 transition-all hover:scale-105"
            >
                {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
            </button>

            {/* Navigation Groups */}
            <div className="flex-1 overflow-y-auto py-5 px-3 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {menuGroups.map((group, gIdx) => (
                    <div key={gIdx} className="space-y-1.5">
                        {/* Group Label */}
                        {!isCollapsed ? (
                            <h3 className="px-2 text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest transition-opacity duration-300">
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
                                        title={isCollapsed ? item.name : undefined}
                                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all duration-200 border-l-3 ${isActive
                                                ? "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-500"
                                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/40 hover:text-gray-900 dark:hover:text-gray-100 border-transparent"
                                            }`}
                                    >
                                        <item.icon className={`h-4.5 w-4.5 shrink-0 ${item.color} ${isActive ? "scale-105" : ""}`} />
                                        {!isCollapsed && (
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
            <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 space-y-1">
                {/* Settings Button */}
                <Link
                    href="/settings"
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/40 hover:text-gray-900 dark:hover:text-gray-100 border-l-3 ${pathname === "/settings"
                            ? "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-500"
                            : "border-transparent"
                        }`}
                    title={isCollapsed ? "Settings" : undefined}
                >
                    <Settings className="h-4.5 w-4.5 text-gray-400 dark:text-gray-500" />
                    {!isCollapsed && <span>Settings</span>}
                </Link>

                {/* Profile/User Card */}
                {!isCollapsed && user && (
                    <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-xl my-2 shadow-2xs">
                        <div className={`h-8.5 w-8.5 rounded-lg ${user.color || 'bg-blue-600'} text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs`}>
                            {user.avatar || user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-bold text-gray-800 dark:text-gray-200 truncate leading-tight">{user.name}</p>
                            <p className="text-[9px] text-gray-400 dark:text-gray-500 truncate leading-none mt-0.5">{user.role}</p>
                        </div>
                    </div>
                )}

                {/* Logout Button */}
                <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-xs font-semibold text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer border-l-3 border-transparent"
                    title={isCollapsed ? "Log Out" : undefined}
                >
                    <LogOut className="h-4.5 w-4.5 text-red-500 dark:text-red-400" />
                    {!isCollapsed && <span>Log Out</span>}
                </button>
            </div>
        </aside>
    );
}