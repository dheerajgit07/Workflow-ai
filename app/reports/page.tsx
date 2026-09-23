"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, DollarSign, Target, Layers, Calendar, 
  Download, Plus, Trash2, ChevronDown, ChevronUp, Search, 
  SlidersHorizontal, CheckCircle2, AlertCircle, XCircle,
  ArrowUpDown, Filter, RefreshCw, Eye, EyeOff, CheckSquare, Square
} from "lucide-react";

interface DepartmentReport {
  id: string;
  department: string;
  budgetAllocated: number;
  budgetUsed: number;
  targetOutput: number; 
  currentOutput: number; 
  headcount: number;
  status: "On Track" | "At Risk" | "Critical";
  manager: string;
  startDate: string;
}

interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  text: string;
}

type SortField = "department" | "budgetAllocated" | "budgetUsed" | "headcount" | "currentOutput" | null;
type SortOrder = "asc" | "desc";

const INITIAL_STATE: DepartmentReport[] = [
  { id: "REP-01", department: "Engineering Ecosystem", budgetAllocated: 500000, budgetUsed: 412000, targetOutput: 90, currentOutput: 86, headcount: 24, status: "On Track", manager: "Dheeraj Kamboj", startDate: "2026-01-10" },
  { id: "REP-02", department: "UI/UX Design Studio", budgetAllocated: 180000, budgetUsed: 165000, targetOutput: 95, currentOutput: 92, headcount: 8, status: "On Track", manager: "Aarav Sharma", startDate: "2026-02-15" },
  { id: "REP-03", department: "Growth Marketing", budgetAllocated: 320000, budgetUsed: 315000, targetOutput: 85, currentOutput: 71, headcount: 12, status: "At Risk", manager: "Neha Verma", startDate: "2026-01-05" },
  { id: "REP-04", department: "Global Finance Desk", budgetAllocated: 120000, budgetUsed: 98000, targetOutput: 98, currentOutput: 97, headcount: 4, status: "On Track", manager: "Rohan Gupta", startDate: "2026-03-01" },
  { id: "REP-05", department: "Talent & Culture", budgetAllocated: 150000, budgetUsed: 148000, targetOutput: 90, currentOutput: 64, headcount: 6, status: "Critical", manager: "Priya Nair", startDate: "2026-01-20" },
];

export default function EnterpriseReportsDashboard() {
  const [reportRecords, setReportRecords] = useState<DepartmentReport[]>(INITIAL_STATE);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [timePeriod, setTimePeriod] = useState<string>("Q2-2026");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  // Advanced State Management Controls
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [selectedRowIds, setSelectedRowIds] = useState<Record<string, boolean>>({});

  // Form State for Row Creation
  const [newDept, setNewDept] = useState("");
  const [newBudget, setNewBudget] = useState<number>(200000);
  const [newHeadcount, setNewHeadcount] = useState<number>(5);
  const [newManager, setNewManager] = useState("");

  const fetchReports = async () => {
    try {
      const res = await fetch("/api/reports");
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setReportRecords(data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    }
  };

  React.useEffect(() => {
    fetchReports();
  }, []);

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // ─── POWERFUL SORT & FILTER PIPELINE ───
  const processedReports = useMemo(() => {
    let result = reportRecords.filter(item => {
      const matchesSearch = item.department?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.manager?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "All" || item.status === filterStatus;
      return matchesSearch && matchesStatus;
    });

    if (sortField) {
      result = [...result].sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (typeof valA === "string") {
          return sortOrder === "asc" 
            ? (valA as string).localeCompare(valB as string) 
            : (valB as string).localeCompare(valA as string);
        } else {
          return sortOrder === "asc" 
            ? (valA as number) - (valB as number) 
            : (valB as number) - (valA as number);
        }
      });
    }
    return result;
  }, [reportRecords, searchTerm, filterStatus, sortField, sortOrder]);

  // ─── LIVE CORPORATE METRICS ENGINE ───
  const analytics = useMemo(() => {
    const totalBudget = reportRecords.reduce((acc, c) => acc + (c.budgetAllocated || 0), 0);
    const totalUsed = reportRecords.reduce((acc, c) => acc + (c.budgetUsed || 0), 0);
    const totalHeadcount = reportRecords.reduce((acc, c) => acc + (c.headcount || 0), 0);
    const avgOutput = reportRecords.length 
      ? Math.round(reportRecords.reduce((acc, c) => acc + (c.currentOutput || 0), 0) / reportRecords.length) 
      : 0;
    const burnRate = totalBudget ? Math.round((totalUsed / totalBudget) * 100) : 0;
    const onTrackCount = reportRecords.filter(r => r.status === "On Track").length;
    
    return { totalBudget, totalUsed, totalHeadcount, avgOutput, burnRate, onTrackCount };
  }, [reportRecords]);

  // ─── HANDLERS ───
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    showToast(`Sorted catalog by ${field}`, "info");
  };

  const handleAddNewRow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDept.trim()) return showToast("Department Name is required", "error");

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          department: newDept.trim(),
          budgetAllocated: Number(newBudget) || 100000,
          headcount: Number(newHeadcount) || 1,
          manager: newManager.trim() || "Unassigned"
        })
      });
      if (res.ok) {
        fetchReports();
      } else {
        const newRow: DepartmentReport = {
          id: `REP-${Math.floor(100 + Math.random() * 900)}`,
          department: newDept.trim(),
          budgetAllocated: Number(newBudget) || 100000,
          budgetUsed: 0,
          targetOutput: 90,
          currentOutput: 75,
          headcount: Number(newHeadcount) || 1,
          status: "On Track",
          manager: newManager.trim() || "Unassigned",
          startDate: new Date().toISOString().split('T')[0]
        };
        setReportRecords((prev) => [...prev, newRow]);
      }
    } catch (err) {
      console.error("Error creating report:", err);
    }

    setNewDept("");
    setNewManager("");
    showToast(`Nodes for "${newDept}" deployed successfully`);
  };

  const updateCell = async (id: string, field: keyof DepartmentReport, value: any) => {
    setReportRecords((prev) => prev.map((row) => {
      if (row.id === id) {
        const updated = { ...row, [field]: value };
        if (field === "currentOutput") {
          const v = Number(value);
          updated.status = v < 70 ? "Critical" : v < 85 ? "At Risk" : "On Track";
        }
        return updated;
      }
      return row;
    }));

    try {
      await fetch("/api/reports", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, field, value })
      });
    } catch (err) {
      console.error("Failed to update report cell:", err);
    }
  };

  const deleteRow = async (id: string, name: string) => {
    setReportRecords((prev) => prev.filter((row) => row.id !== id));
    setSelectedRowIds(prev => { const c = {...prev}; delete c[id]; return c; });
    
    try {
      await fetch(`/api/reports?id=${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to delete report:", err);
    }
    showToast(`Archived operational unit: ${name}`, "info");
  };

  const toggleExpandRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSelectRow = (id: string) => {
    setSelectedRowIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSelectAll = () => {
    const allSelected = processedReports.every(r => selectedRowIds[r.id]);
    const nextSelection: Record<string, boolean> = {};
    if (!allSelected) {
      processedReports.forEach(r => { nextSelection[r.id] = true; });
    }
    setSelectedRowIds(nextSelection);
  };

  // ─── BULK CONTROLS ───
  const selectedCount = Object.values(selectedRowIds).filter(Boolean).length;

  const handleBulkDelete = () => {
    setReportRecords(prev => prev.filter(r => !selectedRowIds[r.id]));
    setSelectedRowIds({});
    showToast(`Threw out ${selectedCount} selected matrix logs successfully`, "error");
  };

  const handleBulkStatusChange = (status: "On Track" | "At Risk" | "Critical") => {
    setReportRecords(prev => prev.map(r => selectedRowIds[r.id] ? { ...r, status } : r));
    setSelectedRowIds({});
    showToast(`Batch updated status parameters to ${status}`, "success");
  };

  const resetOperationalDatabase = () => {
    setReportRecords(INITIAL_STATE);
    setSearchTerm("");
    setFilterStatus("All");
    setSortField(null);
    setSelectedRowIds({});
    setExpandedRows({});
    showToast("Re-synced database ledger to master branch templates", "success");
  };

  const exportReportsSheet = () => {
    if (processedReports.length === 0) return showToast("No rows to compile", "info");
    const headers = "ID,Department,Manager,Allocated Budget,Used Budget,Current Output %,Headcount,Status,Start Date\n";
    const rows = processedReports.map(k => `${k.id},"${k.department}","${k.manager}",${k.budgetAllocated},${k.budgetUsed},${k.currentOutput},${k.headcount},${k.status},${k.startDate}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Corporate_Master_Report_${timePeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Master metrics compiled to local workstation files");
  };

  const statusConfig = {
    "On Track": { bg: "bg-[#00c875]", text: "text-white", badge: "bg-[#00c875]/10 text-[#00c875] border-[#00c875]/20" },
    "At Risk": { bg: "bg-[#e2b13c]", text: "text-white", badge: "bg-[#e2b13c]/10 text-[#e2b13c] border-[#e2b13c]/20" },
    "Critical": { bg: "bg-[#df2f4a]", text: "text-white", badge: "bg-[#df2f4a]/10 text-[#df2f4a] border-[#df2f4a]/20" }
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-[#323338] font-sans antialiased pb-24 selection:bg-[#0073ea]/25">
      
      {/* Dynamic Floating Toast Canvas */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#1c1f23] text-white text-xs px-4 py-3 rounded-lg shadow-2xl flex items-center gap-2.5 border border-gray-800 pointer-events-auto"
            >
              {t.type === "success" && <CheckCircle2 className="w-4 h-4 text-[#00c875]" />}
              {t.type === "error" && <XCircle className="w-4 h-4 text-[#df2f4a]" />}
              {t.type === "info" && <AlertCircle className="w-4 h-4 text-[#0073ea]" />}
              <span className="font-semibold tracking-wide">{t.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Control Navigation Header */}
      <div className="bg-white border-b border-[#d0d4dc] sticky top-0 z-40 px-6 lg:px-10 py-5 backdrop-blur-lg bg-white/95 shadow-2xs">
        <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-[#676879] uppercase tracking-wider mb-1">
              <span>Master Core</span> / <span>Executive Suite</span> / <span className="text-[#0073ea]">System Diagnostics</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#1c1f23] flex items-center gap-2.5 tracking-tight">
              <div className="w-6 h-6 rounded bg-[#0073ea] flex items-center justify-center text-white font-black text-xs">D</div>
              Dikota High-Fidelity Performance Ecosystem
            </h1>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            <button 
              onClick={resetOperationalDatabase}
              className="bg-white border border-[#c8d0d8] hover:bg-[#f6f7fb] text-[#323338] p-2 rounded-md text-xs font-bold flex items-center gap-2 transition-all shadow-2xs cursor-pointer"
              title="Reset Database to Master Templates"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#676879]"/>
            </button>

            <div className="relative">
              <select 
                value={timePeriod} 
                onChange={(e) => setTimePeriod(e.target.value)}
                className="appearance-none bg-white border border-[#c8d0d8] hover:border-[#676879] rounded-md pl-3 pr-9 py-2 text-xs font-bold text-[#323338] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0073ea]/10 transition-all shadow-2xs"
              >
                <option value="Q1-2026">Term Frame: Q1 View</option>
                <option value="Q2-2026">Term Frame: Q2 Active Ledger</option>
              </select>
              <Calendar className="w-3.5 h-3.5 text-[#676879] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"/>
            </div>

            <button 
              onClick={exportReportsSheet}
              className="bg-[#0073ea] hover:bg-[#0060c4] text-white px-4 py-2 rounded-md text-xs font-bold flex items-center gap-2 transition-all shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5"/> Compile Matrix (.csv)
            </button>
          </div>
        </div>

        {/* Dynamic Analytics Data Matrix Grid */}
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {[
            { label: "Total Asset Allocation", val: `₹${analytics.totalBudget.toLocaleString()}`, sub: "Authorized Cap limits", color: "border-l-[#0073ea]", icon: DollarSign },
            { label: "Aggregated Expenditures", val: `₹${analytics.totalUsed.toLocaleString()}`, sub: `${analytics.burnRate}% Active Overhead utilization`, color: "border-l-purple-500", icon: Layers },
            { label: "Operational Velocity Index", val: `${analytics.avgOutput}%`, sub: "Global output variance mean", color: "border-l-[#00c875]", icon: TrendingUp },
            { label: "Sustained Clusters", val: `${analytics.onTrackCount} / ${reportRecords.length}`, sub: `Workforce parameters: ${analytics.totalHeadcount} Heads`, color: "border-l-[#e2b13c]", icon: Target },
          ].map((card, idx) => (
            <div key={idx} className="bg-white border border-[#e1e4e8] border-l-4 p-4 rounded-xl flex items-center justify-between shadow-3xs bg-white">
              <div>
                <span className="block text-[10px] font-bold text-[#676879] uppercase tracking-wider">{card.label}</span>
                <span className="text-xl font-extrabold text-[#1c1f23] mt-1 block tracking-tight font-mono">{card.val}</span>
                <span className="text-[10px] text-gray-400 mt-1 block font-medium">{card.sub}</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-gray-100 shadow-3xs">
                <card.icon className="w-4 h-4 text-[#676879]" />
              </div>
            </div>
          ))}
        </div>

        {/* Search, Status Filtering, and Advanced Pipeline Controls */}
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-5 pt-3 border-t border-[#f1f3f5]">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input 
                type="text" 
                placeholder="Query nodes by ID, name, or lead coordinator..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-white border border-[#c8d0d8] focus:border-[#0073ea] focus:ring-4 focus:ring-[#0073ea]/5 rounded-md text-xs focus:outline-none w-full transition-all font-medium"
              />
            </div>

            <div className="flex items-center bg-[#f1f3f5] p-1 rounded-md border border-gray-200/40 w-full sm:w-auto overflow-x-auto">
              {["All", "On Track", "At Risk", "Critical"].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${filterStatus === st ? "bg-white text-[#1c1f23] shadow-3xs" : "text-[#676879] hover:text-gray-900"}`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-[#676879] font-bold flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-md self-end md:self-auto">
            <Filter className="w-3.5 h-3.5 text-gray-400" /> Pipeline Scope: {processedReports.length} Nodes Loaded
          </div>
        </div>
      </div>

      {/* Main Core Framework Workspace Container */}
      <div className="p-6 lg:p-10 max-w-[1600px] mx-auto flex flex-col gap-6">
        
        {/* Bulk Control System Panel Header */}
        <AnimatePresence>
          {selectedCount > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              className="bg-[#1c1f23] text-white p-4 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xl overflow-hidden border border-gray-800"
            >
              <div className="flex items-center gap-2 text-xs font-semibold">
                <CheckSquare className="w-4 h-4 text-[#0073ea]" />
                <span>Selected <strong className="text-[#0073ea] font-black font-mono">{selectedCount}</strong> operational structural records</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-bold text-gray-400 mr-1">Batch Actions:</span>
                <button onClick={() => handleBulkStatusChange("On Track")} className="px-2.5 py-1 bg-[#00c875] text-white text-[10px] font-bold rounded hover:bg-[#00b268] transition-all cursor-pointer">Set On Track</button>
                <button onClick={() => handleBulkStatusChange("At Risk")} className="px-2.5 py-1 bg-[#e2b13c] text-white text-[10px] font-bold rounded hover:bg-[#caa035] transition-all cursor-pointer">Set At Risk</button>
                <button onClick={() => handleBulkStatusChange("Critical")} className="px-2.5 py-1 bg-[#df2f4a] text-white text-[10px] font-bold rounded hover:bg-[#c92a42] transition-all cursor-pointer">Set Critical</button>
                <div className="w-[1px] h-4 bg-gray-700 mx-1 hidden sm:block"></div>
                <button onClick={handleBulkDelete} className="px-2.5 py-1 bg-transparent hover:bg-white/10 border border-rose-500/30 text-rose-400 text-[10px] font-bold rounded transition-all flex items-center gap-1 cursor-pointer">
                  <Trash2 className="w-3 h-3"/> Purge Selected
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Master Data Grid Spreadsheet Platform */}
        <div className="bg-white rounded-xl border border-[#d0d4dc] shadow-sm overflow-hidden">
          <div className="bg-[#f6f7fb] border-b border-[#d0d4dc] px-4 py-3 flex items-center gap-2 select-none">
            <ChevronDown className="w-4 h-4 text-[#676879]" />
            <span className="text-xs font-bold text-[#323338] tracking-wider uppercase">Master Relational Ledger Matrix</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed min-w-[1300px]">
              <thead>
                <tr className="bg-white border-b border-[#d0d4dc] text-[10px] font-bold text-[#676879] uppercase tracking-widest select-none h-11">
                  <th className="w-12 text-center border-r border-[#e1e4e8]">
                    <button onClick={toggleSelectAll} className="p-1 text-gray-400 hover:text-[#0073ea] transition-colors cursor-pointer mx-auto block">
                      {processedReports.length > 0 && processedReports.every(r => selectedRowIds[r.id]) ? (
                        <CheckSquare className="w-4 h-4 text-[#0073ea]" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="w-14 text-center border-r border-[#e1e4e8]">Audit</th>
                  
                  {/* Sorting Header Capabilities */}
                  {[
                    { field: "department", label: "Cost Center / Unit", width: "w-80" },
                    { field: "budgetAllocated", label: "Allocated Cap (INR)", width: "w-44" },
                    { field: "budgetUsed", label: "Overhead Disbursed", width: "w-44" },
                    { field: "headcount", label: "Staffing", width: "w-28" },
                    { field: "currentOutput", label: "Velocity Output", width: "w-56" },
                  ].map((col) => (
                    <th 
                      key={col.field}
                      onClick={() => handleSort(col.field as SortField)}
                      className={`${col.width} px-4 border-r border-[#e1e4e8] hover:bg-gray-50 transition-colors cursor-pointer group select-none`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{col.label}</span>
                        <ArrowUpDown className={`w-3 h-3 transition-opacity ${sortField === col.field ? "text-[#0073ea] opacity-100" : "text-gray-300 opacity-0 group-hover:opacity-100"}`} />
                      </div>
                    </th>
                  ))}
                  <th className="text-center w-40">Status Vector</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-[#e1e4e8]">
                {processedReports.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16 bg-gray-50/40">
                      <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Zero System Log Matches Across Specified Pipeline Queries</span>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {processedReports.map((row) => {
                      const isExpanded = !!expandedRows[row.id];
                      const isSelected = !!selectedRowIds[row.id];
                      const burnPercentage = row.budgetAllocated ? Math.round((row.budgetUsed / row.budgetAllocated) * 100) : 0;
                      
                      return (
                        <React.Fragment key={row.id}>
                          <motion.tr 
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className={`group relative h-12 transition-colors ${isSelected ? "bg-[#0073ea]/5 hover:bg-[#0073ea]/10" : "hover:bg-[#f6f7fb]/60"}`}
                          >
                            {/* Checkbox Frame Selector */}
                            <td className="text-center border-r border-[#e1e4e8] bg-white group-hover:bg-transparent transition-colors">
                              <button onClick={() => toggleSelectRow(row.id)} className="p-1 text-gray-400 hover:text-[#0073ea] transition-all cursor-pointer block mx-auto">
                                {isSelected ? <CheckSquare className="w-4 h-4 text-[#0073ea]" /> : <Square className="w-4 h-4 opacity-50 group-hover:opacity-100" />}
                              </button>
                            </td>

                            {/* Dropdown Meta Data Inspector Toggler */}
                            <td className="text-center border-r border-[#e1e4e8] bg-white group-hover:bg-transparent transition-colors">
                              <button 
                                onClick={() => toggleExpandRow(row.id)} 
                                className={`p-1.5 rounded text-gray-400 hover:text-gray-900 transition-all hover:bg-gray-100 cursor-pointer block mx-auto ${isExpanded ? "rotate-180 text-[#0073ea] bg-blue-50" : ""}`}
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                            </td>

                            {/* Main Core Form Input Cell Row Blocks */}
                            <td className="px-3 border-r border-[#e1e4e8] font-semibold text-[#323338] text-xs bg-white group-hover:bg-transparent border-l-4 border-l-[#0073ea]">
                              <div className="flex items-center justify-between w-full">
                                <input 
                                  type="text" 
                                  value={row.department} 
                                  onChange={(e) => updateCell(row.id, "department", e.target.value)}
                                  className="w-full bg-transparent focus:bg-white focus:ring-2 focus:ring-[#0073ea] rounded px-2 py-1 outline-none transition-all font-semibold text-[#323338] text-xs border-none"
                                />
                                <span className="text-[9px] font-mono font-bold text-gray-400 opacity-0 group-hover:opacity-100 px-1">{row.id}</span>
                              </div>
                            </td>

                            <td className="px-3 border-r border-[#e1e4e8]">
                              <div className="flex items-center text-xs font-mono font-bold text-[#323338] bg-transparent rounded focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0073ea] px-1 transition-all">
                                <span className="text-gray-400 font-sans mr-1">₹</span>
                                <input 
                                  type="number" 
                                  value={row.budgetAllocated} 
                                  onChange={(e) => updateCell(row.id, "budgetAllocated", Number(e.target.value))}
                                  className="w-full bg-transparent outline-none py-1 border-none focus:ring-0"
                                />
                              </div>
                            </td>

                            <td className="px-3 border-r border-[#e1e4e8]">
                              <div className="flex items-center text-xs font-mono font-bold text-[#323338] bg-transparent rounded focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0073ea] px-1 transition-all">
                                <span className="text-gray-400 font-sans mr-1">₹</span>
                                <input 
                                  type="number" 
                                  value={row.budgetUsed} 
                                  onChange={(e) => updateCell(row.id, "budgetUsed", Number(e.target.value))}
                                  className={`w-full bg-transparent outline-none py-1 border-none focus:ring-0 ${row.budgetUsed > row.budgetAllocated ? "text-rose-600 font-extrabold" : ""}`}
                                />
                              </div>
                            </td>

                            <td className="px-3 border-r border-[#e1e4e8]">
                              <div className="focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0073ea] rounded px-1 transition-all">
                                <input 
                                  type="number" 
                                  value={row.headcount} 
                                  onChange={(e) => updateCell(row.id, "headcount", Number(e.target.value))}
                                  className="w-full bg-transparent outline-none py-1 font-mono font-bold text-xs text-[#323338] border-none focus:ring-0"
                                />
                              </div>
                            </td>

                            <td className="px-3 border-r border-[#e1e4e8] bg-[#fafbfc]/30">
                              <div className="flex items-center gap-2 w-full focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0073ea] rounded px-1 transition-all">
                                <input 
                                  type="number" 
                                  max="100"
                                  min="0"
                                  value={row.currentOutput} 
                                  onChange={(e) => updateCell(row.id, "currentOutput", Number(e.target.value))}
                                  className="w-9 bg-transparent outline-none py-1 font-mono font-bold text-xs text-right text-gray-900 border-none focus:ring-0"
                                />
                                <span className="text-gray-400 text-[10px] font-bold">%</span>
                                <div className="w-full bg-gray-200/70 h-1.5 rounded-sm overflow-hidden ml-1">
                                  <motion.div 
                                    className={`h-full ${row.status === 'Critical' ? 'bg-[#df2f4a]' : row.status === 'At Risk' ? 'bg-[#e2b13c]' : 'bg-[#00c875]'}`}
                                    animate={{ width: `${Math.min(100, Math.max(0, row.currentOutput))}%` }}
                                    transition={{ duration: 0.15 }}
                                  />
                                </div>
                              </div>
                            </td>

                            {/* Dropdown System Interface Selector Cells */}
                            <td className={`p-0 text-center transition-all relative h-full ${statusConfig[row.status].bg} border-b border-[#e1e4e8]/40`}>
                              <div className="w-full h-full flex items-center justify-center relative">
                                <select
                                  value={row.status}
                                  onChange={(e) => updateCell(row.id, "status", e.target.value)}
                                  className="w-full h-full absolute inset-0 appearance-none bg-transparent text-center font-extrabold text-[11px] text-white outline-none cursor-pointer tracking-wider uppercase z-10 py-1 border-none focus:ring-0"
                                >
                                  <option value="On Track" className="text-gray-900 bg-white font-bold">ON TRACK</option>
                                  <option value="At Risk" className="text-gray-900 bg-white font-bold">AT RISK</option>
                                  <option value="Critical" className="text-gray-900 bg-white font-bold">CRITICAL</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/70 z-20">
                                  <ChevronDown className="w-3.5 h-3.5" />
                                </div>
                              </div>
                            </td>
                          </motion.tr>

                          {/* Expanded Architectural Meta Data Sub-Panel */}
                          <AnimatePresence>
                            {isExpanded && (
                              <tr className="bg-gray-50/70">
                                <td colSpan={8} className="p-0 border-b border-[#e1e4e8]">
                                  <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="px-14 py-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[#676879] border-l-4 border-l-slate-400 bg-linear-to-r from-gray-50 to-white"
                                  >
                                    <div className="space-y-1.5">
                                      <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Governance & Leadership</span>
                                      <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-900 text-sm">Lead Coordinator:</span>
                                        <input 
                                          type="text" 
                                          value={row.manager} 
                                          onChange={(e) => updateCell(row.id, "manager", e.target.value)}
                                          className="bg-white border border-gray-200 focus:border-[#0073ea] rounded px-2 py-0.5 outline-none font-medium text-gray-800"
                                        />
                                      </div>
                                      <div className="text-[11px] text-gray-400">Initialization Stamp: {row.startDate}</div>
                                    </div>

                                    <div className="space-y-1">
                                      <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Financial Disbursal Analytics</span>
                                      <div className="flex items-center justify-between max-w-xs pt-1">
                                        <span>Capital Burn Rate Velocity:</span>
                                        <span className={`font-mono font-bold ${burnPercentage > 90 ? "text-rose-600" : "text-gray-900"}`}>{burnPercentage}%</span>
                                      </div>
                                      <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden max-w-xs">
                                        <div className={`h-full ${burnPercentage > 90 ? "bg-rose-500" : "bg-purple-500"}`} style={{ width: `${Math.min(100, burnPercentage)}%` }}></div>
                                      </div>
                                    </div>

                                    <div className="flex flex-col justify-center items-start md:items-end gap-2">
                                      <button 
                                        onClick={() => deleteRow(row.id, row.department)}
                                        className="text-xs font-bold text-rose-600 hover:text-white border border-rose-200 hover:bg-rose-600 px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 bg-white cursor-pointer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" /> Purge Matrix Node
                                      </button>
                                    </div>
                                  </motion.div>
                                </td>
                              </tr>
                            )}
                          </AnimatePresence>
                        </React.Fragment>
                      );
                    })}
                  </AnimatePresence>
                )}

                {/* Submitting Interface Block for Row Injections */}
                <tr className="bg-[#fafbfc] border-t border-[#d0d4dc]">
                  <td colSpan={2} className="text-center border-r border-[#e1e4e8] bg-gray-50/50">
                    <div className="w-full h-full flex items-center justify-center py-2">
                      <Plus className="w-4 h-4 text-[#0073ea]" />
                    </div>
                  </td>
                  <td colSpan={6} className="p-3">
                    <form onSubmit={handleAddNewRow} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <input 
                        type="text"
                        placeholder="New Department / Structural Node..."
                        value={newDept}
                        onChange={(e) => setNewDept(e.target.value)}
                        className="bg-white border border-[#c8d0d8] focus:border-[#0073ea] focus:ring-2 focus:ring-[#0073ea]/10 rounded-md text-xs px-3 py-1.5 outline-none font-medium"
                      />
                      <input 
                        type="text"
                        placeholder="Assigned Lead Manager..."
                        value={newManager}
                        onChange={(e) => setNewManager(e.target.value)}
                        className="bg-white border border-[#c8d0d8] focus:border-[#0073ea] focus:ring-2 focus:ring-[#0073ea]/10 rounded-md text-xs px-3 py-1.5 outline-none font-medium"
                      />
                      <div className="flex items-center bg-white border border-[#c8d0d8] focus-within:border-[#0073ea] focus-within:ring-2 focus-within:ring-[#0073ea]/10 rounded-md px-2 text-xs text-gray-400">
                        <span>₹</span>
                        <input 
                          type="number"
                          placeholder="Allocated Cap"
                          value={newBudget || ""}
                          onChange={(e) => setNewBudget(Number(e.target.value))}
                          className="w-full bg-transparent border-none outline-none py-1 px-1 font-medium text-gray-800 focus:ring-0"
                        />
                      </div>
                      <button 
                        type="submit"
                        className="bg-white hover:bg-gray-50 text-[#0073ea] border border-[#0073ea]/30 font-bold text-xs rounded-md py-1.5 px-4 transition-all shadow-3xs cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Inject Unit Node
                      </button>
                    </form>
                  </td>
                </tr>

                {/* Aggregated Spreadsheet Ledger Footer Control */}
                {reportRecords.length > 0 && (
                  <tr className="bg-[#f6f7fb] text-xs font-bold text-[#1c1f23] select-none h-12 border-t-2 border-[#d0d4dc]">
                    <td className="border-r border-[#e1e4e8]" colSpan={2}></td>
                    <td className="px-4 border-r border-[#e1e4e8] text-right font-bold text-[11px] text-[#676879] uppercase tracking-wider">Global Summary</td>
                    <td className="px-4 border-r border-[#e1e4e8] font-mono text-xs text-gray-900 font-bold">₹{analytics.totalBudget.toLocaleString()}</td>
                    <td className="px-4 border-r border-[#e1e4e8] font-mono text-xs text-gray-900 font-bold">₹{analytics.totalUsed.toLocaleString()}</td>
                    <td className="px-4 border-r border-[#e1e4e8] font-mono text-xs text-gray-900 font-bold">{analytics.totalHeadcount}</td>
                    <td className="px-4 border-r border-[#e1e4e8] font-mono text-xs text-[#0073ea] font-extrabold">Mean Efficiency: {analytics.avgOutput}%</td>
                    <td className="bg-white"></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}