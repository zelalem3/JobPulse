import React, { useEffect, useState } from 'react';
import { Bell, ShieldAlert, Loader2, Check, Sparkles, Layers } from 'lucide-react';
import api from '../services/axios';
import AlertForm from '../components/alert/AlertForm';
import AlertItem from '../components/alert/AlertItem';

interface Skill {
  id: number;
  name: string;
  created_at?: string;
}

export default function AlertsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/alerts');
      
      const data = response.data;
      if (data && Array.isArray(data.skills)) {
        setSkills(data.skills);
      } else if (Array.isArray(data)) {
        setSkills(data);
      } else {
        setSkills([]);
      }
    } catch (e) {
      console.error("Error fetching job alerts:", e);
      setError("Could not retrieve active job alerts registry.");
      setSkills([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      setIsSubmitting(true);
      const response = await api.post('/api/alerts', {
        name: newName,
      });

      const updatedSkills = response.data.skills;
      if (Array.isArray(updatedSkills)) {
        setSkills(updatedSkills);
      } else {
        fetchSkills();
      }
      
      setNewName('');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3500);
    } catch (e) {
      console.error("Error creating job alert:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSkill = async (id: number) => {
    try {
      const response = await api.delete(`/api/alerts/${id}`);
      const updatedSkills = response.data.skills;
      if (Array.isArray(updatedSkills)) {
        setSkills(updatedSkills);
      } else {
        setSkills(prev => prev.filter(skill => skill.id !== id));
      }
    } catch (e) {
      console.error("Error deleting job alert:", e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center w-full">
        <div className="text-center space-y-3 flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Loader2 className="animate-spin text-indigo-400" size={24} />
          </div>
          <p className="text-sm font-medium text-slate-400">Loading your monitoring suite...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 font-sans selection:bg-indigo-500 selection:text-white w-full relative overflow-hidden">
      
      {/* Background ambient glow accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">

        {/* Toast Notification */}
        {showToast && (
          <div className="fixed bottom-6 right-6 bg-slate-900/90 backdrop-blur-xl border border-emerald-500/30 text-white px-5 py-4 rounded-2xl shadow-2xl shadow-emerald-950/50 flex items-center gap-3 text-sm font-medium z-50 transition-all animate-in fade-in slide-in-from-bottom-4">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Check size={16} />
            </div>
            <span>Alert monitor deployed successfully!</span>
          </div>
        )}
        
        {/* Header Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900/80 via-slate-900/40 to-slate-950/80 backdrop-blur-2xl rounded-3xl p-8 border border-slate-800/80 shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Sparkles size={120} className="text-indigo-400" />
          </div>
          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-xs font-semibold tracking-wide uppercase">
              <Layers size={13} /> Active System
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              Job Alerts & Skill Monitors
            </h1>
            <p className="text-sm text-slate-400 max-w-xl">
              Configure real-time automated trackers for niche skill keywords and position requirements across incoming database entries.
            </p>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 bg-rose-950/50 border border-rose-900/60 text-rose-300 rounded-2xl text-sm font-medium flex items-center gap-3 shadow-xl backdrop-blur-xl">
            <ShieldAlert size={18} className="text-rose-400 shrink-0" /> 
            <span>{error}</span>
          </div>
        )}

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start w-full">
          
          <div className="lg:col-span-1">
            <AlertForm 
              newName={newName}
              setNewName={setNewName}
              onSubmit={handleCreateSkill}
              isSubmitting={isSubmitting}
            />
          </div>

          <div className="lg:col-span-2 bg-slate-950/40 backdrop-blur-2xl rounded-3xl border border-slate-800/80 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-900/40 flex justify-between items-center">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                Active Monitors 
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-bold">
                  {skills.length}
                </span>
              </h3>
            </div>

            {skills.length === 0 ? (
              <div className="py-16 px-6 text-center space-y-4">
                <div className="w-14 h-14 bg-slate-900 text-slate-500 rounded-2xl flex items-center justify-center mx-auto border border-slate-800 shadow-inner">
                  <Bell size={24} />
                </div>
                <div className="space-y-1 max-w-sm mx-auto">
                  <p className="text-sm font-semibold text-white">No custom monitors found</p>
                  <p className="text-xs text-slate-400 font-normal leading-relaxed">
                    Use the form on the left to configure your first tracking keyword and stay updated automatically.
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {skills.map((skill) => (
                  <AlertItem 
                    key={skill.id} 
                    skill={skill} 
                    onDelete={handleDeleteSkill} 
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}