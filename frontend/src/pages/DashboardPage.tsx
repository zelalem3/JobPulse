import React, { useState } from 'react';
import { 
  BarChart3, Layers, Play, Pause, CheckCircle2, 
  AlertCircle, Clock, Server, Terminal, ArrowUpRight 
} from 'lucide-react';

interface ScraperTask {
  id: string;
  target: string;
  frequency: string;
  status: 'idle' | 'running' | 'paused';
  lastRun: string;
  jobsFound: number;
}

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  service: string;
}

export default function Dashboard() {
  const [isWorkerActive, setIsWorkerActive] = useState<boolean>(true);
  
  // Scraper targets matching your python/compose infrastructure
  const [tasks, setTasks] = useState<ScraperTask[]>([
    { id: '1', target: 'RemoteOK (Software Engineering)', frequency: 'Hourly', status: 'idle', lastRun: '14 mins ago', jobsFound: 24 },
    { id: '2', target: 'LinkedIn (Python & AI Developers)', frequency: 'Every 2h', status: 'running', lastRun: 'Just now', jobsFound: 118 },
    { id: '3', target: 'Indeed (Laravel Framework Core)', frequency: 'Daily', status: 'paused', lastRun: 'Yesterday', jobsFound: 0 },
  ]);

  // Terminal stream mimic from your docker-compose outputs
  const [logs] = useState<LogEntry[]>([
    { timestamp: '18:24:02', level: 'info', service: 'scrapers-1', message: 'Syncing extracted text nodes down to PostgreSQL bridge.' },
    { timestamp: '18:23:59', level: 'info', service: 'queue-worker-1', message: 'Job [App\\Jobs\\ProcessScrapedListing] processed successfully.' },
    { timestamp: '18:15:00', level: 'warn', service: 'redis-1', message: 'Memory consumption threshold reached 45% allocations.' },
    { timestamp: '17:42:11', level: 'error', service: 'scrapers-1', message: 'Timeout mapping DOM selectors on fallback proxy node.' },
  ]);

  const toggleTaskStatus = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const nextStatus: ScraperTask['status'] = t.status === 'paused' ? 'idle' : 'paused';
      return { ...t, status: nextStatus };
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* --- TOP ROW: DASHBOARD TITLE --- */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Dashboard</h1>
            <p className="text-sm text-slate-400">Manage running scrapers, queue nodes, and operational logging loops.</p>
          </div>
          
          {/* Global Queue Worker Toggle Switch */}
          <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200/80 shadow-sm">
            <span className="flex h-2 w-2 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isWorkerActive ? 'bg-emerald-400' : 'bg-slate-300'}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isWorkerActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            </span>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
              Laravel Queue: {isWorkerActive ? 'Active' : 'Stopped'}
            </span>
            <button 
              onClick={() => setIsWorkerActive(!isWorkerActive)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                isWorkerActive 
                  ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isWorkerActive ? 'Pause Worker' : 'Start Worker'}
            </button>
          </div>
        </div>

        {/* --- ROW 2: ADVANCED ANALYTICS SUMMARY GRID --- */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Extraction Rate</span>
              <BarChart3 size={18} className="text-blue-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-800">412</span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.5 rounded">
                +18% <ArrowUpRight size={12} />
              </span>
            </div>
            <p className="text-xs text-slate-400">Discovered jobs over past 24 hours</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Queue Workload</span>
              <Layers size={18} className="text-purple-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-800">14</span>
              <span className="text-xs text-slate-400 font-medium">pending keys</span>
            </div>
            <p className="text-xs text-slate-400">Redis pipeline transactions waiting</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Docker Environments</span>
              <Server size={18} className="text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-800">7 / 7</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Healthy</span>
            </div>
            <p className="text-xs text-slate-400">Active docker-compose nodes</p>
          </div>
        </div>

        {/* --- ROW 3: SCRAPER DRIVER PIPELINES & TELEMETRY LOGS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Side: Scraper Task Driver Controller */}
          <div className="lg:col-span-2 space-y-4">
            <div className="px-1">
              <h3 className="text-lg font-bold text-slate-800">Scraper Engine Subprocesses</h3>
              <p className="text-xs text-slate-400">Control scraping script targets running inside your daemon system.</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100">
              {tasks.map((task) => (
                <div key={task.id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition hover:bg-slate-50/40">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-800 text-base">{task.target}</h4>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md tracking-wide uppercase border ${
                        task.status === 'running' ? 'bg-blue-50 border-blue-200 text-blue-600' :
                        task.status === 'paused' ? 'bg-slate-100 border-slate-200 text-slate-400' :
                        'bg-slate-50 border-slate-200 text-slate-600'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                      <span className="flex items-center gap-1"><Clock size={13} /> {task.frequency} Cycle</span>
                      <span>Last processed: {task.lastRun}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-0 pt-3 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <p className="text-sm font-black text-slate-700">{task.jobsFound}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Jobs Collected</p>
                    </div>
                    <button
                      onClick={() => toggleTaskStatus(task.id)}
                      className={`p-2 rounded-xl border transition ${
                        task.status === 'paused'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {task.status === 'paused' ? <Play size={16} fill="currentColor" /> : <Pause size={16} fill="currentColor" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Container Logging Stream Monitor */}
          <div className="space-y-4">
            <div className="px-1 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Terminal size={18} className="text-slate-500" /> Pipeline Streams
              </h3>
              <span className="text-[10px] bg-slate-200 text-slate-600 font-bold px-1.5 py-0.5 rounded tracking-wider uppercase">Live</span>
            </div>

            <div className="bg-slate-900 rounded-2xl p-4 shadow-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-3 max-h-[340px] overflow-y-auto shadow-inner">
              {logs.map((log, index) => (
                <div key={index} className="space-y-0.5 border-b border-slate-800/40 pb-2 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">{log.timestamp} [{log.service}]</span>
                    <span className={`font-bold uppercase ${
                      log.level === 'error' ? 'text-rose-400' :
                      log.level === 'warn' ? 'text-amber-400' : 'text-blue-400'
                    }`}>
                      {log.level}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed break-words">{log.message}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}