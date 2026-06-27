import React, { useState, useEffect } from 'react';
import { 
  Bell, BellOff, Plus, Trash2, Mail, Clock, Search, 
  MapPin, Database, Check
} from 'lucide-react';
import api from '../services/axios'; // Swapped completely to Axios custom instance

interface JobAlert {
  id: string;
  keyword: string;
  location: string;
  sources?: string[]; 
  frequency?: string; 
  isActive: boolean | number; 
  matchCount?: number;
  created_at: string; 
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<JobAlert[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Form states for creating a new custom alert
  const [newKeyword, setNewKeyword] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [selectedSources, setSelectedSources] = useState<string[]>(['LinkedIn']);
  const [frequency, setFrequency] = useState<string>('Daily');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // 1. Fetch live entries from Laravel Backend
  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setIsLoading(true);
   
      const response = await api.get('api/alerts');
      
     
      setAlerts(response.data.data || response.data); 
      console.log(response.data);
    } catch (error) {
      console.error("Failed fetching stream monitors:", error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;

    try {
      const response = await api.post('api/alerts', {
        keyword: newKeyword,
        location: newLocation || 'Remote'
      });

     
      setAlerts([response.data.alert, ...alerts]);
      setNewKeyword('');
      setNewLocation('');
      
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
      console.log(response.data);
    } catch (error) {
      console.error("Could not write active daemon:", error);
    }
  };

 
  const toggleAlertStatus = async (id: string, currentStatus: boolean | number) => {
    const updatedStatus = !currentStatus;
    
    try {
     
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, isActive: updatedStatus } : a));

      await api.put(`/alerts/${id}`, {
        isActive: updatedStatus
      });
    } catch (error) {
      console.error("Failed structural system toggle switch update:", error);
      fetchAlerts(); 
    }
  };


  const deleteAlert = async (id: string) => {
    try {
      await api.delete(`/alerts/${id}`);
      setAlerts(prev => prev.filter(alert => alert.id !== id));
    } catch (error) {
      console.error("Purge operations malfunctioned:", error);
    }
  };

  const toggleSourceSelection = (source: string) => {
    if (selectedSources.includes(source)) {
      if (selectedSources.length > 1) {
        setSelectedSources(selectedSources.filter(s => s !== source));
      }
    } else {
      setSelectedSources([...selectedSources, source]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {showSuccessToast && (
          <div className="fixed bottom-5 right-5 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg border border-slate-800 flex items-center gap-2 text-sm font-semibold z-50">
            <Check size={16} className="text-emerald-400" /> Webhook Indexer Trigger Hook Created!
          </div>
        )}

        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-990 tracking-tight sm:text-3xl flex items-center gap-2">
            <Bell size={24} className="text-blue-600" /> Job Scraper Alerts
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Configure backend indexing query streams. Our daemon worker loops cross-verify criteria metrics against real-time API integrations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Create Alert Box Form */}
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
                    placeholder="e.g., React, Laravel..." 
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
                    placeholder="e.g., Remote, Addis Ababa" 
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400"
                  />
                </div>
              </div>

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

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Notification Interval</label>
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <Clock size={16} className="text-slate-400 shrink-0" />
                  <select 
                    value={frequency} 
                    onChange={(e) => setFrequency(e.target.value)}
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

          {/* Active Alerts List Render Area */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                Active Scraper Subscriptions ({alerts.length})
              </h3>
            </div>

            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-12 text-sm text-slate-400 font-medium">
                  Syncing ingestion pipelines...
                </div>
              ) : alerts.length > 0 ? (
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

                      <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-400">
                        <div className="flex items-center gap-1">
                          <Database size={13} className="text-slate-400" />
                          <span className="text-slate-500">
                            [{alert.sources ? alert.sources.join(', ') : 'All channels'}]
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail size={13} className="text-slate-400" />
                          <span className="text-slate-500 font-semibold">{alert.frequency || 'Daily'}</span>
                        </div>
                        <span className="text-slate-300">•</span>
                        <span className="text-[11px] text-slate-400">
                          Synced: {new Date(alert.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-0 pt-3 sm:pt-0 border-slate-100">
                      {alert.isActive && (alert.matchCount ?? 0) > 0 && (
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg">
                          +{alert.matchCount} New Matches
                        </span>
                      )}
                      
                      <div className="flex items-center gap-2 ml-auto sm:ml-0">
                        <button
                          onClick={() => toggleAlertStatus(alert.id, alert.isActive)}
                          className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
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