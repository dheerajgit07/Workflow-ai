"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Plus, Trash2, Calendar, User, ChevronLeft, ChevronRight, 
  X, CheckSquare, PlusCircle, AlertCircle 
} from "lucide-react";

interface TaskType {
  id: string;
  _id?: string;
  title: string;
  status: string;
  priority: string;
  assignee: string;
  due: string;
}

export default function TasksPage() {
  const searchParams = useSearchParams();

  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    status: "To Do",
    priority: "Medium",
    assignee: "Aman Sharma",
    due: new Date().toISOString().split("T")[0]
  });

  const columns = ["To Do", "In Progress", "Review", "Done"];
  const members = ["Aman Sharma", "Rahul Verma", "Priya Patel", "Unassigned"];

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        setTasks(await res.json());
      }
    } catch (err) {
      console.error("Failed to load tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    if (searchParams.get("add") === "true") {
      setShowAddModal(true);
    }
  }, [searchParams]);

  // Create Task
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title || !newTask.due) return alert("Please fill in title and due date.");

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask)
      });

      if (res.ok) {
        const created = await res.json();
        setTasks([...tasks, created]);
        setShowAddModal(false);
        setNewTask({
          title: "",
          status: "To Do",
          priority: "Medium",
          assignee: "Aman Sharma",
          due: new Date().toISOString().split("T")[0]
        });
      }
    } catch (err) {
      console.error("Failed to add task:", err);
    }
  };

  // Update Status
  const handleMoveTask = async (id: string, nextStatus: string) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: nextStatus })
      });
      if (res.ok) {
        setTasks(tasks.map(t => (t.id === id || t._id === id) ? { ...t, status: nextStatus } : t));
      }
    } catch (err) {
      console.error("Failed to move task:", err);
    }
  };

  // Delete Task
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setTasks(tasks.filter(t => t.id !== id && t._id !== id));
      }
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  // Drag-and-Drop operations
  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("taskId", id);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent, column: string) => {
    const id = e.dataTransfer.getData("taskId");
    handleMoveTask(id, column);
  };

  // Move task status via buttons (Mobile/Fallback)
  const moveTaskIndex = (task: TaskType, direction: "left" | "right") => {
    const taskId = task.id || task._id || "";
    const currentIdx = columns.indexOf(task.status);
    let nextIdx = currentIdx;
    
    if (direction === "left" && currentIdx > 0) nextIdx -= 1;
    if (direction === "right" && currentIdx < columns.length - 1) nextIdx += 1;

    if (nextIdx !== currentIdx) {
      handleMoveTask(taskId, columns[nextIdx]);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
        <div className="grid grid-cols-4 gap-4 h-96">
          {[1, 2, 3, 4].map(i => <div key={i} className="bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 flex flex-col h-full overflow-hidden">
      
      {/* Upper bar */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Kanban Task Board</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Drag and drop cards or use action buttons to advance task sprint stages.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Grid columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 overflow-y-auto pb-6">
        {columns.map((col) => {
          const colTasks = tasks.filter(t => t.status === col);
          return (
            <div 
              key={col} 
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, col)}
              className="bg-gray-100/60 dark:bg-gray-900/40 border border-gray-200/50 dark:border-gray-800/40 rounded-2xl p-4 flex flex-col h-full min-h-[350px] transition-colors hover:bg-gray-100/80 dark:hover:bg-gray-900/60"
            >
              {/* Header column */}
              <div className="flex items-center justify-between border-b dark:border-gray-800/60 pb-2 mb-3">
                <span className="text-[10px] font-black uppercase text-gray-700 dark:text-gray-300 tracking-widest">{col}</span>
                <span className="text-[9px] bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded-full font-bold text-gray-500 dark:text-gray-400">{colTasks.length}</span>
              </div>

              {/* Tasks mapping in column */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 [&::-webkit-scrollbar]:hidden">
                {colTasks.map((task) => {
                  const taskId = task.id || task._id || "";
                  return (
                    <div 
                      key={taskId}
                      draggable
                      onDragStart={(e) => onDragStart(e, taskId)}
                      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-xl shadow-3xs cursor-grab active:cursor-grabbing hover:border-blue-300 dark:hover:border-blue-900 transition-all select-none space-y-3 relative group"
                    >
                      <button 
                        onClick={() => handleDelete(taskId)}
                        className="absolute top-3 right-3 p-1 text-gray-400 hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>

                      <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-normal pr-5">{task.title}</h4>
                      
                      <div className="flex items-center gap-2">
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                          task.priority === "High" 
                            ? "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400"
                            : task.priority === "Medium"
                            ? "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400"
                            : "bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400"
                        }`}>
                          {task.priority}
                        </span>
                        
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold ml-auto flex items-center gap-0.5">
                          <User className="h-3 w-3" />
                          <span>{task.assignee}</span>
                        </span>
                      </div>

                      {/* Fallback buttons for mobile/click layout navigation */}
                      <div className="flex justify-between items-center pt-2 border-t border-gray-50 dark:border-gray-850/50">
                        <button 
                          onClick={() => moveTaskIndex(task, "left")}
                          disabled={col === "To Do"}
                          className="p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 cursor-pointer"
                        >
                          <ChevronLeft className="h-3.5 w-3.5 text-gray-400" />
                        </button>
                        <span className="text-[8px] font-mono text-gray-300 dark:text-gray-600">DRAG / CLICK</span>
                        <button 
                          onClick={() => moveTaskIndex(task, "right")}
                          disabled={col === "Done"}
                          className="p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 cursor-pointer"
                        >
                          <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50">
          <form onSubmit={handleCreate} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl w-[380px] shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b dark:border-gray-800 pb-3">
              <h2 className="font-extrabold text-base text-gray-900 dark:text-white">Add Task Block</h2>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Task Description</label>
              <input 
                type="text" required placeholder="Task details..." 
                className="w-full p-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs outline-none focus:border-blue-500" 
                value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Priority</label>
                <select 
                  className="w-full p-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs outline-none focus:border-blue-500"
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Column State</label>
                <select 
                  className="w-full p-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs outline-none focus:border-blue-500"
                  value={newTask.status}
                  onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                >
                  {columns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Assignee</label>
                <select 
                  className="w-full p-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs outline-none focus:border-blue-500"
                  value={newTask.assignee}
                  onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                >
                  {members.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Timeline Target</label>
                <input 
                  type="date" required 
                  className="w-full p-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs outline-none focus:border-blue-500" 
                  value={newTask.due} onChange={(e) => setNewTask({ ...newTask, due: e.target.value })} 
                />
              </div>
            </div>

            <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-98 cursor-pointer mt-2">
              APPEND KANBAN CARD
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
