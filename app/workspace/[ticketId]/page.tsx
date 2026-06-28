"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { 
  ArrowLeft, MessageSquare, Send, Activity, 
  Clock, CheckCircle, ShieldCheck, User, Calendar
} from "lucide-react";

interface Log {
  id: string | number;
  text: string;
  time: string;
  createdAt?: string;
}

interface TicketType {
  id: string;
  _id?: string;
  name: string;
  status: string;
  owner: string;
  date: string;
  description: string;
  logs: Log[];
}

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const ticketId = params.ticketId as string;

  const [ticket, setTicket] = useState<TicketType | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const fetchTicketDetails = async () => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`);
      if (res.ok) {
        const data = await res.json();
        setTicket(data);
      } else {
        setError("Ticket not found or query parameter error.");
      }
    } catch (err) {
      setError("Failed to communicate with API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ticketId) {
      fetchTicketDetails();
    }
  }, [ticketId]);

  const handlePostLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !ticket) return;

    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          newComment: comment
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setTicket(updated);
        setComment("");
        // Create an audit notification
        await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "Ticket Log Appended",
            message: `User ${user?.name || "System"} appended a diagnostic comment to Ticket #${ticketId}.`
          })
        });
      }
    } catch (err) {
      console.error("Failed to append comments:", err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="p-8 text-center bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl max-w-lg mx-auto mt-12 space-y-4 shadow-sm">
        <p className="text-sm font-bold text-red-500">{error || "Incident Ticket Not Found"}</p>
        <button 
          onClick={() => router.push("/workspace")}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs cursor-pointer"
        >
          Return to Workspace Board
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Back Header */}
      <div className="flex items-center justify-between border-b dark:border-gray-850 pb-4">
        <button 
          onClick={() => router.push("/workspace")} 
          className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-gray-900 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-850 shadow-3xs cursor-pointer transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> 
          <span>Back to Workspace</span>
        </button>
        <div className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">
          SYSTEM_TICKET_HASH: #{ticketId.substring(0, 12)}...
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Status Head block */}
        <div className="p-6 md:p-8 bg-gray-50/50 dark:bg-gray-800/20 border-b border-gray-100 dark:border-gray-800 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`px-3 py-1 text-[9px] font-black uppercase rounded-full border shadow-3xs flex items-center gap-1 ${
              ticket.status === 'Done' 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400' 
                : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400'
            }`}>
              {ticket.status === 'Done' ? <CheckCircle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
              <span>{ticket.status}</span>
            </span>

            <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 flex items-center gap-1">
              <User className="h-3.5 w-3.5 text-gray-400" />
              <span>Assigned Agent:</span> 
              <b className="text-gray-700 dark:text-gray-300 font-extrabold">{ticket.owner}</b>
            </span>

            <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 flex items-center gap-1 sm:ml-auto">
              <Calendar className="h-3.5 w-3.5 text-gray-400" />
              <span>Timeline Limit:</span> 
              <b className="text-gray-700 dark:text-gray-300 font-extrabold">{ticket.date}</b>
            </span>
          </div>

          <h1 className="text-xl md:text-2xl font-black text-gray-950 dark:text-white tracking-tight leading-snug">
            {ticket.name}
          </h1>
        </div>

        {/* Content detail & comments */}
        <div className="p-6 md:p-8 space-y-8">
          
          {/* Diagnostics info */}
          <div className="bg-slate-50 dark:bg-gray-850 border border-slate-100 dark:border-gray-800 rounded-xl p-5 space-y-2">
            <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-blue-600" />
              <span>Incident Diagnostics & Description</span>
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
              {ticket.description || "No customized telemetry context was logged for this ticket yet."}
            </p>
          </div>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Comment updates thread */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="h-4.5 w-4.5 text-indigo-500" />
              <span>Internal Operations Thread ({ticket.logs?.length || 0})</span>
            </h3>

            {/* Comment Form */}
            <form onSubmit={handlePostLog} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Log debug diagnostics, state updates or notes..." 
                className="flex-1 text-xs border border-gray-200 dark:border-gray-700 p-3 rounded-xl outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 bg-gray-50/50 dark:bg-gray-850 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-xs"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Log comment</span>
              </button>
            </form>

            {/* Logs List */}
            <div className="space-y-3 pt-2">
              {!ticket.logs || ticket.logs.length === 0 ? (
                <p className="text-xs text-gray-450 dark:text-gray-500 italic text-center py-6">No comments recorded on this ticket yet.</p>
              ) : (
                ticket.logs.slice().reverse().map((log: any, idx: number) => (
                  <div key={log.id || idx} className="p-4 bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 rounded-xl space-y-1.5">
                    <div className="flex justify-between items-center text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">
                      <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Operations Specialist Log entry</span>
                      </span>
                      <span>{log.time}</span>
                    </div>
                    <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold">{log.text}</p>
                  </div>
                ))
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
