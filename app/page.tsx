"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
    Plus, Trash2, Calendar, CheckCircle, Clock, ChevronDown,
    X, Home, Users, CreditCard, Ticket,
    FileText, Edit2, UserCheck,
    ArrowLeft, MessageSquare, Send, Activity, Kanban
} from "lucide-react";

interface Log {
    id: number;
    text: string;
    time: string;
}

interface TicketType {
    id: number | string;
    _id?: string;
    name: string;
    status: string;
    owner: string;
    date: string;
    group: string;
    description: string;
    logs: Log[];
}

interface MemberType {
    id: number;
    name: string;
    role: string;
    initial: string;
    color: string;
}

interface GroupContainerProps {
    title: string;
    count: number;
    tasks: TicketType[];
    color: string;
    availableMembers: MemberType[];
    onRowSelect: (id: any) => void;
    onToggle: (id: any) => void;
    onDelete: (id: any) => void;
    editingTaskId: any;
    editNameValue: string;
    setEditNameValue: (val: string) => void;
    startEditing: (id: any, name: string) => void;
    saveInlineUpdate: (id: any) => void;
    onOwnerChange: (id: any, val: string) => void;
    onDateChange: (id: any, val: string) => void;
}

export default function ServiceAgentWorkspace() {
    const { authenticated, loading: authLoading } = useAuth();
    const router = useRouter();

    const [tickets, setTickets] = useState<TicketType[]>([]);
    const [apiLoading, setApiLoading] = useState(true);
    const [currentView, setCurrentView] = useState<"workspace" | "ticket-detail">("workspace");
    const [activeTicketId, setActiveTicketId] = useState<any>(null);

    const [showMembersModal, setShowMembersModal] = useState(false);
    const [showAddTaskModal, setShowAddTaskModal] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState<any>(null);
    const [editNameValue, setEditNameValue] = useState("");
    const [newComment, setNewComment] = useState("");

    const [members] = useState<MemberType[]>([
        { id: 1, name: "Aman Sharma", role: "Admin/Agent", initial: "AS", color: "bg-indigo-500" },
        { id: 2, name: "Rahul Verma", role: "Collaborator", initial: "RV", color: "bg-emerald-500" },
        { id: 3, name: "Priya Patel", role: "Agent", initial: "PP", color: "bg-pink-500" },
    ]);

    const [newTicket, setNewTicket] = useState({ name: "", owner: "Aman Sharma", date: "" });

    // 🔄 API से डेटा लोड करने का फंक्शन (GET)
    const fetchTickets = async () => {
        try {
            setApiLoading(true);
            const res = await fetch("/api/tickets");
            if (res.ok) {
                const data = await res.json();
                setTickets(data);
            }
        } catch (err) {
            console.error("Failed to load tickets from API:", err);
        } finally {
            setApiLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && !authenticated) {
            router.replace("/login");
        } else if (authenticated) {
            fetchTickets();
        }
    }, [authenticated, authLoading, router]);

    const activeTicket = tickets.find(t => t.id === activeTicketId || t._id === (activeTicketId as any));

    // ➕ नया टिकट डेप्लॉय करना (POST)
    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTicket.name || !newTicket.date) return;

        try {
            const res = await fetch("/api/tickets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newTicket.name,
                    owner: newTicket.owner,
                    date: newTicket.date,
                    description: "No custom diagnostic info configured yet. Update details internally.",
                    status: "In Progress",
                    group: "active"
                })
            });
            if (res.ok) {
                fetchTickets();
                setNewTicket({ name: "", owner: "Aman Sharma", date: "" });
                setShowAddTaskModal(false);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // ❌ टिकट डिलीट करना (DELETE)
    const handleDeleteTicket = async (id: any) => {
        try {
            const res = await fetch(`/api/tickets/${id}`, { method: "DELETE" });
            if (res.ok) {
                setTickets(prev => prev.filter(t => t.id !== id && t._id !== id));
                if (activeTicketId === id) setActiveTicketId(null);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // 🔄 स्टेटस टॉगल अपडेट (PUT)
    const handleToggleStatus = async (id: any) => {
        const target = tickets.find(t => t.id === id || t._id === id);
        if (!target) return;

        const isDone = target.status === "Done";
        const payload = {
            status: isDone ? "In Progress" : "Done",
            group: isDone ? "active" : "done"
        };

        try {
            const res = await fetch(`/api/tickets/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (res.ok) fetchTickets();
        } catch (err) {
            console.error(err);
        }
    };

    // ✏️ इनलाइन नाम एडिट करना (PUT)
    const saveInlineUpdate = async (id: any) => {
        if (!editNameValue.trim()) return;
        try {
            const res = await fetch(`/api/tickets/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: editNameValue })
            });
            if (res.ok) {
                fetchTickets();
                setEditingTaskId(null);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // 👤 ओनर चेंज ड्रॉपडाउन (PUT)
    const handleOwnerChange = async (id: any, newOwner: string) => {
        try {
            const res = await fetch(`/api/tickets/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ owner: newOwner })
            });
            if (res.ok) fetchTickets();
        } catch (err) {
            console.error(err);
        }
    };

    // 📅 टाइमलाइन डेट चेंज (PUT)
    const handleDateChange = async (id: any, newDate: string) => {
        try {
            const res = await fetch(`/api/tickets/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date: newDate })
            });
            if (res.ok) fetchTickets();
        } catch (err) {
            console.error(err);
        }
    };

    // 💬 कमेंट्स लॉग्स ऐड करना (PUT)
    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !activeTicketId || !activeTicket) return;

        try {
            const res = await fetch(`/api/tickets/${activeTicketId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newComment })
            });
            if (res.ok) {
                fetchTickets();
                setNewComment("");
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (authLoading || apiLoading) {
        return (
            <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-50">
                <div className="flex items-center gap-2">
                    <span className="h-3 w-3 animate-bounce rounded-full bg-blue-600 delay-100"></span>
                    <span className="h-3 w-3 animate-bounce rounded-full bg-indigo-600 delay-200"></span>
                    <span className="h-3 w-3 animate-bounce rounded-full bg-violet-600 delay-300"></span>
                </div>
                <p className="mt-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Syncing Matrix Hub...</p>
            </div>
        );
    }

    if (currentView === "workspace") {
        return (
            <div className="flex h-screen w-full bg-[#f8f9fa] text-gray-800 antialiased overflow-hidden">
                <aside className="w-[290px] bg-white border-r border-gray-200 flex flex-col justify-between shadow-sm z-10 select-none">
                    <div className="p-5 flex-1 overflow-y-auto space-y-7 [&::-webkit-scrollbar]:hidden">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="h-11 w-11 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md">S</div>
                                <div>
                                    <h2 className="font-bold text-gray-900 text-[15px] tracking-tight">Service Agent</h2>
                                    <p className="text-[11px] text-gray-400 font-medium uppercase mt-0.5 tracking-wider">Workspace OS</p>
                                </div>
                            </div>
                            <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"><Home className="h-4 w-4" /></button>
                        </div>
                        <div>
                            <button onClick={() => setShowMembersModal(true)} className="flex items-center justify-between w-full p-3 bg-indigo-50/60 border border-indigo-100/50 rounded-xl cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <Users className="h-4 w-4 text-indigo-600" />
                                    <span className="text-[13px] font-semibold text-indigo-950">Workspace Members</span>
                                </div>
                                <span className="bg-indigo-200/60 text-indigo-800 text-[11px] font-bold px-2 py-0.5 rounded-full">{members.length}</span>
                            </button>
                        </div>
                        <div className="space-y-1">
                            <h3 className="px-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Metrics</h3>
                            <div className="flex items-center justify-between p-2.5 hover:bg-gray-50 rounded-lg text-[13px] text-gray-600">
                                <div className="flex items-center gap-2.5"><Ticket className="h-4 w-4 text-sky-500" /><span>Active Tickets</span></div>
                                <span className="font-bold text-gray-900 text-xs">{tickets.filter(t => t.group === 'active').length}</span>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 border-t bg-gray-50/50">
                        <button onClick={() => alert("View Billing...")} className="flex items-center gap-3 w-full px-3 py-2 text-[13px] text-gray-600 hover:bg-white rounded-lg border border-transparent hover:border-gray-100"><CreditCard className="h-4 w-4 text-gray-400" /><span>View Billing</span></button>
                    </div>
                </aside>

                <main className="flex-1 px-8 pt-4 pb-8 overflow-y-auto flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Service Board Operations</h1>
                            <p className="text-xs text-gray-500 mt-0.5">📌 <b>Click on any Ticket row</b> to instantly open its dedicated parameters detail page.</p>
                        </div>
                        <button onClick={() => setShowAddTaskModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl shadow-md"><Plus className="h-4 w-4" /> Add Service Ticket</button>
                    </div>
                    
                    <div className="space-y-8 flex-1">
                        <GroupContainer
                            title="ACTIVE INCIDENTS"
                            count={tickets.filter(t => t.group === 'active').length}
                            tasks={tickets.filter(t => t.group === 'active')}
                            color="border-l-blue-500"
                            availableMembers={members}
                            onRowSelect={(id: any) => { setActiveTicketId(id); setCurrentView("ticket-detail"); }}
                            onToggle={handleToggleStatus}
                            onDelete={handleDeleteTicket}
                            editingTaskId={editingTaskId}
                            editNameValue={editNameValue}
                            setEditNameValue={setEditNameValue}
                            startEditing={(id: any, name: string) => { setEditingTaskId(id); setEditNameValue(name); }}
                            saveInlineUpdate={saveInlineUpdate}
                            onOwnerChange={handleOwnerChange}
                            onDateChange={handleDateChange}
                        />
                        <GroupContainer
                            title="RESOLVED TICKETS"
                            count={tickets.filter(t => t.group === 'done').length}
                            tasks={tickets.filter(t => t.group === 'done')}
                            color="border-l-emerald-500"
                            availableMembers={members}
                            onRowSelect={(id: any) => { setActiveTicketId(id); setCurrentView("ticket-detail"); }}
                            onToggle={handleToggleStatus}
                            onDelete={handleDeleteTicket}
                            editingTaskId={editingTaskId}
                            editNameValue={editNameValue}
                            setEditNameValue={setEditNameValue}
                            startEditing={(id: any, name: string) => { setEditingTaskId(id); setEditNameValue(name); }}
                            saveInlineUpdate={saveInlineUpdate}
                            onOwnerChange={handleOwnerChange}
                            onDateChange={handleDateChange}
                        />
                    </div>
                </main>

                {showMembersModal && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-2xl w-[420px] shadow-2xl relative">
                            <button onClick={() => setShowMembersModal(false)} className="absolute top-4 right-4 text-gray-400"><X className="h-5 w-5" /></button>
                            <h2 className="font-bold text-lg">Members of Service</h2>
                            <div className="mt-4 space-y-2">
                                {members.map(m => (
                                    <div key={m.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl">
                                        <div className={`h-8 w-8 ${m.color} text-white font-bold text-xs rounded-lg flex items-center justify-center`}>{m.initial}</div>
                                        <div><p className="text-sm font-semibold">{m.name}</p><p className="text-[11px] text-gray-400">{m.role}</p></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {showAddTaskModal && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                        <form onSubmit={handleCreateTicket} className="bg-white p-6 rounded-2xl w-[400px] shadow-2xl space-y-4">
                            <div className="flex justify-between items-center border-b pb-2">
                                <h2 className="font-bold text-md">Deploy Ticket Module</h2>
                                <button type="button" onClick={() => setShowAddTaskModal(false)} className="text-gray-400"><X className="h-5 w-5" /></button>
                            </div>
                            <input type="text" required placeholder="Issue description parameter..." className="w-full p-2 border rounded-lg text-sm bg-white text-gray-800" value={newTicket.name} onChange={(e) => setNewTicket({ ...newTicket, name: e.target.value })} />
                            <input type="date" required className="w-full p-2 border rounded-lg text-sm bg-white text-gray-800" value={newTicket.date} onChange={(e) => setNewTicket({ ...newTicket, date: e.target.value })} />
                            <button type="submit" className="w-full py-2 bg-blue-600 text-white font-bold rounded-xl text-xs">Deploy Ticket</button>
                        </form>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-[#f8f9fa] text-gray-800 antialiased p-8 flex justify-center items-center">
            <div className="max-w-4xl w-full bg-white border border-gray-200 rounded-3xl shadow-2xl flex flex-col h-[85vh] overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-slate-50/60 flex items-center justify-between">
                    <button onClick={() => setCurrentView("workspace")} className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-indigo-600 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-2xs transition-all">
                        <ArrowLeft className="h-4 w-4" /> Back to Master Workspace
                    </button>
                    <div className="flex items-center gap-3 text-xs text-gray-400 font-bold">
                        <Kanban className="h-4 w-4 text-blue-500" />
                        <span>TICKET HUB : #{activeTicket?.id}</span>
                    </div>
                </div>

                <div className="p-8 flex-1 overflow-y-auto space-y-6">
                    {activeTicket ? (
                        <>
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase rounded-md border ${activeTicket.status === 'Done' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                        {activeTicket.status}
                                    </span>
                                    <span className="text-xs text-gray-400 font-medium">Assigned Operational Agent: <b className="text-gray-700">{activeTicket.owner}</b></span>
                                    <span className="text-xs text-gray-400 font-medium ml-auto">Target: <b className="text-gray-700">{activeTicket.date}</b></span>
                                </div>
                                <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-snug">{activeTicket.name}</h1>
                            </div>
                            
                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                    <Activity className="h-3.5 w-3.5 text-blue-600" /> Diagnostic Logs & Description
                                </h3>
                                <p className="text-sm text-gray-600 leading-relaxed">{activeTicket.description}</p>
                            </div>
                            
                            <hr className="border-gray-100" />
                            
                            <div className="space-y-4">
                                <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4 text-indigo-500" /> Communications ({activeTicket.logs.length})
                                </h3>
                                
                                <form onSubmit={handleAddComment} className="flex gap-2">
                                    <input type="text" placeholder="Log internal working context..." className="flex-1 text-xs border border-gray-200 p-3 rounded-xl outline-none focus:border-blue-500 bg-gray-50/50" value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 px-4 rounded-xl text-white font-bold text-xs flex items-center gap-1.5">
                                        <Send className="h-3.5 w-3.5" /> Log Update
                                    </button>
                                </form>

                                <div className="space-y-2 pt-2">
                                    {activeTicket.logs.map(log => (
                                        <div key={log.id} className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                                            <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold">
                                                <span>@Operations Specialist</span>
                                                <span>{log.time}</span>
                                            </div>
                                            <p className="text-xs text-gray-700 font-medium">{log.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <p className="text-sm text-gray-500 italic text-center py-12">No ticket selected.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

function GroupContainer({
    title, count, tasks, color, availableMembers, onRowSelect, onToggle, onDelete,
    editingTaskId, editNameValue, setEditNameValue, startEditing, saveInlineUpdate,
    onOwnerChange, onDateChange
}: GroupContainerProps) {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-500 font-bold px-1">
                <ChevronDown className="h-4 w-4" />
                <h3 className="text-[11px] uppercase tracking-widest font-extrabold">{title}</h3>
                <span className="text-[11px] bg-gray-200/80 text-gray-600 font-black px-1.5 py-0.5 rounded-full">{count}</span>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
                <div className="grid grid-cols-12 bg-gray-50/70 p-3 text-[10px] font-bold text-gray-400 uppercase border-b border-gray-200">
                    <div className="col-span-5 pl-2">Ticket Description</div>
                    <div className="col-span-2 text-center">Status</div>
                    <div className="col-span-3 text-center">Assigned Agent</div>
                    <div className="col-span-2 text-right pr-4">Timeline</div>
                </div>
                
                {tasks.map((task) => (
                    <div key={task.id} onClick={() => onRowSelect(task.id)} className={`grid grid-cols-12 border-b border-gray-100 p-3.5 items-center hover:bg-slate-50/70 text-sm group border-l-4 cursor-pointer transition-all ${color}`}>
                        <div className="col-span-5 font-semibold text-gray-800 pr-4 pl-1" onClick={(e) => e.stopPropagation()}>
                            {editingTaskId === task.id ? (
                                <input type="text" className="w-full p-1 border border-blue-500 rounded text-xs focus:outline-none" value={editNameValue} onChange={(e) => setEditNameValue(e.target.value)} onBlur={() => saveInlineUpdate(task.id)} onKeyDown={(e) => e.key === "Enter" && saveInlineUpdate(task.id)} autoFocus />
                            ) : (
                                <div onDoubleClick={() => startEditing(task.id, task.name)} className="flex items-center gap-2 group/text truncate">
                                    <span className="truncate group-hover:text-blue-600">{task.name}</span>
                                    <Edit2 className="h-3 w-3 text-gray-300 opacity-0 group-hover/text:opacity-100 ml-auto shrink-0" />
                                </div>
                            )}
                        </div>

                        <div className="col-span-2 flex justify-center" onClick={(e) => e.stopPropagation()}>
                            <button type="button" onClick={() => onToggle(task.id)} className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase border shadow-2xs ${task.status === 'Done' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                {task.status === 'Done' ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                                <span>{task.status}</span>
                            </button>
                        </div>

                        <div className="col-span-3 flex justify-center px-2" onClick={(e) => e.stopPropagation()}>
                            <div className="relative w-full max-w-[150px] flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2 py-0.5">
                                <UserCheck className="h-3 w-3 text-gray-400" />
                                <select value={task.owner} onChange={(e) => onOwnerChange(task.id, e.target.value)} className="w-full bg-transparent text-[11px] font-bold text-gray-600 focus:outline-none appearance-none">
                                    {availableMembers.map((m) => <option key={m.id} value={m.name}>{m.name}</option>)}
                                </select>
                                <ChevronDown className="h-3 w-3 text-gray-400 ml-auto" />
                            </div>
                        </div>

                        <div className="col-span-2 flex items-center justify-end gap-2 text-gray-400 pr-1" onClick={(e) => e.stopPropagation()}>
                            <div className="relative flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-0.5">
                                <Calendar className="h-3 w-3 text-gray-400" />
                                <input type="date" value={task.date} onChange={(e) => onDateChange(task.id, e.target.value)} className="bg-transparent text-[11px] font-medium text-gray-600 focus:outline-none w-[95px]" />
                            </div>
                            <button type="button" onClick={() => onDelete(task.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 rounded-lg"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}