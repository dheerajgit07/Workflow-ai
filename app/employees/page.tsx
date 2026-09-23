"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Briefcase, Search, UserPlus, SlidersHorizontal, 
  Mail, Phone, MapPin, Calendar, Grid, List, 
  Trash2, Edit3, ChevronDown, AlertCircle, X,
  Download, Users, ArrowUpDown, DollarSign, Percent
} from "lucide-react";

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: "Engineering" | "Design" | "Marketing" | "HR" | "Finance";
  status: "Active" | "On Leave" | "Remote";
  joinDate: string;
  location: string;
  salary: number;
}

const INITIAL_EMPLOYEES: Employee[] = [
  { id: "EMP-101", name: "Vikram Malhotra", email: "v.malhotra@workflow.ai", phone: "+91 98765 43210", role: "Principal Engineer", department: "Engineering", status: "Active", joinDate: "2023-04-12", location: "Bangalore, IN", salary: 145000 },
  { id: "EMP-102", name: "Ananya Iyer", email: "a.iyer@workflow.ai", phone: "+91 98123 45678", role: "UI/UX Lead", department: "Design", status: "Active", joinDate: "2024-01-15", location: "Mumbai, IN", salary: 115000 },
  { id: "EMP-103", name: "Kabir Singh", email: "k.singh@workflow.ai", phone: "+91 99988 77766", role: "DevOps Architect", department: "Engineering", status: "Remote", joinDate: "2022-11-01", location: "Delhi, IN", salary: 130000 },
  { id: "EMP-104", name: "Meera Nair", email: "m.nair@workflow.ai", phone: "+91 95554 33221", role: "HR Director", department: "HR", status: "On Leave", joinDate: "2021-06-20", location: "Pune, IN", salary: 95000 },
  { id: "EMP-105", name: "Rohan Kapoor", email: "r.kapoor@workflow.ai", phone: "+91 94445 55667", role: "Growth Marketer", department: "Marketing", status: "Active", joinDate: "2024-03-01", location: "Remote", salary: 88000 }
];

export default function EmployeesPage() {
  // Persistent State Engine
  const [employees, setEmployees] = useState<Employee[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("workflow_employees");
      return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
    }
    return INITIAL_EMPLOYEES;
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [sortBy, setSortBy] = useState<keyof Employee>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  
  const [formData, setFormData] = useState<Omit<Employee, "id">>({
    name: "", email: "", phone: "", role: "",
    department: "Engineering", status: "Active",
    joinDate: new Date().toISOString().split("T")[0], location: "", salary: 60000
  });

  const departments = ["Engineering", "Design", "Marketing", "HR", "Finance"];
  const statuses = ["Active", "On Leave", "Remote"];

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem("workflow_employees", JSON.stringify(employees));
  }, [employees]);

  // Real-Time Analytics Calculations
  const stats = useMemo(() => {
    const total = employees.length;
    const active = employees.filter(e => e.status === "Active").length;
    const remote = employees.filter(e => e.status === "Remote").length;
    const avgSalary = total ? Math.round(employees.reduce((acc, curr) => acc + curr.salary, 0) / total) : 0;
    return { total, active, remote, avgSalary };
  }, [employees]);

  // Sorting & Filtering Pipeline
  const filteredEmployees = useMemo(() => {
    return employees
      .filter(emp => {
        const matchesSearch = 
          emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.id.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch && (selectedDept === "All" || emp.department === selectedDept) && (selectedStatus === "All" || emp.status === selectedStatus);
      })
      .sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];
        if (typeof valA === "string") {
          return sortOrder === "asc" ? valA.localeCompare(valB as string) : (valB as string).localeCompare(valA);
        }
        return sortOrder === "asc" ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
      });
  }, [employees, searchTerm, selectedDept, selectedStatus, sortBy, sortOrder]);

  const toggleSort = (field: keyof Employee) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // CSV Data Exporter Functionality
  const exportToCSV = () => {
    const headers = ["Employee ID,Name,Email,Phone,Role,Department,Status,Join Date,Location,Salary\n"];
    const rows = filteredEmployees.map(e => `${e.id},${e.name},${e.email},${e.phone},${e.role},${e.department},${e.status},${e.joinDate},${e.location},${e.salary}`);
    const csvContent = headers.join("") + rows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `WorkForce_Report_${new Date().toISOString().split("T")[0]}.csv`);
    a.click();
  };

  const updateInlineField = (id: string, field: keyof Employee, value: any) => {
    setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, [field]: value } : emp));
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to offboard this record?")) {
      setEmployees(prev => prev.filter(emp => emp.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEmployee) {
      setEmployees(prev => prev.map(emp => emp.id === editingEmployee.id ? { ...emp, ...formData, salary: Number(formData.salary) } : emp));
    } else {
      const newId = `EMP-${Math.floor(100 + Math.random() * 900)}`;
      setEmployees(prev => [{ ...formData, id: newId, salary: Number(formData.salary) }, ...prev]);
    }
    closeModal();
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({ ...emp });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
    setFormData({
      name: "", email: "", phone: "", role: "",
      department: "Engineering", status: "Active",
      joinDate: new Date().toISOString().split("T")[0], location: "", salary: 60000
    });
  };

  const statusColors: Record<Employee["status"], string> = {
    Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    "On Leave": "bg-amber-50 text-amber-700 border-amber-200",
    Remote: "bg-blue-50 text-blue-700 border-blue-200"
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] text-[#333333] font-sans antialiased selection:bg-[#0073ea]/20">
      
      {/* ─── WORKSPACE HEADER ─── */}
      <div className="bg-white border-b border-[#e1e4e8] px-8 py-5">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
              <span>Hiring & Roster</span> / <span>Internal Directory</span>
            </div>
            <h1 className="text-2xl font-bold text-[#1c1f23] flex items-center gap-2.5 tracking-tight">
              <Briefcase className="w-6 h-6 text-[#0073ea]"/> Staff Directory
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button 
              onClick={exportToCSV}
              className="bg-white hover:bg-gray-50 text-gray-700 border border-[#c8d0d8] px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4 text-gray-500"/> Export CSV
            </button>
            <button 
              onClick={() => { closeModal(); setIsModalOpen(true); }}
              className="bg-[#0073ea] hover:bg-[#0060c4] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all active:scale-[0.98] shadow-sm shadow-blue-500/10 cursor-pointer"
            >
              <UserPlus className="w-4 h-4"/> Add Employee
            </button>
          </div>
        </div>

        {/* ─── ANALYTICS INFRASTRUCTURE WIDGETS ─── */}
        <div className="max-w-[1600px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {[
            { label: "Total Headcount", val: stats.total, icon: Users, color: "text-blue-600" },
            { label: "Active Nodes", val: stats.active, icon: Briefcase, color: "text-emerald-600" },
            { label: "Remote Allocation", val: stats.remote, icon: MapPin, color: "text-indigo-600" },
            { label: "Avg Financial Weight", val: `₹${stats.avgSalary.toLocaleString()}`, icon: DollarSign, color: "text-purple-600" }
          ].map((card, idx) => (
            <div key={idx} className="bg-[#f8f9fa] border border-[#e1e4e8] p-4 rounded-xl flex items-center justify-between shadow-2xs">
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">{card.label}</span>
                <span className="text-xl font-bold text-gray-900 mt-1 block">{card.val}</span>
              </div>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
          ))}
        </div>

        {/* ─── CONTROLS AND FILTERS BAR ─── */}
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-[#f1f3f5]">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input 
                type="text" 
                placeholder="Search database..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-white border border-[#c8d0d8] focus:border-[#0073ea] rounded-md text-xs focus:outline-none w-64 transition-all"
              />
            </div>

            <div className="relative">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="appearance-none bg-white border border-[#c8d0d8] rounded-md pl-3 pr-8 py-1.5 text-xs font-medium text-gray-700 focus:outline-none focus:border-[#0073ea] cursor-pointer"
              >
                <option value="All">All Departments</option>
                {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
              </select>
              <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"/>
            </div>

            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="appearance-none bg-white border border-[#c8d0d8] rounded-md pl-3 pr-8 py-1.5 text-xs font-medium text-gray-700 focus:outline-none focus:border-[#0073ea] cursor-pointer"
              >
                <option value="All">All Statuses</option>
                {statuses.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"/>
            </div>
          </div>

          <div className="flex items-center gap-2 border border-[#e1e4e8] bg-gray-50 p-0.5 rounded-lg">
            <button 
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${viewMode === "table" ? "bg-white text-[#0073ea] shadow-xs" : "text-gray-400 hover:text-gray-600"}`}
            >
              <List className="w-4 h-4"/>
            </button>
            <button 
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${viewMode === "grid" ? "bg-white text-[#0073ea] shadow-xs" : "text-gray-400 hover:text-gray-600"}`}
            >
              <Grid className="w-4 h-4"/>
            </button>
          </div>
        </div>
      </div>

      {/* ─── DATA RENDERING SHEET WITH ANIMATIONS ─── */}
      <div className="p-8 max-w-[1600px] mx-auto">
        <AnimatePresence mode="wait">
          {filteredEmployees.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-xl border border-[#e1e4e8] p-16 text-center shadow-xs"
            >
              <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-3"/>
              <p className="text-sm font-medium text-gray-500">No active operational records match your filtration matrix.</p>
            </motion.div>
          ) : viewMode === "table" ? (
            
            /* TYPE A: ENTERPRISE SPREADSHEET VIEW */
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-xl border border-[#e1e4e8] shadow-xs overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f8f9fa] border-b border-[#e1e4e8] text-[11px] font-bold text-gray-500 uppercase tracking-wider select-none">
                      <th className="py-3 px-4 w-12 cursor-pointer" onClick={() => toggleSort("id")}>ID <ArrowUpDown className="w-3 h-3 inline ml-0.5" /></th>
                      <th className="py-3 px-4 cursor-pointer" onClick={() => toggleSort("name")}>Employee <ArrowUpDown className="w-3 h-3 inline ml-0.5" /></th>
                      <th className="py-3 px-4">Core Department</th>
                      <th className="py-3 px-4">Operational Role</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 cursor-pointer" onClick={() => toggleSort("salary")}>Budget <ArrowUpDown className="w-3 h-3 inline ml-0.5" /></th>
                      <th className="py-3 px-4">Timeline</th>
                      <th className="py-3 px-4 text-right pr-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f3f5]">
                    {filteredEmployees.map((emp) => (
                      <motion.tr 
                        layout
                        key={emp.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="hover:bg-[#f8fafc]/80 transition-all group relative duration-150"
                      >
                        <td className="py-3.5 px-4 text-xs font-mono font-bold text-gray-400">{emp.id}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-gray-100 text-[#1c1f23] font-bold text-xs flex items-center justify-center border border-[#e1e4e8] shrink-0">
                              {emp.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                            </div>
                            <div className="max-w-[220px]">
                              <span className="block font-semibold text-gray-900 truncate">{emp.name}</span>
                              <span className="block text-[11px] text-gray-400 truncate mt-0.5">{emp.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <select
                            value={emp.department}
                            onChange={(e) => updateInlineField(emp.id, "department", e.target.value)}
                            className="bg-transparent text-xs font-bold text-gray-700 focus:outline-none cursor-pointer py-1 rounded hover:bg-gray-100/70"
                          >
                            {departments.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </td>
                        <td className="py-3.5 px-4 text-xs font-medium text-gray-700">{emp.role}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex justify-center">
                            <select
                              value={emp.status}
                              onChange={(e) => updateInlineField(emp.id, "status", e.target.value)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border cursor-pointer text-center ${statusColors[emp.status]} transition-all`}
                            >
                              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs font-semibold text-gray-800">₹{emp.salary.toLocaleString()}</td>
                        <td className="py-3.5 px-4 text-xs font-mono text-gray-400">{emp.joinDate}</td>
                        <td className="py-3.5 px-4 text-right pr-6">
                          <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-150 transform translate-x-2 group-hover:translate-x-0">
                            <button onClick={() => openEditModal(emp)} className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md cursor-pointer"><Edit3 className="w-3.5 h-3.5"/></button>
                            <button onClick={() => handleDelete(emp.id)} className="p-1.5 text-gray-300 hover:text-rose-600 hover:bg-rose-50 rounded-md cursor-pointer"><Trash2 className="w-3.5 h-3.5"/></button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ) : (
            
            /* TYPE B: INTUATIVE GRID HUB VIEW */
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredEmployees.map((emp) => (
                <motion.div 
                  layout
                  key={emp.id}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="bg-white border border-[#e1e4e8] rounded-xl p-5 hover:border-[#0073ea] hover:shadow-md transition-all relative group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gray-50 border border-[#e1e4e8] rounded-xl font-bold text-sm text-gray-800 flex items-center justify-center">
                        {emp.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 group-hover:text-[#0073ea] transition-colors">{emp.name}</h3>
                        <p className="text-xs text-gray-400 font-medium">{emp.role}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${statusColors[emp.status]}`}>
                      {emp.status}
                    </span>
                  </div>

                  <div className="mt-5 space-y-2 pt-4 border-t border-[#f1f3f5] text-xs text-gray-600">
                    <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-gray-400"/> <span className="truncate">{emp.email}</span></div>
                    <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-gray-400"/> <span>{emp.phone}</span></div>
                    <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-gray-400"/> <span>{emp.location}</span></div>
                    <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-gray-400"/> <span>Budget Allocation: ₹{emp.salary.toLocaleString()}</span></div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#f1f3f5] flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">{emp.department}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEditModal(emp)} className="p-1 text-gray-400 hover:text-gray-800 rounded-md cursor-pointer"><Edit3 className="w-3.5 h-3.5"/></button>
                      <button onClick={() => handleDelete(emp.id)} className="p-1 text-gray-300 hover:text-rose-600 rounded-md cursor-pointer"><Trash2 className="w-3.5 h-3.5"/></button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── MODAL DRAW DIALOG WITH FLUID SLIDE ANIMATION ─── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-gray-200 overflow-hidden relative z-10"
            >
              <div className="bg-[#f8f9fa] border-b border-[#e1e4e8] px-6 py-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#1c1f23]">
                  {editingEmployee ? "Modify Staff Core Metrics" : "Onboard New Internal Node"}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-4 h-4"/></button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Full Resource Name</label>
                    <input type="text" required placeholder="John Doe" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border border-[#c8d0d8] focus:border-[#0073ea] rounded-lg px-3 py-2 text-xs focus:outline-none"/>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Corporate Email</label>
                    <input type="email" required placeholder="name@company.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full border border-[#c8d0d8] focus:border-[#0073ea] rounded-lg px-3 py-2 text-xs focus:outline-none"/>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Phone Number</label>
                    <input type="text" required placeholder="+91 99999 XXXXX" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full border border-[#c8d0d8] focus:border-[#0073ea] rounded-lg px-3 py-2 text-xs focus:outline-none"/>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Designation Role</label>
                    <input type="text" required placeholder="Senior Engineer" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full border border-[#c8d0d8] focus:border-[#0073ea] rounded-lg px-3 py-2 text-xs focus:outline-none"/>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Salary Component (INR)</label>
                    <input type="number" required placeholder="80000" value={formData.salary} onChange={(e) => setFormData({...formData, salary: Number(e.target.value)})} className="w-full border border-[#c8d0d8] focus:border-[#0073ea] rounded-lg px-3 py-2 text-xs focus:outline-none"/>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">HQ Location Node</label>
                    <input type="text" required placeholder="Bangalore, IN" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full border border-[#c8d0d8] focus:border-[#0073ea] rounded-lg px-3 py-2 text-xs focus:outline-none"/>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Department Cluster</label>
                    <select value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value as any})} className="w-full border border-[#c8d0d8] focus:border-[#0073ea] rounded-lg px-3 py-2 text-xs bg-white text-gray-700 focus:outline-none">
                      {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Roster Status</label>
                    <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as any})} className="w-full border border-[#c8d0d8] focus:border-[#0073ea] rounded-lg px-3 py-2 text-xs bg-white text-gray-700 focus:outline-none">
                      {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#f1f3f5] mt-6">
                  <button type="button" onClick={closeModal} className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg cursor-pointer">Cancel</button>
                  <button type="submit" className="px-4 py-2 text-xs font-bold bg-[#0073ea] hover:bg-[#0060c4] text-white rounded-lg cursor-pointer">Commit Node</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}