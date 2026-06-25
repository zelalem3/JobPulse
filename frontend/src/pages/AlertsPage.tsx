import React, { useState } from 'react';
import { 
  Bell, BellOff, Plus, Trash2, Mail, Clock, Search, 
  MapPin, Sliders, Database, Check, AlertCircle 
} from 'lucide-react';

interface JobAlert {
  id: string;
  keyword: string;
  location: string;
  sources: string[];
  frequency: 'Instant' | 'Daily' | 'Weekly';
  isActive: boolean;
  matchCount: number;
  createdAt: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<JobAlert[]>([
    { id: '1', keyword: 'Laravel React', location: 'Remote', sources: ['RemoteOK', 'LinkedIn'], frequency: 'Instant', isActive: true, matchCount: 14, createdAt: '2 days ago' },
    { id: '2', keyword: 'Python Web Scraper', location: 'Addis Ababa', sources: ['LinkedIn', 'Indeed'], frequency: 'Daily', isActive: true, matchCount: 3, createdAt: '1 week ago' },
    { id: '3', keyword: 'DevOps Engineer', location: 'Global', sources: ['RemoteOK'], frequency: 'Weekly', isActive: false, matchCount: 0, createdAt: '3 weeks ago' }
  ]);

  // Form states for creating a new custom alert
  const [newKeyword, setNewKeyword] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [selectedSources, setSelectedSources] = useState<string[]>(['LinkedIn']);
  const [frequency, setFrequency] = useState<'Instant' | 'Daily' | 'Weekly'>('Daily');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;

    const newAlert: JobAlert = {
      id: Date.now().toString(),
      keyword: newKeyword,
      location: newLocation || 'Anywhere',
      sources: selectedSources,
      frequency: frequency,
      isActive: true,
      matchCount: 0,
      createdAt: 'Just now'
    };

    setAlerts([newAlert, ...alerts]);
    setNewKeyword('');
    setNewLocation('');
    
    // Trigger visual notification toast loop
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const toggleAlertStatus = (id: string) => {
    setAlerts(prev => prev.map(alert => alert.id === id ? { ...alert, isActive: !alert.isActive } : alert));
  };

  const deleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const toggleSourceSelection = (source: string) => {
    if (selectedSources.includes(source)) {
      if (selectedSources.length > 1) { // Retain at least one data pool index source
        setSelectedSources(selectedSources.filter(s => s !== source));
      }
    } else {
      setSelectedSources([...selectedSources, source]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Toast Alert Feedback */}
        {showSuccessToast && (
          <div className="fixed bottom-5 right-5 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg border border-slate-800 flex items-center gap-2 text-sm font-semibold animate-fade-in-up z-50">
            <Check size={16} className="text-emerald-400" /> Webhook Indexer Trigger Hook Created!
          </div>
        )}

        {/* --- HEADER TITLE BANNER --- */}
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight sm:text-3xl flex items-center gap-2">
            <Bell size={24} className="text-blue-600" /> Job Scraper Alerts
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Configure backend indexing query streams. Our daemon worker loops cross-verify criteria metrics against real-time API integrations.
          </p>
        </div>

        {/* --- MAIN CORE MATRIX COLS SPLIT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Create Alert Builder Block */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-5">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <Plus size={16} className="text-blue-600" /> Configure Daemon Alert
            </h3>

            <form onSubmit={handleCreateAlert} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Target Keywords</label>
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <Search size={16} className="text-slate-400 shrink-0" />
                  <input 
                    type="text" 
                    placeholder="e.g., React, Laravel, Remote Tech..." 
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    className="w-full bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Target Geolocation</label>
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <MapPin size={16} className="text-slate-400 shrink-0" />
                  <input 
                    type="text" 
                    placeholder="e.g., Remote, Berlin, Addis Ababa" 
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Ingestion Stream Context Controls */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Ingestion Data Channels</label>
                <div className="grid grid-cols-3 gap-2">
                  {['RemoteOK', 'LinkedIn', 'Indeed'].map(src => {
                    const active = selectedSources.includes(src);
                    return (
                      <button
                        type="button"
                        key={src}
                        onClick={() => toggleSourceSelection(src)}
                        className={`py-2 text-center rounded-xl text-xs font-bold border transition ${
                          active 
                            ? 'bg-blue-50 border-blue-200 text-blue-600' 
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {src}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Frequency Ingestion Cadence */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Notification Interval</label>
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <Clock size={16} className="text-slate-400 shrink-0" />
                  <select 
                    value={frequency} 
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full bg-transparent outline-none text-sm text-slate-700 cursor-pointer"
                  >
                    <option value="Instant">Instant Broadcast Webhooks</option>
                    <option value="Daily">Daily Ingest Digests</option>
                    <option value="Weekly">Weekly Pipeline Summaries</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full mt-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition shadow-sm flex items-center justify-center gap-1.5"
              >
                <Bell size={16} /> Deploy Active Agent
              </button>
            </form>
          </div>

          {/* Active Alerts Management Matrix */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                Active Scraper Subscriptions ({alerts.length})
              </h3>
            </div>

            <div className="space-y-4">
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                  <div 
                    key={alert.id} 
                    className={`bg-white rounded-2xl p-5 border shadow-sm transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
                      alert.isActive ? 'border-slate-100' : 'border-slate-200/60 bg-slate-50/50'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition">
                          {alert.keyword}
                        </span>
                        <span className="text-slate-300 text-xs font-medium">|</span>
                        <span className="text-xs text-slate-500 font-semibold inline-flex items-center gap-1">
                          <MapPin size={12} /> {alert.location}
                        </span>
                      </div>

                      {/* Pill badging rendering pipeline properties */}
                      <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-400">
                        <div className="flex items-center gap-1">
                          <Database size={13} className="text-slate-400" />
                          <span className="text-slate-500">
                            [{alert.sources.join(', ')}]
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail size={13} className="text-slate-400" />
                          <span className="text-slate-500 font-semibold">{alert.frequency}</span>
                        </div>
                        <span className="text-slate-300">•</span>
                        <span className="text-[11px] text-slate-400">Created {alert.createdAt}</span>
                      </div>
                    </div>

                    {/* Operational Trigger Actions Row */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-0 pt-3 sm:pt-0 border-slate-100">
                      {alert.isActive && alert.matchCount > 0 && (
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg">
                          +{alert.matchCount} New Matches
                        </span>
                      )}
                      
                      <div className="flex items-center gap-2 ml-auto sm:ml-0">
                        {/* Inline Status Toggle Switch */}
                        <button
                          onClick={() => toggleAlertStatus(alert.id)}
                          className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none ${
                            alert.isActive ? 'bg-blue-600' : 'bg-slate-200'
                          }`}
                        >
                          <div className={`bg-white w-5 h-5 rounded-full shadow-sm transform duration-200 ease-in-out ${
                            alert.isActive ? 'translate-x-5' : 'translate-x-0'
                          }`} />
                        </button>

                        <button
                          onClick={() => deleteAlert(alert.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-xl transition"
                          title="Purge Active Target Alert"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                /* Clear Clean State Template Boundary Box */
                <div className="bg-white border border-dashed border-slate-200 rounded-2xl py-16 text-center space-y-3">
                  <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto border border-slate-100">
                    <BellOff size={20} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-700">No stream monitors declared</h3>
                    <p className="text-slate-400 text-sm max-w-xs mx-auto">Deploy a worker daemon mapping on the sidebar control matrix framework.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}