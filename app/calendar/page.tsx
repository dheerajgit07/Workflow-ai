"use client";

import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Search, 
  Filter, 
  Calendar as CalendarIcon, 
  Columns, 
  MoreHorizontal,
  X,
  CheckCircle2
} from 'lucide-react';

// Initial Mock Data (monday.com Style Tasks)
const initialTasks = [
  { id: 1, title: 'Q3 Strategy Planning', date: '2026-07-06', status: 'Working on it', priority: 'High', color: 'bg-amber-500' },
  { id: 2, title: 'UI/UX Design Review', date: '2026-07-08', status: 'Done', priority: 'Medium', color: 'bg-emerald-500' },
  { id: 3, title: 'API Integration & Testing', date: '2026-07-08', status: 'Stuck', priority: 'Critical', color: 'bg-rose-500' },
  { id: 4, title: 'Client Feedback Implementation', date: '2026-07-10', status: 'Not Started', priority: 'Low', color: 'bg-gray-400' },
  { id: 5, title: 'Marketing Campaign Launch', date: '2026-08-03', status: 'Working on it', priority: 'High', color: 'bg-amber-500' },
];

const STATUS_COLORS: Record<string, string> = {
  'Done': 'bg-emerald-500',
  'Working on it': 'bg-amber-500',
  'Stuck': 'bg-rose-500',
  'Not Started': 'bg-gray-400'
};

export default function CalendarPage() {
  // Current Active Date State (July 2026 default)
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 1)); 
  const [tasks, setTasks] = useState<any[]>(initialTasks);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states for creating a new task
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');
  const [newTaskStatus, setNewTaskStatus] = useState('Working on it');
  const [newTaskPriority, setNewTaskPriority] = useState('Medium');

  const fetchCalendarTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const formatted = data.map((t: any) => ({
            id: t.id || t._id,
            title: t.title,
            date: t.due || t.date,
            status: t.status === 'To Do' ? 'Not Started' : t.status,
            priority: t.priority || 'Medium',
            color: STATUS_COLORS[t.status === 'To Do' ? 'Not Started' : t.status] || 'bg-amber-500'
          }));
          setTasks(formatted);
        }
      }
    } catch (err) {
      console.error("Failed to fetch tasks for calendar:", err);
    }
  };

  React.useEffect(() => {
    fetchCalendarTasks();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Dynamic Calendar calculations for any chosen month/year
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const generateCalendarDays = () => {
    const days = [];
    // Prev month padding blocks
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ day: null, fullDate: '' });
    }
    // Active month blocks
    for (let i = 1; i <= daysInMonth; i++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ day: i, fullDate: dateString });
    }
    return days;
  };

  const calendarDays = generateCalendarDays();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Month navigation handlers
  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleGoToToday = () => setCurrentDate(new Date(2026, 6, 2)); // Systems July 2026 date context

  // Filter tasks based on Search query
  const filteredTasks = tasks.filter(task => 
    (task.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (task.status || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (task.priority || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Quick plus click handler inside grid
  const openModalForDate = (dateString: string) => {
    setNewTaskDate(dateString);
    setIsModalOpen(true);
  };

  // Create Task Form submission
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskDate) return;

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTaskTitle,
          due: newTaskDate,
          priority: newTaskPriority,
          status: newTaskStatus === 'Not Started' ? 'To Do' : newTaskStatus
        })
      });

      if (res.ok) {
        fetchCalendarTasks();
      } else {
        const newTask = {
          id: Date.now(),
          title: newTaskTitle,
          date: newTaskDate,
          status: newTaskStatus,
          priority: newTaskPriority,
          color: STATUS_COLORS[newTaskStatus] || 'bg-gray-400'
        };
        setTasks([...tasks, newTask]);
      }
    } catch (err) {
      console.error("Failed to create task via API:", err);
    }

    // Reset Form fields
    setNewTaskTitle('');
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] text-[#333333] font-sans antialiased">
      
      {/* --- Sub Header / Monday.com Top Bar --- */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <span>Main Workspace</span> / <span>Project Roadmap</span>
            </div>
            <h1 className="text-2xl font-semibold flex items-center gap-2 text-gray-800">
              <CalendarIcon className="w-6 h-6 text-[#0073ea]" /> Team Calendar
            </h1>
          </div>

          {/* New Item Trigger Button */}
          <div className="flex items-center gap-2 self-start md:self-center">
            <button 
              onClick={() => {
                setNewTaskDate(`${year}-${String(month + 1).padStart(2, '0')}-02`);
                setIsModalOpen(true);
              }}
              className="bg-[#0073ea] hover:bg-[#0060c4] text-white px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> New Item
            </button>
            <div className="h-8 w-[1px] bg-gray-200 mx-1"></div>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* --- Controls / Filters Bar --- */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Real-time Functional Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search tasks, status..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#0073ea] w-48 md:w-64 transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                >
                  Clear
                </button>
              )}
            </div>
            
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 border border-gray-300 rounded-md bg-white">
              <Filter className="w-4 h-4" /> Filter
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 border border-gray-300 rounded-md bg-white">
              <Columns className="w-4 h-4" /> Columns
            </button>
          </div>

          {/* Functional Month Navigator Controls */}
          <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-md p-1 shadow-sm">
            <button onClick={handlePrevMonth} className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={handleGoToToday} className="text-xs px-2.5 py-1 font-medium text-gray-600 hover:bg-gray-100 rounded border border-gray-200 transition-colors">
              Today
            </button>
            <span className="text-sm font-semibold px-2 min-w-[100px] text-center text-gray-700">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={handleNextMonth} className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* --- Main Calendar Grid Container --- */}
      <div className="p-6 max-w-[1600px] mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 text-center">
            {weekDays.map((day, idx) => (
              <div 
                key={day} 
                className={`py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase ${
                  idx !== 6 ? 'border-r border-gray-200' : ''
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid Sheets */}
          <div className="grid grid-cols-7 auto-rows-[140px] bg-gray-200 gap-[1px]">
            {calendarDays.map((cell, index) => {
              const dayTasks = filteredTasks.filter(t => t.date === cell.fullDate);
              
              // Highlight active simulated "Today" node (July 2, 2026)
              const isToday = cell.day === 2 && month === 6 && year === 2026;

              return (
                <div 
                  key={index} 
                  className={`p-2 bg-white flex flex-col justify-between transition-colors hover:bg-gray-50/60 group relative ${
                    !cell.day ? 'bg-gray-50/40 select-none' : ''
                  }`}
                >
                  {/* Date Number Label & Quick Add trigger */}
                  <div className="flex justify-between items-center mb-1">
                    {cell.day ? (
                      <span className={`text-xs font-bold flex items-center justify-center w-6 h-6 rounded-full ${
                        isToday ? 'bg-[#0073ea] text-white shadow-sm' : 'text-gray-700 group-hover:text-black'
                      }`}>
                        {cell.day}
                      </span>
                    ) : (
                      <span />
                    )}
                    
                    {cell.day && (
                      <button 
                        onClick={() => openModalForDate(cell.fullDate)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 text-[#0073ea] rounded transition-all"
                        title="Add task to this day"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Tasks List rendering */}
                  <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5 max-h-[95px] scrollbar-thin">
                    {dayTasks.map(task => (
                      <div 
                        key={task.id} 
                        className="text-xs p-1.5 rounded border border-gray-100 shadow-sm bg-white hover:border-gray-400 transition-all flex flex-col gap-1 group/item"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${task.color}`} />
                          <span className="font-medium text-gray-800 truncate" title={task.title}>
                            {task.title}
                          </span>
                        </div>
                        
                        {/* Status / Priority Badges */}
                        <div className="flex items-center justify-between text-[10px] text-gray-400 pt-0.5 border-t border-gray-50">
                          <span className="truncate max-w-[70px] font-medium text-gray-500">{task.status}</span>
                          <span className={`px-1 rounded font-mono text-[9px] scale-95 ${
                            task.priority === 'Critical' ? 'bg-rose-50 text-rose-600 font-bold' :
                            task.priority === 'High' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* --- Functional Task Creation Popup Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-md overflow-hidden transform transition-all scale-100">
            {/* Modal Header */}
            <div className="bg-[#f5f6f8] px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#0073ea]" /> Add New Board Item
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Item Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., Deploy Server" 
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#0073ea] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Schedule Date</label>
                  <input 
                    type="date" 
                    required
                    value={newTaskDate}
                    onChange={(e) => setNewTaskDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#0073ea] text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Priority</label>
                  <select 
                    value={newTaskPriority} 
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#0073ea] text-gray-700"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Status Column</label>
                <select 
                  value={newTaskStatus} 
                  onChange={(e) => setNewTaskStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#0073ea] text-gray-700"
                >
                  <option value="Working on it">Working on it 🟡</option>
                  <option value="Done">Done 🟢</option>
                  <option value="Stuck">Stuck 🔴</option>
                  <option value="Not Started">Not Started ⚫</option>
                </select>
              </div>

              {/* Form Action Actions */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-sm font-medium bg-[#0073ea] hover:bg-[#0060c4] text-white rounded-md shadow-sm transition-colors"
                >
                  Create Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}