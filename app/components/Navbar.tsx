"use client";

import React, { useState, useEffect, useRef } from "react";
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
    X,
    LayoutDashboard,
    Users,
    LogOut
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

    const navRef = useRef<HTMLElement>(null);

    // Close all menus on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsProfileOpen(false);
        setIsNotificationsOpen(false);
        setIsQuickActionOpen(false);
    }, [pathname]);

    // Close dropdowns when tapping/clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (navRef.current && !navRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
                setIsNotificationsOpen(false);
                setIsQuickActionOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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

    const mobileNavLinks = [
        { label: "Executive Dashboard", href: "/dashboard", icon: LayoutDashboard, color: "text-blue-600" },
        { label: "Workspace OS (Tickets)", href: "/workspace", icon: Layers, color: "text-indigo-600" },
        { label: "Workflows", href: "/workflow", icon: Play, color: "text-purple-600" },
        { label: "Sprint Tasks", href: "/tasks", icon: CheckSquare, color: "text-emerald-600" },
        { label: "Team & Capacity", href: "/teams", icon: Users, color: "text-pink-600" },
    ];

    return (
        <nav
            ref={navRef}
            className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors duration-300"
        >
            <div className="mx-auto max-w-full px-2.5 sm:px-6 lg:px-8">
                <div className="flex h-14 items-center justify-between gap-2 sm:gap-4">

                    {/* LEFT SECTION: Branding & Path Tree Breadcrumbs */}
                    <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                        <button
                            aria-label="Workspace Switcher"
                            className="hidden sm:inline-flex rounded-md p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
                        >
                            <Grid className="h-5 w-5" />
                        </button>

                        <Link href="/dashboard" className="flex items-center gap-1.5 pr-1 sm:pr-2 shrink-0">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-700 shadow-md shrink-0">
                                <Layers className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-sm sm:text-base font-extrabold tracking-tight text-gray-900 dark:text-white">
                                Dikota<span className="text-blue-600 font-light">.com</span>
                            </span>
                        </Link>

                        <div className="hidden lg:block h-5 w-[1px] bg-gray-200 dark:bg-gray-800" />

                        {/* Desktop Breadcrumb Navigation Flow */}
                        <div className="hidden md:flex items-center gap-1.5 text-[11px] font-bold text-gray-400 dark:text-gray-500 select-none truncate">
                            <Link href="/dashboard" className="hover:text-blue-600 transition-colors">Dikota</Link>
                            {breadcrumbs.map((crumb, idx) => (
                                <React.Fragment key={idx}>
                                    <span>/</span>
                                    <Link
                                        href={crumb.href}
                                        className={`hover:text-blue-600 transition-colors truncate ${
                                            idx === breadcrumbs.length - 1 ? "text-gray-700 dark:text-gray-300 font-black" : ""
                                        }`}
                                    >
                                        {crumb.label}
                                    </Link>
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    {/* MIDDLE SECTION: Desktop Global Search */}
                    <div className="hidden md:block w-full max-w-[240px] lg:max-w-[320px]">
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

                    {/* RIGHT SECTION: Quick Actions, Theme Toggles, Notifications, Profile & Mobile Menu */}
                    <div className="flex items-center justify-end gap-1 sm:gap-2.5 shrink-0">
                        
                        {/* Quick Add Modules Split-Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setIsQuickActionOpen(!isQuickActionOpen);
                                    setIsNotificationsOpen(false);
                                    setIsProfileOpen(false);
                                    setIsMobileMenuOpen(false);
                                }}
                                aria-label="Quick Add"
                                className="flex items-center gap-1 px-2 sm:px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer transition-colors"
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
                                        className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold"
                                    >
                                        <Layers className="h-4 w-4 text-blue-500 shrink-0" />
                                        <span>Create Ticket</span>
                                    </Link>
                                    <Link
                                        href="/workflow?add=true"
                                        onClick={() => setIsQuickActionOpen(false)}
                                        className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold"
                                    >
                                        <Play className="h-4 w-4 text-purple-500 shrink-0" />
                                        <span>Create Workflow</span>
                                    </Link>
                                    <Link
                                        href="/tasks?add=true"
                                        onClick={() => setIsQuickActionOpen(false)}
                                        className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold"
                                    >
                                        <CheckSquare className="h-4 w-4 text-emerald-500 shrink-0" />
                                        <span>Add Task</span>
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Theme Switcher Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="rounded-lg p-1.5 sm:p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                            title="Toggle Application Appearance"
                            aria-label="Toggle Theme"
                        >
                            {theme === "light" ? (
                                <Moon className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-gray-600" />
                            ) : (
                                <Sun className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-yellow-400" />
                            )}
                        </button>

                        {/* Internal Notifications Flyout */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setIsNotificationsOpen(!isNotificationsOpen);
                                    setIsQuickActionOpen(false);
                                    setIsProfileOpen(false);
                                    setIsMobileMenuOpen(false);
                                }}
                                aria-label="Notifications"
                                className="relative rounded-lg p-1.5 sm:p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                            >
                                <Bell className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-red-500 text-[8px] sm:text-[9px] font-black text-white ring-2 ring-white dark:ring-gray-900">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {isNotificationsOpen && (
                                <div className="fixed sm:absolute left-3 right-3 sm:left-auto sm:right-0 top-15 sm:top-auto sm:mt-2 w-auto sm:w-80 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
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
                                                        className={`p-3 text-left transition-colors ${
                                                            notif.read ? "bg-white dark:bg-gray-900" : "bg-blue-50/40 dark:bg-blue-950/10"
                                                        }`}
                                                    >
                                                        <div className="flex items-start justify-between gap-2">
                                                            <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200">{notif.title}</h4>
                                                            {!notif.read && (
                                                                <button
                                                                    onClick={() => handleMarkAsRead(notifId)}
                                                                    className="text-[9px] text-blue-600 hover:text-blue-700 font-extrabold flex items-center gap-0.5 shrink-0 cursor-pointer"
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
                                        setIsMobileMenuOpen(false);
                                    }}
                                    aria-label="User Profile"
                                    className={`flex h-8 w-8 sm:h-8.5 sm:w-8.5 items-center justify-center rounded-xl ${user.color || 'bg-blue-600'} hover:opacity-90 transition-all shadow-xs border border-white dark:border-gray-800 cursor-pointer`}
                                >
                                    <span className="text-white font-extrabold text-xs">
                                        {user.avatar || user.name.charAt(0).toUpperCase()}
                                    </span>
                                </button>

                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                                        <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
                                            <p className="text-xs font-black text-gray-900 dark:text-white truncate">{user.name}</p>
                                            <p className="text-[10px] text-gray-400 truncate mt-0.5">{user.email}</p>
                                            <span className="inline-block bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[8px] font-black uppercase px-2 py-0.5 rounded-full mt-1.5">
                                                {user.role}
                                            </span>
                                        </div>
                                        <div className="p-1 space-y-0.5">
                                            <Link
                                                href="/profile"
                                                onClick={() => setIsProfileOpen(false)}
                                                className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold"
                                            >
                                                <User className="h-4 w-4 text-gray-400" />
                                                <span>My Profile</span>
                                            </Link>
                                            <Link
                                                href="/settings"
                                                onClick={() => setIsProfileOpen(false)}
                                                className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold"
                                            >
                                                <Settings className="h-4 w-4 text-gray-400" />
                                                <span>Settings</span>
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    setIsProfileOpen(false);
                                                    logout();
                                                }}
                                                className="w-full flex items-center gap-2 rounded-lg px-2 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 font-bold transition-colors cursor-pointer"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                <span>Log Out</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Mobile Side Menu Trigger */}
                        <button
                            onClick={() => {
                                setIsMobileMenuOpen(!isMobileMenuOpen);
                                setIsNotificationsOpen(false);
                                setIsProfileOpen(false);
                                setIsQuickActionOpen(false);
                            }}
                            aria-label="Toggle Mobile Navigation"
                            className="md:hidden p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                        >
                            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Compact Mobile Breadcrumb Bar */}
            <div className="flex md:hidden items-center gap-1.5 overflow-x-auto whitespace-nowrap px-3 py-1.5 bg-gray-50/80 dark:bg-gray-950/60 border-t border-gray-100 dark:border-gray-800/80 text-[10px] font-bold text-gray-400 dark:text-gray-500">
                <Link href="/dashboard" className="hover:text-blue-600 shrink-0">Dikota</Link>
                {breadcrumbs.map((crumb, idx) => (
                    <React.Fragment key={idx}>
                        <span>/</span>
                        <Link
                            href={crumb.href}
                            className={`shrink-0 ${
                                idx === breadcrumbs.length - 1
                                    ? "text-gray-700 dark:text-gray-300 font-black"
                                    : "hover:text-blue-600"
                            }`}
                        >
                            {crumb.label}
                        </Link>
                    </React.Fragment>
                ))}
            </div>

            {/* Mobile Navigation Responsive Drawer */}
            {isMobileMenuOpen && (
                <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3.5 py-4 md:hidden space-y-4 shadow-xl max-h-[calc(100vh-3.5rem)] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Mobile Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search board, tickets, tasks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-2.5 pl-9 pr-4 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Primary Navigation Links */}
                    <div className="space-y-1">
                        <p className="px-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 pb-1">
                            Navigation
                        </p>
                        {mobileNavLinks.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                                        isActive
                                            ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold"
                                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    }`}
                                >
                                    <Icon className={`h-4 w-4 shrink-0 ${item.color}`} />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </nav>
    );
}
