"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Rocket, BrainCircuit, Layout, CheckSquare, 
  Users, TrendingUp, AlertTriangle, Cpu, 
  Activity, ArrowUpRight, Calendar, UserPlus, Clock, Play
} from "lucide-react";

export default function DashboardPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
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
      <div className="space-y-6 animate-pulse px-4 sm:px-6">
        <div className="h-10 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 bg-gray-200 dark:bg-gray-800 rounded-2xl lg:col-span-2"></div>
          <div className="h-80 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 pb-12">
      
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">Executive Dashboard</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Real-time telemetry and resource management insights.</p>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-850 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 shadow-2xs cursor-pointer transition-colors w-full sm:w-auto"
        >
          <Activity className="h-4 w-4 text-blue-600" />
          <span>Refresh Feeds</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* KPI 1 */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 sm:p-5 rounded-2xl shadow-2xs flex items-center justify-between group hover:border-blue-500/35 transition-all duration-300">
          <div className="space-y-1">
            <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Active Incident Payload</p>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">{activeTickets.length}</h3>
            <span className="text-[9px] text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400 font-extrabold px-2 py-0.5 rounded-full inline-block">
              {resolvedTickets.length} SLA Resolved
            </span>
          </div>
          <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
            <Layout className="h-5 w-5" />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 sm:p-5 rounded-2xl shadow-2xs flex items-center justify-between group hover:border-purple-500/35 transition-all duration-300">
          <div className="space-y-1">
            <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Active Workflows</p>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">{activeWorkflowsCount}</h3>
            <span className="text-[9px] text-purple-600 bg-purple-50 dark:bg-purple-950/20 dark:text-purple-400 font-extrabold px-2 py-0.5 rounded-full inline-block">
              {completedWorkflowsCount} Completed
            </span>
          </div>
          <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
            <BrainCircuit className="h-5 w-5" />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 sm:p-5 rounded-2xl shadow-2xs flex items-center justify-between group hover:border-emerald-500/35 transition-all duration-300">
          <div className="space-y-1">
            <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Team Performance</p>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">{averagePerformance}%</h3>
            <span className="text-[9px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 font-extrabold px-2 py-0.5 rounded-full inline-block">
              SLA Compliance Peak
            </span>
          </div>
          <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 sm:p-5 rounded-2xl shadow-2xs flex items-center justify-between group hover:border-pink-500/35 transition-all duration-300">
          <div className="space-y-1">
            <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Workspace Capacity</p>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">{employees.length} Agents</h3>
            <span className="text-[9px] text-pink-600 bg-pink-50 dark:bg-pink-950/20 dark:text-pink-400 font-extrabold px-2 py-0.5 rounded-full inline-block">
              {totalTasks} Assigned Items
            </span>
          </div>
          <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
            <Users className="h-5 w-5" />
          </div>
        </div>

      </div>

      {/* Primary Row: Charts & AI Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Productivity Line Chart Widget */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 sm:p-5 rounded-2xl shadow-2xs lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
            <div>
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Productivity & SLA Uptime</h3>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold mt-0.5">SLA INCIDENT RESOLUTION SPEED (WEEKLY TREND)</p>
            </div>
            <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-full self-start sm:self-auto">Target: 99.8%</span>
          </div>
          
          {/* Custom SVG Line Chart */}
          <div className="relative h-44 sm:h-48 w-full pt-4 overflow-hidden">
            <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Horizontal Grid lines */}
              <line x1="0" y1="15" x2="500" y2="15" stroke="rgba(156, 163, 175, 0.1)" strokeWidth="1" />
              <line x1="0" y1="65" x2="500" y2="65" stroke="rgba(156, 163, 175, 0.1)" strokeWidth="1" />
              <line x1="0" y1="115" x2="500" y2="115" stroke="rgba(156, 163, 175, 0.1)" strokeWidth="1" />
              
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
              <circle cx="100" cy="45" r="4.5" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
              <circle cx="200" cy="75" r="4.5" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
              <circle cx="300" cy="25" r="4.5" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
              <circle cx="400" cy="35" r="4.5" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
              <circle cx="500" cy="15" r="4.5" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
            </svg>
            {/* Chart Labels */}
            <div className="flex justify-between text-[9px] font-bold text-gray-400 dark:text-gray-500 mt-2 px-1">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat (Peak)</span>
            </div>
          </div>
        </div>

        {/* AI Recommendations Panel */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 sm:p-5 rounded-2xl shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
            <div>
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="h-4 w-4 text-purple-500" />
                <span>AI Suggestions Panel</span>
              </h3>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold mt-0.5">RESOURCE OPTIMIZATION SCHEDULER</p>
            </div>
          </div>

          <div className="space-y-3.5 pt-1 overflow-y-auto max-h-56">
            {aiSuggestions.map((sug) => (
              <div 
                key={sug.id} 
                className={`p-3.5 rounded-xl border flex gap-3 ${
                  sug.type === "critical" 
                    ? "bg-red-50/50 dark:bg-red-950/10 border-red-200 dark:border-red-900/30" 
                    : sug.type === "warning"
                    ? "bg-amber-50/50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900/30"
                    : "bg-blue-50/40 dark:bg-blue-950/10 border-blue-100 dark:border-blue-900/20"
                }`}
              >
                <AlertTriangle className={`h-4.5 w-4.5 shrink-0 ${
                  sug.type === "critical" ? "text-red-500" : sug.type === "warning" ? "text-amber-500" : "text-blue-500"
                }`} />
                <div className="space-y-1">
                  <h4 className="text-[11px] font-extrabold text-gray-800 dark:text-gray-200">{sug.title}</h4>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-normal">{sug.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Secondary Row: Team Capacity & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Team Workload distribution */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 sm:p-5 rounded-2xl shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
            <div>
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Operational Capacity</h3>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold mt-0.5">AGENT ASSIGNMENTS & PERFORMANCE</p>
            </div>
            <Link href="/teams" className="text-[10px] text-blue-600 font-bold hover:underline">Manage Team</Link>
          </div>

          <div className="space-y-3.5 pt-1 overflow-y-auto max-h-56">
            {employees.map((emp) => (
              <div key={emp.id || emp._id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-700 dark:text-gray-300 truncate pr-2">{emp.name} ({emp.role})</span>
                  <span className="text-gray-400 dark:text-gray-500 text-[10px] shrink-0">Active: <b>{emp.activeTickets}</b> | Perf: <b>{emp.performance}%</b></span>
                </div>
                {/* Visual bar */}
                <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                    style={{ width: `${emp.performance}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Tasks List */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 sm:p-5 rounded-2xl shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
            <div>
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Sprint Backlog Items</h3>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold mt-0.5">UNRESOLVED BLOCKS ({pendingTasks.length})</p>
            </div>
            <Link href="/tasks" className="text-[10px] text-blue-600 font-bold hover:underline">Open Kanban</Link>
          </div>

          <div className="space-y-2.5 pt-1 overflow-y-auto max-h-56">
            {pendingTasks.length === 0 ? (
              <p className="text-xs text-gray-400 italic text-center py-6">No pending backlog blocks.</p>
            ) : (
              pendingTasks.map((task) => (
                <div key={task.id || task._id} className="flex items-center justify-between gap-3 p-3 bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{task.title}</h4>
                    <span className="text-[9px] text-gray-400 dark:text-gray-500 mt-1 block truncate">Due: {task.due} | Owner: {task.assignee}</span>
                  </div>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 ${
                    task.priority === "High" 
                      ? "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400"
                      : task.priority === "Medium"
                      ? "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400"
                      : "bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400"
                  }`}>
                    {task.priority}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Workspace Recent Activity Timeline */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 sm:p-5 rounded-2xl shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
            <div>
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Telemetry Logs</h3>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold mt-0.5">RECENT AUDIT STREAM</p>
            </div>
          </div>

          <div className="space-y-3.5 pt-1 overflow-y-auto max-h-56 relative border-l border-gray-200 dark:border-gray-800 pl-4 ml-2">
            <div className="relative space-y-4">
              <div className="relative">
                <span className="absolute -left-[20.5px] mt-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-blue-600 ring-4 ring-white dark:ring-gray-900"></span>
                <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Session synchronized</p>
                <span className="text-[9px] text-gray-400 block mt-0.5">Agent session successfully initialized.</span>
              </div>
              <div className="relative">
                <span className="absolute -left-[20.5px] mt-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-indigo-600 ring-4 ring-white dark:ring-gray-900"></span>
                <p className="text-xs font-bold text-gray-800 dark:text-gray-200">DB Persistence initialized</p>
                <span className="text-[9px] text-gray-400 block mt-0.5">Dynamic collection models configured.</span>
              </div>
              {tickets.slice(0, 1).map(ticket => (
                <div key={ticket.id || ticket._id} className="relative">
                  <span className="absolute -left-[20.5px] mt-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-purple-600 ring-4 ring-white dark:ring-gray-900"></span>
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">Incident active log query</p>
                  <span className="text-[9px] text-gray-400 block mt-0.5 truncate">Queried incident: "{ticket.name}".</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
