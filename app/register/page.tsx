"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Layers, Mail, Lock, User, Eye, EyeOff, AlertCircle } from "lucide-react";
export default function RegisterPage() {
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }
    const res = await register(name, email, password);
    if (!res.success) {
      setError(res.error || "Registration failed.");
      setLoading(false);
    }
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-radial from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-950 p-4 transition-colors duration-300">
      <div className="w-full max-w-md rounded-2xl border border-gray-200/60 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-8 shadow-2xl space-y-6">

        {/* App Logo/Header */}
        <div className="flex flex-col items-center text-center space-y-2 select-none">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 shadow-md">
            <Layers className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Create your account</h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold mt-1">JOIN THE COLLABORATIVE WORKSPACE OS</p>
          </div>
        </div>
        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Full Name</label>
            <div className="relative group">
              <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                required
                placeholder="Aman Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 p-3 pl-10 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 focus:ring-3 focus:ring-blue-100 dark:focus:ring-blue-950/30 transition-all"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 p-3 pl-10 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 focus:ring-3 focus:ring-blue-100 dark:focus:ring-blue-950/30 transition-all"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Password</label>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 p-3 pl-10 pr-10 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 focus:ring-3 focus:ring-blue-100 dark:focus:ring-blue-950/30 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl text-xs shadow-md transition-all transform active:scale-98 cursor-pointer mt-2"
          >
            {loading ? "CREATING YOUR ACCOUNT..." : "REGISTER AND GET STARTED"}
          </button>
        </form>
        <div className="h-[1px] bg-gray-100 dark:bg-gray-800 w-full my-4" />
        {/* Link to Login */}
        <p className="text-center text-[11px] font-semibold text-gray-500 dark:text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline font-bold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}