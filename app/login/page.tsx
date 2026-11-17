"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

import { 
  Layers, 
  Settings, 
  BarChart3, 
  Bell, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  LifeBuoy,
  ShieldAlert 
} from "lucide-react";

import { gsap } from "gsap";
import * as THREE from 'three'; 
import { Canvas, useFrame } from "@react-three/fiber";
import { PointMaterial } from '@react-three/drei'; 

// Circuit-Grid Background (White-Blue Theme Optimization)
function CyberGridBackground() {
  const pointsRef = useRef<any>(null);

  const [nodes] = useState(() => {
    const count = 35;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      arr[i] = (Math.random() - 0.5) * 2.8;      
      arr[i + 1] = (Math.random() - 0.5) * 1.8; 
      arr[i + 2] = (Math.random() - 0.5) * 0.8; 
    }
    return arr;
  });

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.04;
      pointsRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.4) * 0.03;
    }
  });

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[nodes, 3]}
          />
        </bufferGeometry>
        <PointMaterial
          color="#2563eb" 
          size={0.035}
          sizeAttenuation={true}
          transparent={true}
          opacity={0.6}
        />
      </points>
    </group>
  );
}

// Separate component to safely use useSearchParams() inside Suspense
function LoginContent() {
  const { login } = useAuth();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");
  
  const [showMandatoryModal, setShowMandatoryModal] = useState(false);

  const mainContentRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reset = searchParams.get("reset");
    if (reset) {
      setInfoMessage("Password reset successful! Please log in.");
    }

    const isMandatory = searchParams.get("mandatory");
    if (isMandatory === "true") {
      setShowMandatoryModal(true);
    }
  }, [searchParams]);

  const handleProtectedClick = (e: React.MouseEvent) => {
    e.preventDefault(); 
    setShowMandatoryModal(true); 
    
    gsap.timeline()
      .to(".mandatory-card", { x: -8, duration: 0.05, repeat: 3, yoyo: true })
      .to(".mandatory-card", { x: 0, duration: 0.05 });
  };

  // RESPONSIVE CINEMATIC ENTRY
  useEffect(() => {
    const isDesktop = window.innerWidth >= 1024;

    const ctx = gsap.context(() => {
      if (isDesktop) {
        gsap.set(cardRef.current, {
          opacity: 0,
          x: "-130%",
          z: -600,
          rotationY: 80,
          rotationX: 12,
          rotationZ: -20,
          scale: 0.8,
          transformPerspective: 1800
        });

        const tl = gsap.timeline();
        
        tl.to(cardRef.current, {
          opacity: 1,
          x: "0%",
          z: 0,
          rotationY: -10, 
          rotationX: 3,
          rotationZ: 0,
          scale: 1,
          duration: 2.2,
          ease: "power4.out",
        });

        tl.to(cardRef.current, {
          y: "-=10",
          rotationY: "+=1.2",
          duration: 3,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1
        });
      } else {
        // Clean, flat mobile entry so it never overflows narrow screens
        gsap.fromTo(
          cardRef.current,
          { opacity: 0, y: 24, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  // DESKTOP-ONLY PARALLAX ENGINE
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !mainContentRef.current || window.innerWidth < 1024) return;

    const { clientX, clientY } = e;
    const { left, top, width, height } = mainContentRef.current.getBoundingClientRect();

    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const rotateX = -(clientY - centerY) / (height / 2) * 11;
    const rotateY = ((clientX - centerX) / (width / 2) * 14) - 10; 

    gsap.to(cardRef.current, {
      rotationX: rotateX,
      rotationY: rotateY,
      transformPerspective: 1800,
      ease: "power2.out",
      duration: 0.6
    });
  };

  const handleMouseLeave = () => {
    if (!cardRef.current || window.innerWidth < 1024) return;
    gsap.to(cardRef.current, {
      rotationX: 3,
      rotationY: -10,
      ease: "power3.out",
      duration: 1
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");
    setLoading(true);

    if (!email || !password) {
      setError("Please authenticate with full dynamic network credentials.");
      setLoading(false);
      return;
    }

    const res = await login(email, password);
    if (!res.success) {
      setError(res.error || "Dynamic access token validation malfunctioned.");
      setLoading(false);
      
      const isDesktop = window.innerWidth >= 1024;
      if (isDesktop) {
        gsap.timeline()
          .to(cardRef.current, { rotationY: -16, z: -15, duration: 0.05 })
          .to(cardRef.current, { rotationY: 4, z: 20, duration: 0.05 })
          .to(cardRef.current, { rotationY: -10, z: 0, duration: 0.1, ease: "power3.out" });
      } else {
        gsap.timeline()
          .to(cardRef.current, { x: -8, duration: 0.05, repeat: 3, yoyo: true })
          .to(cardRef.current, { x: 0, duration: 0.05 });
      }
    } else {
      setShowMandatoryModal(false);
    }
  };

  const navItems = [
    { name: "Home", icon: Layers, current: true },
    { name: "Docs", icon: Settings },
    { name: "Dashboards", icon: BarChart3 },
    { name: "Updates", icon: Bell },
    { name: "Support", icon: LifeBuoy },
  ];

  return (
    <div 
      ref={mainContentRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex min-h-screen items-center justify-center bg-slate-50 overflow-x-hidden lg:overflow-hidden [perspective:1800px]"
    >
      
      {/* MANDATORY LOGIN POPUP */}
      {showMandatoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 transition-all duration-500">
          <div className="mandatory-card w-full max-w-md p-6 sm:p-8 rounded-2xl border border-blue-200 bg-white text-center shadow-[0_20px_50px_rgba(37,99,235,0.15)] space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-blue-50 border border-blue-200 text-blue-600">
              <ShieldAlert className="h-7 w-7 sm:h-8 sm:w-8" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 tracking-wide">Login is Mandatory</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              To safeguard system integrity and access the Dikota OS environment, you must authenticate your credentials first.
            </p>
            <button 
              onClick={() => setShowMandatoryModal(false)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md shadow-blue-600/20"
            >
              Close & Proceed to Login
            </button>
          </div>
        </div>
      )}

      {/* LAYER 1: Background Video Masking */}
      <div className="fixed inset-0 z-0 opacity-[0.12] mix-blend-multiply pointer-events-none select-none scale-105">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover">
          <source src="/videos/ai-abstract-cyber.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-100 via-transparent to-white" />
      </div>

      {/* LAYER 2: 3D Blue Node Canvas */}
      <div className="fixed inset-0 z-10 pointer-events-none opacity-70">
        <Canvas camera={{ position: [0, 0, 1.2] }}>
          <CyberGridBackground />
        </Canvas>
      </div>

      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-30 px-4 py-3.5 sm:p-5 flex justify-between items-center bg-white/70 backdrop-blur-md border-b border-slate-200/50">
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 select-none">
          <div className="relative w-9 h-9 sm:w-11 sm:h-11 flex justify-center items-center rounded-xl bg-white border border-slate-200 shadow-sm">
            <div className="relative w-6 h-6 sm:w-8 sm:h-8 flex flex-col justify-between items-center">
              <div className="w-5 sm:w-7 h-1 sm:h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-sm transform skew-x-[-15deg]" />
              <div className="w-5 sm:w-7 h-1 sm:h-1.5 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-sm transform skew-x-[-15deg] opacity-70 -mt-0.5" />
              <div className="w-5 sm:w-7 h-1 sm:h-1.5 bg-gradient-to-r from-blue-300 to-indigo-400 rounded-sm transform skew-x-[-15deg] opacity-40 -mt-0.5" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg sm:text-xl font-bold text-slate-800 tracking-wide leading-none">Dikota</span>
            <span className="text-[9px] sm:text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-0.5">Dikota OS</span>
          </div>
        </Link>
        <nav className="flex items-center gap-3 sm:gap-5 text-xs font-semibold text-slate-600">
          <Link href="/pricing" onClick={handleProtectedClick} className="hidden sm:inline-block hover:text-blue-600 transition-colors">Pricing</Link>
          <Link href="/solutions" onClick={handleProtectedClick} className="hidden sm:inline-block hover:text-blue-600 transition-colors">Solutions</Link>
          <button 
            onClick={handleProtectedClick} 
            className="py-2 px-3.5 sm:px-5 text-white font-bold rounded-lg text-[10px] sm:text-[11px] uppercase tracking-widest bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/10 cursor-pointer"
          >
            Request Demo
          </button>
        </nav>
      </header>

      {/* LAYER 3: MAIN LAYOUT */}
      <div className="relative z-20 flex w-full min-h-screen lg:h-[calc(100vh-90px)] pt-24 pb-8 lg:py-0 lg:mt-[75px] max-w-[1400px] gap-8 px-4 sm:px-6 lg:pb-6 items-center">
        
        {/* Sidebar Navigation (Hidden on Mobile/Tablet, Visible on Desktop) */}
        <aside className="hidden lg:flex w-64 h-full flex-col justify-between p-6 rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
          <nav className="space-y-3">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] pl-1 pb-1">Main Protocol</h2>
            {navItems.map((item) => (
              <Link 
                key={item.name} 
                href="/" 
                onClick={handleProtectedClick} 
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${item.current ? "bg-blue-50 text-blue-600 font-semibold border border-blue-100 shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-blue-600"}`}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="text-sm tracking-tight">{item.name}</span>
              </Link>
            ))}
          </nav>
          <div className="space-y-3">
             <div className="h-[1px] bg-slate-100 w-full" />
             <div className="flex items-center gap-4 text-xs text-slate-400 font-medium px-2">
                <Link href="/" onClick={handleProtectedClick} className="hover:text-blue-600">Updates</Link>
                <Link href="/" onClick={handleProtectedClick} className="hover:text-blue-600">Profile</Link>
                <Link href="/" onClick={handleProtectedClick} className="hover:text-blue-600">Settings</Link>
             </div>
          </div>
        </aside>

        {/* Form Container */}
        <div className="flex-1 flex justify-center items-center w-full lg:h-full [perspective:1800px]">
          <div 
            ref={cardRef}
            style={{ transformStyle: "preserve-3d" }}
            className="relative w-full max-w-md sm:max-w-xl rounded-3xl sm:rounded-[32px] border border-slate-200/80 bg-white p-6 sm:p-10 md:p-12 shadow-[0_20px_50px_rgba(37,99,235,0.08)] lg:shadow-[0_30px_70px_rgba(37,99,235,0.08)] space-y-6 sm:space-y-8 anonymity-fix will-change-transform"
          >
            <div className="absolute inset-0 rounded-3xl sm:rounded-[32px] bg-gradient-to-tr from-transparent via-blue-50/[0.1] to-blue-500/[0.02] pointer-events-none" />

            <div className="lg:[transform:translateZ(60px)] flex flex-col items-center text-center space-y-1.5 sm:space-y-2 select-none">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-tight">
                Welcome to Dikota OS
              </h1>
              <p className="text-[9px] sm:text-[10px] text-blue-600 font-bold tracking-[0.2em] sm:tracking-[0.25em] uppercase">
                The enterprise workspace platform authentication
              </p>
            </div>

            {error && (
              <div className="lg:[transform:translateZ(30px)] flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-semibold shadow-sm">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {infoMessage && (
              <div className="lg:[transform:translateZ(30px)] flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-600 text-xs font-semibold shadow-sm">
                <AlertCircle className="h-4 w-4 shrink-0 text-blue-500" />
                <span>{infoMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" style={{ transformStyle: "preserve-3d" }}>
              <div className="relative group lg:[transform:translateZ(40px)]">
                <Mail className="absolute left-4 sm:left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input 
                  type="email" 
                  required
                  placeholder="name@company.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-full border border-slate-200 bg-slate-50/50 py-3.5 sm:p-4 pl-11 sm:pl-12 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>

              <div className="relative group lg:[transform:translateZ(40px)]">
                <Lock className="absolute left-4 sm:left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  placeholder="••••••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-full border border-slate-200 bg-slate-50/50 py-3.5 sm:p-4 pl-11 sm:pl-12 pr-11 sm:pr-12 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 cursor-pointer transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="lg:[transform:translateZ(50px)] w-full py-3.5 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold rounded-full text-xs tracking-widest uppercase shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 transition-all duration-300 transform active:scale-[0.97] cursor-pointer mt-2 sm:mt-4"
              >
                {loading ? "Initializing Protocols..." : "Access Dikota Workspace"}
              </button>
            </form>

            <div className="h-[1px] bg-slate-100 w-full my-3 sm:my-4" />

            {/* Social Media Links */}
            <div className="lg:[transform:translateZ(30px)] flex flex-col items-center gap-3">
              <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold tracking-[0.2em] uppercase">
                Official Channels & Socials
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 w-full">
                {/* GitHub */}
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="GitHub"
                  className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all duration-300 transform hover:-translate-y-1 shadow-sm hover:shadow-md cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                </a>
                {/* LinkedIn */}
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="LinkedIn"
                  className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2] transition-all duration-300 transform hover:-translate-y-1 shadow-sm hover:shadow-md cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                  </svg>
                </a>
                {/* YouTube */}
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="YouTube"
                  className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-[#FF0000] hover:text-white hover:border-[#FF0000] transition-all duration-300 transform hover:-translate-y-1 shadow-sm hover:shadow-md cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                {/* Instagram */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Instagram"
                  className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-600 hover:text-white hover:border-pink-500 transition-all duration-300 transform hover:-translate-y-1 shadow-sm hover:shadow-md cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                {/* Snapchat */}
                <a
                  href="https://snapchat.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Snapchat"
                  className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-[#FFFC00] hover:text-slate-900 hover:border-[#FFFC00] transition-all duration-300 transform hover:-translate-y-1 shadow-sm hover:shadow-md cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.012 2c-3.57 0-6.12 2.37-6.12 5.58 0 .87.21 1.8.54 2.61-.42.15-.99.39-1.35.81-.39.45-.33.93-.09 1.35.33.57 1.05.81 1.74.87-.21.93-.57 2.01-1.47 2.67-.54.39-.99.66-1.11.87-.18.33.03.66.45.69 1.62.12 3.18-.87 4.38-1.89.96.24 1.95.36 2.97.36s2.01-.12 2.97-.36c1.2 1.02 2.76 2.01 4.38 1.89.42-.03.63-.36.45-.69-.12-.21-.57-.48-1.11-.87-.9-.66-1.26-1.74-1.47-2.67.69-.06 1.41-.3 1.74-.87.24-.42.3-.9-.09-1.35-.36-.42-.93-.66-1.35-.81.33-.81.54-1.74.54-2.61 0-3.21-2.55-5.58-6.12-5.58z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div className="h-[1px] bg-slate-100 w-full my-3 sm:my-4" />

            <div className="lg:[transform:translateZ(20px)] flex flex-col sm:flex-row justify-between gap-2.5 sm:gap-4 items-center text-center sm:text-left text-[10px] text-slate-400 px-1 sm:px-3 font-semibold uppercase tracking-widest">
              <Link href="/forgot-password" className="hover:text-blue-600 transition-colors">
                Recover authentication data?
              </Link>
              <Link href="/register" className="text-blue-600 hover:text-blue-700 transition-colors font-bold">
                Configure protocol access
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// Main exported component wrapped in Suspense for Next.js structural safety
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500 text-sm font-semibold px-4 text-center">
        Loading Authentication Secure System...
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
