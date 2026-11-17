"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  BrainCircuit, Layout, 
  Users, TrendingUp, AlertTriangle, Cpu, 
  Activity, RefreshCw
} from "lucide-react";

export default function DashboardPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    try {
      const [tRes, wRes, taRes, eRes] = await Promise.all([
        fetch("/api/tickets"),
        fetch("/api/workflows"),
        fetch("/api/tasks"),
        fetch("/api/employees")
      ]);

      if (tRes.ok) setTickets(await tRes.json());
      if (wRes.ok) setWorkflows(await wRes.json());
      if (taRes.ok) setTasks(await taRes.json());
      if (eRes.ok) setEmployees(await eRes.json());
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Data aggregations
  const activeTickets = tickets.filter(t => t.group === "active");
  const resolvedTickets = tickets.filter(t => t.group === "done");
  const activeWorkflowsCount = workflows.filter(w => w.status !== "Completed").length;
  const completedWorkflowsCount = workflows.filter(w => w.status === "Completed").length;

  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter(t => t.status !== "Done").slice(0, 5);

  const averagePerformance = employees.length > 0 
    ? Math.round(employees.reduce((acc, emp) => acc + (emp.performance || 0), 0) / employees.length)
    : 94;

  // AI Suggestions Generator based on open incidents
  const getAiSuggestions = () => {
    if (activeTickets.length === 0) {
      return [
        {
          id: 1,
          title: "All Systems Operational",
          desc: "System SLA is operating at 100%. No resource bottlenecks detected.",
          type: "success"
        }
      ];
    }
    
    const suggestions = [];
    const oauthError = activeTickets.some(t => t.name.toLowerCase().includes("auth") || t.name.toLowerCase().includes("login"));
    const billingError = activeTickets.some(t => t.name.toLowerCase().includes("billing") || t.name.toLowerCase().includes("stripe"));

    if (oauthError) {
      suggestions.push({
        id: 1,
        title: "Auth Latency Bottleneck",
        desc: "High fail rates in Android OAuth verifications. Recommendation: Allocate Aman Sharma to refactor Redis token-validation cache keys.",
        type: "warning"
      });
    }

    if (billingError) {
      suggestions.push({
        id: 2,
        title: "Payment Gateway Degradation",
        desc: "Webhook response timeouts (Stripe hook latency > 3s). Recommendation: Spin up microservices webhook queue handler.",
        type: "critical"
      });
    }

    if (suggestions.length === 0) {
      suggestions.push({
        id: 3,
        title: "Incident Backlog Optimization",
        desc: "Distribute open incident payloads across available Collaborators to maintain target weekly SLA threshold.",
        type: "info"
      });
    }

    return suggestions;
  };

  const aiSuggestions = getAiSuggestions();

  if (loading) {
    return (
      <div className="w-full max-w-full overflow-x-hidden space-y-5 animate-pulse px-3.5 sm:px-6 pt-4 pb-10">
        <div className="h-9 w-44 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 sm:h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="h-64 sm:h-80 bg-gray-200 dark:bg-gray-800 rounded-2xl lg:col-span-2"></div>
          <div className="h-64 sm:h-80 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-5 sm:space-y-6 px-3.5 sm:px-6 pt-2 pb-12">
      
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Executive Dashboard
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
            Real-time telemetry and resource management insights.
          </p>
        </div>
        <button 
          onClick={() => fetchDashboardData(true)}
          disabled={refreshing}
          className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-850 hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-[0.98] rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 shadow-2xs cursor-pointer transition-all w-full sm:w-auto shrink-0"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-blue-600 ${refreshing ? "animate-spin" : ""}`} />
          <span>{refreshing ? "Syncing..." : "Refresh Feeds"}</span>
        </button>
      </div>

      {/* KPI Stats Grid: 2x2 on Mobile, 4 columns on Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        
        {/* KPI 1 */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-3.5 sm:p-5 rounded-2xl shadow-2xs flex flex-col justify-between gap-3 group hover:border-blue-500/35 transition-all duration-300 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider leading-tight">
              Active Incidents
            </p>
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Layout className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          <div className="space-y-1.5">
            <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
              {activeTickets.length}
            </h3>
            <span className="text-[10px] text-amber-700 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 font-bold px-2 py-0.5 rounded-md inline-block">
              {resolvedTickets.length} Resolved
            </span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-3.5 sm:p-5 rounded-2xl shadow-2xs flex flex-col justify-between gap-3 group hover:border-purple-500/35 transition-all duration-300 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider leading-tight">
              Active Workflows
            </p>
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <BrainCircuit className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          <div className="space-y-1.5">
            <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
              {activeWorkflowsCount}
            </h3>
            <span className="text-[10px] text-purple-700 bg-purple-50 dark:bg-purple-950/30 dark:text-purple-400 font-bold px-2 py-0.5 rounded-md inline-block">
              {completedWorkflowsCount} Done
            </span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-3.5 sm:p-5 rounded-2xl shadow-2xs flex flex-col justify-between gap-3 group hover:border-emerald-500/35 transition-all duration-300 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider leading-tight">
              Performance
            </p>
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          <div className="space-y-1.5">
            <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
              {averagePerformance}%
            </h3>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-md inline-block">
              SLA Peak
            </span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-3.5 sm:p-5 rounded-2xl shadow-2xs flex flex-col justify-between gap-3 group hover:border-pink-500/35 transition-all duration-300 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider leading-tight">
              Capacity
            </p>
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0">
              <Users className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          <div className="space-y-1.5">
            <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
              {employees.length} <span className="text-sm sm:text-base font-bold text-gray-500">Agents</span>
            </h3>
            <span className="text-[10px] text-pink-700 bg-pink-50 dark:bg-pink-950/30 dark:text-pink-400 font-bold px-2 py-0.5 rounded-md inline-block">
              {totalTasks} Tasks
            </span>
          </div>
        </div>

      </div>

      {/* Primary Row: Charts & AI Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Productivity Line Chart Widget */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 sm:p-5 rounded-2xl shadow-2xs lg:col-span-2 space-y-4 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
            <div>
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Productivity & SLA Uptime
              </h3>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold mt-0.5">
                INCIDENT RESOLUTION SPEED (WEEKLY)
              </p>
            </div>
            <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-full shrink-0">
              Target: 99.8%
            </span>
          </div>
          
          {/* Horizontally Scrollable Chart on Very Narrow Mobile Screens */}
          <div className="w-full overflow-x-auto pb-2 -mx-1 px-1">
            <div className="min-w-[380px] sm:min-w-0">
              <div className="relative h-40 sm:h-48 w-full pt-3">
                <svg viewBox="0 0 500 130" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* Horizontal Grid lines */}
                  <line x1="0" y1="15" x2="500" y2="15" stroke="rgba(156, 163, 175, 0.15)" strokeWidth="1" />
                  <line x1="0" y1="65" x2="500" y2="65" stroke="rgba(156, 163, 175, 0.15)" strokeWidth="1" />
                  <line x1="0" y1="115" x2="500" y2="115" stroke="rgba(156, 163, 175, 0.15)" strokeWidth="1" />
                  
                  {/* Glow Fill */}
                  <path d="M 0 115 L 0 65 L 100 45 L 200 75 L 300 25 L 400 35 L 500 15 L 500 115 Z" fill="url(#chartGlow)" />
                  
                  {/* Line path */}
                  <path 
                    d="M 0 65 L 100 45 L 200 75 L 300 25 L 400 35 L 500 15" 
                    fill="none" 
                    stroke="#3b82f6" 
                    strokeWidth="3.5" 
                    strokeLinecap="round" 
                  />
                  
                  {/* Active data dots */}
                  <circle cx="100" cy="45" r="5" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="200" cy="75" r="5" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="300" cy="25" r="5" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="400" cy="35" r="5" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="500" cy="15" r="5" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
                </svg>
              </div>
              {/* Chart Labels */}
              <div className="flex justify-between text-[10px] font-bold text-gray-400 dark:text-gray-500 mt-2 px-1">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat (Peak)</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Recommendations Panel */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 sm:p-5 rounded-2xl shadow-2xs space-y-4 min-w-0">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
            <div>
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="h-4 w-4 text-purple-500 shrink-0" />
                <span>AI Suggestions</span>
              </h3>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold mt-0.5">
                RESOURCE OPTIMIZATION
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-1 lg:overflow-y-auto lg:max-h-56">
            {aiSuggestions.map((sug) => (
              <div 
                key={sug.id} 
                className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                  sug.type === "critical" 
                    ? "bg-red-50/50 dark:bg-red-950/10 border-red-200 dark:border-red-900/30" 
                    : sug.type === "warning"
                    ? "bg-amber-50/50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900/30"
                    : "bg-blue-50/40 dark:bg-blue-950/10 border-blue-100 dark:border-blue-900/20"
                }`}
              >
                <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${
                  sug.type === "critical" ? "text-red-500" : sug.type === "warning" ? "text-amber-500" : "text-blue-500"
                }`} />
                <div className="space-y-1 min-w-0">
                  <h4 className="text-xs font-extrabold text-gray-800 dark:text-gray-200 leading-snug">
                    {sug.title}
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                    {sug.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Secondary Row: Team Capacity, Tasks & Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Team Workload distribution */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 sm:p-5 rounded-2xl shadow-2xs space-y-4 min-w-0">
          <div className="flex items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
            <div>
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Operational Capacity
              </h3>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold mt-0.5">
                AGENT PERFORMANCE
              </p>
            </div>
            <Link href="/teams" className="text-[11px] text-blue-600 font-bold hover:underline py-1 px-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 shrink-0">
              Manage
            </Link>
          </div>

          <div className="space-y-4 pt-1 lg:overflow-y-auto lg:max-h-56">
            {employees.length === 0 ? (
              <p className="text-xs text-gray-400 italic text-center py-4">No agents assigned yet.</p>
            ) : (
              employees.map((emp) => (
                <div key={emp.id || emp._id} className="space-y-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 text-xs">
                    <span className="font-bold text-gray-800 dark:text-gray-200">
                      {emp.name} <span className="font-normal text-gray-400">({emp.role})</span>
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-[11px]">
                      Active: <b>{emp.activeTickets}</b> • Perf: <b>{emp.performance}%</b>
                    </span>
                  </div>
                  {/* Visual bar */}
                  <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                      style={{ width: `${emp.performance}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Tasks List */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 sm:p-5 rounded-2xl shadow-2xs space-y-4 min-w-0">
          <div className="flex items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
            <div>
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Sprint Backlog
              </h3>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold mt-0.5">
                UNRESOLVED ({pendingTasks.length})
              </p>
            </div>
            <Link href="/tasks" className="text-[11px] text-blue-600 font-bold hover:underline py-1 px-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 shrink-0">
              Kanban
            </Link>
          </div>

          <div className="space-y-2.5 pt-1 lg:overflow-y-auto lg:max-h-56">
            {pendingTasks.length === 0 ? (
              <p className="text-xs text-gray-400 italic text-center py-6">No pending backlog blocks.</p>
            ) : (
              pendingTasks.map((task) => (
                <div key={task.id || task._id} className="flex items-start sm:items-center justify-between gap-3 p-3 bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 break-words leading-snug">
                      {task.title}
                    </h4>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 block">
                      Due: {task.due} • {task.assignee}
                    </span>
                  </div>
                  <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full shrink-0 ${
                    task.priority === "High" 
                      ? "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400"
                      : task.priority === "Medium"
                      ? "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400"
                      : "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400"
                  }`}>
                    {task.priority}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Workspace Recent Activity Timeline */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 sm:p-5 rounded-2xl shadow-2xs space-y-4 min-w-0">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
            <div>
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Telemetry Logs
              </h3>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold mt-0.5">
                RECENT AUDIT STREAM
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-1 lg:overflow-y-auto lg:max-h-56 relative border-l-2 border-gray-200 dark:border-gray-800 pl-4 ml-2">
            <div className="relative">
              <span className="absolute -left-[21.5px] top-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-blue-600 ring-4 ring-white dark:ring-gray-900"></span>
              <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Session synchronized</p>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 block mt-0.5 leading-relaxed">
                Agent Aman Sharma entered session.
              </span>
            </div>
            <div className="relative">
              <span className="absolute -left-[21.5px] top-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-indigo-600 ring-4 ring-white dark:ring-gray-900"></span>
              <p className="text-xs font-bold text-gray-800 dark:text-gray-200">DB Persistence initialized</p>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 block mt-0.5 leading-relaxed">
                Dynamic collection models configured.
              </span>
            </div>
            {tickets.slice(0, 1).map(ticket => (
              <div key={ticket.id || ticket._id} className="relative">
                <span className="absolute -left-[21.5px] top-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-purple-600 ring-4 ring-white dark:ring-gray-900"></span>
                <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Incident active log query</p>
                <span className="text-[11px] text-gray-500 dark:text-gray-400 block mt-0.5 leading-relaxed break-words">
                  Queried incident: &ldquo;{ticket.name}&rdquo;.
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
