"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Layers, Mail, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [mockLink, setMockLink] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        // Save the mock link to show the tester
        setMockLink(data.message.split("(Mock link: ")[1]?.split(")")[0] || "");
      } else {
        setError(data.error || "Failed to process request.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
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
            <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Reset your password</h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold mt-1">RECOVER YOUR SYSTEM ACCESS</p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center text-center p-4 bg-emerald-50 dark:bg-emerald-950/15 border border-emerald-200 dark:border-emerald-900/20 rounded-2xl space-y-3">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-400">Recovery Attempt Logged</h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-normal">
                  We've successfully verified the email address. For testing convenience, we've generated a mock token link below.
                </p>
              </div>
            </div>

            {mockLink && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Simulated Email Reset Link</p>
                <Link 
                  href={mockLink} 
                  className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold shadow-xs active:scale-98 transition-all"
                >
                  Click to Reset Password
                </Link>
              </div>
            )}

            <Link 
              href="/login" 
              className="flex items-center justify-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors pt-2"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-normal text-center">
              Enter the email address associated with your account and we will simulate sending a password reset link.
            </p>

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

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl text-xs shadow-md transition-all transform active:scale-98 cursor-pointer mt-2"
            >
              {loading ? "PROCESSING REQUEST..." : "SEND RECOVERY EMAIL"}
            </button>

            <Link 
              href="/login" 
              className="flex items-center justify-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors pt-2"
            >
              <ArrowLeft className="h-4 w-4" /> Cancel and go back
            </Link>
          </form>
        )}

      </div>
    </div>
  );
}
