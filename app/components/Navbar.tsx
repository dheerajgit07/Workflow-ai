"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
    Grid,
    Layers,
    ChevronDown,
    Search,
    Bell,
    Plus,
    Check,
    CheckSquare,
    Play,
    Settings,
    User,
    Sun,
    Moon,
    Menu,
    X
} from "lucide-react";

interface NotificationType {
    id?: string;
    _id?: string;
    title: string;
    message: string;
    read: boolean;
    time: string;
}

export default function Navbar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);

    const [notifications, setNotifications] = useState<NotificationType[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch workspace notifications
    const fetchNotifications = async () => {
        try {
            const res = await fetch("/api/notifications");
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (err) {
            console.error("Failed to load notifications:", err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll notifications automatically every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleMarkAsRead = async (id: string) => {
        try {
            const res = await fetch("/api/notifications", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, read: true })
            });
            if (res.ok) {
                setNotifications(prev =>
                    prev.map(n => (n.id === id || n._id === id) ? { ...n, read: true } : n)
                );
            }
        } catch (err) {
            console.error("Failed to mark read:", err);
        }
    };

    const handleClearAll = async () => {
        try {
            const res = await fetch("/api/notifications", { method: "DELETE" });
            if (res.ok) {
                setNotifications([]);
            }
        } catch (err) {
            console.error("Failed to clear notifications:", err);
        }
    };

    // Compute navigation path tracking breadcrumbs
    const getBreadcrumbs = () => {
        const paths = pathname.split("/").filter(p => p);
        if (paths.length === 0) return [{ label: "Home", href: "/dashboard" }];

        return paths.map((path, idx) => {
            const href = "/" + paths.slice(0, idx + 1).join("/");
            let label = path.charAt(0).toUpperCase() + path.slice(1);
            if (label === "Workflow") label = "Workflows";
            if (label === "Workspace") label = "Workspace OS";

            if (label.match(/^[0-9a-fA-F-]{8,}/) || label.match(/^\d+$/)) {
                label = `ID: #${label.substring(0, 8)}...`;
            }
            return { label, href };
        });
    };

    const breadcrumbs = getBreadcrumbs();
    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors duration-300">
            <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
                <div className="flex h-14 items-center justify-between gap-4">

                    {/* LEFT SECTION: Branding & Path Tree Breadcrumbs */}
                    <div className="flex items-center gap-4">
                        <button className="rounded-md p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <Grid className="h-5 w-5" />
                        </button>

                        <Link href="/dashboard" className="flex items-center gap-1.5 pr-2 shrink-0">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-700 shadow-md">
                                <Layers className="h-4.5 w-4.5 text-white" />
                            </div>
                            <span className="text-md font-extrabold tracking-tight text-gray-900 dark:text-white">
                                Dikota<span className="text-blue-600 font-light">.com</span>
                            </span>
                        </Link>

                        <div className="hidden lg:block h-5 w-[1px] bg-gray-200 dark:bg-gray-800" />

                        {/* Breadcrumb Navigation Flow */}
                        <div className="hidden md:flex items-center gap-1.5 text-[11px] font-bold text-gray-400 dark:text-gray-500 select-none">
                            <Link href="/dashboard" className="hover:text-blue-600 transition-colors">Dikota</Link>
                            {breadcrumbs.map((crumb, idx) => (
                                <React.Fragment key={idx}>
                                    <span>/</span>
                                    <Link
                                        href={crumb.href}
                                        className={`hover:text-blue-600 transition-colors ${idx === breadcrumbs.length - 1 ? "text-gray-700 dark:text-gray-300 font-black" : ""
                                            }`}
                                    >
                                        {crumb.label}
                                    </Link>
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    {/* MIDDLE SECTION: Operational Quick Global Search */}
                    <div className="hidden md:block w-full max-w-[260px] lg:max-w-[320px]">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-hover:text-gray-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search board, tickets, tasks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 py-1.5 pl-9 pr-4 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 focus:ring-3 focus:ring-blue-100 dark:focus:ring-blue-950/30 transition-all duration-200"
                            />
                        </div>
                    </div>

                    {/* RIGHT SECTION: Quick Actions, Theme Toggles, Notification Panel */}
                    <div className="flex items-center justify-end gap-3 shrink-0">
                        {/* Quick Add Modules Split-Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setIsQuickActionOpen(!isQuickActionOpen);
                                    setIsNotificationsOpen(false);
                                    setIsProfileOpen(false);
                                }}
                                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer transition-colors"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Quick Add</span>
                                <ChevronDown className="h-3 w-3 opacity-80" />
                            </button>

                            {isQuickActionOpen && (
                                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                                    <Link
                                        href="/workspace?add=true"
                                        onClick={() => setIsQuickActionOpen(false)}
                                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold"
                                    >
                                        <Layers className="h-4 w-4 text-blue-500" />
                                        <span>Create Ticket</span>
                                    </Link>
                                    <Link
                                        href="/workflow?add=true"
                                        onClick={() => setIsQuickActionOpen(false)}
                                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold"
                                    >
                                        <Play className="h-4 w-4 text-purple-500" />
                                        <span>Create Workflow</span>
                                    </Link>
                                    <Link
                                        href="/tasks?add=true"
                                        onClick={() => setIsQuickActionOpen(false)}
                                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold"
                                    >
                                        <CheckSquare className="h-4 w-4 text-emerald-500" />
                                        <span>Add Task</span>
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Theme Switcher Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="rounded-lg p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                            title="Toggle Application Appearance"
                        >
                            {theme === "light" ? <Moon className="h-4.5 w-4.5 text-gray-600" /> : <Sun className="h-4.5 w-4.5 text-yellow-400" />}
                        </button>

                        {/* Internal Notifications Flyout */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setIsNotificationsOpen(!isNotificationsOpen);
                                    setIsQuickActionOpen(false);
                                    setIsProfileOpen(false);
                                }}
                                className="relative rounded-lg p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                            >
                                <Bell className="h-4.5 w-4.5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white ring-2 ring-white dark:ring-gray-900">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {isNotificationsOpen && (
                                <div className="absolute right-0 mt-2 w-80 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-3 border-b border-gray-100 dark:border-gray-800">
                                        <h3 className="text-xs font-bold text-gray-900 dark:text-white">Workspace Notifications</h3>
                                        {notifications.length > 0 && (
                                            <button
                                                onClick={handleClearAll}
                                                className="text-[10px] font-extrabold text-red-500 hover:text-red-600 cursor-pointer"
                                            >
                                                Clear All
                                            </button>
                                        )}
                                    </div>

                                    <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                                        {notifications.length === 0 ? (
                                            <p className="text-xs text-gray-400 italic text-center py-6">No new workspace notifications.</p>
                                        ) : (
                                            notifications.map((notif) => {
                                                const notifId = notif.id || notif._id || "";
                                                return (
                                                    <div
                                                        key={notifId}
                                                        className={`p-3 text-left transition-colors ${notif.read ? "bg-white dark:bg-gray-900" : "bg-blue-50/40 dark:bg-blue-950/10"}`}
                                                    >
                                                        <div className="flex items-start justify-between gap-2">
                                                            <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200">{notif.title}</h4>
                                                            {!notif.read && (
                                                                <button
                                                                    onClick={() => handleMarkAsRead(notifId)}
                                                                    className="text-[9px] text-blue-600 hover:text-blue-700 font-extrabold flex items-center gap-0.5 shrink-0"
                                                                >
                                                                    <Check className="h-3 w-3" /> Read
                                                                </button>
                                                            )}
                                                        </div>
                                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-normal">{notif.message}</p>
                                                        <span className="text-[9px] text-gray-400 mt-2 block">{notif.time}</span>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User Identity Avatar Profile Context Dropdown */}
                        {user && (
                            <div className="relative">
                                <button
                                    onClick={() => {
                                        setIsProfileOpen(!isProfileOpen);
                                        setIsNotificationsOpen(false);
                                        setIsQuickActionOpen(false);
                                    }}
                                    className={`flex h-8.5 w-8.5 items-center justify-center rounded-xl ${user.color || 'bg-blue-600'} hover:opacity-90 transition-all shadow-xs border border-white dark:border-gray-800 cursor-pointer`}
                                >
                                    <span className="text-white font-extrabold text-xs">
                                        {user.avatar || user.name.charAt(0).toUpperCase()}
                                    </span>
                                </button>

                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                                        <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
                                            <p className="text-xs font-black text-gray-900 dark:text-white">{user.name}</p>
                                            <p className="text-[10px] text-gray-400 truncate mt-0.5">{user.email}</p>
                                            <span className="inline-block bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[8px] font-black uppercase px-2 py-0.5 rounded-full mt-1.5">
                                                {user.role}
                                            </span>
                                        </div>
                                        <div className="p-1 space-y-0.5">
                                            <Link
                                                href="/profile"
                                                onClick={() => setIsProfileOpen(false)}
                                                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold"
                                            >
                                                <User className="h-4 w-4 text-gray-400" />
                                                <span>My Profile</span>
                                            </Link>
                                            <Link
                                                href="/settings"
                                                onClick={() => setIsProfileOpen(false)}
                                                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold"
                                            >
                                                <Settings className="h-4 w-4 text-gray-400" />
                                                <span>Settings</span>
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    setIsProfileOpen(false);
                                                    logout();
                                                }}
                                                className="w-full flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 font-bold transition-colors cursor-pointer"
                                            >
                                                <span>Log Out</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Mobile Side Menu Trigger */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                        >
                            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Responsive Drawer */}
            {isMobileMenuOpen && (
                <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-4 md:hidden space-y-2 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search everything..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-2 pl-9 pr-4 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500"
                        />
                    </div>
                    <button className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                        <span>Workspaces</span>
                        <ChevronDown className="h-4 w-4" />
                    </button>
                    <button className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                        <span>Recent Logs</span>
                        <ChevronDown className="h-4 w-4" />
                    </button>
                </div>
            )}
        </nav>
    );
}