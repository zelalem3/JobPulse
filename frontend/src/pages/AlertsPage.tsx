import React, { useEffect, useState } from 'react';
import { Bell, ShieldAlert, Loader2, Check } from 'lucide-react';
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
      setTimeout(() => setShowToast(false), 3000);
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
        <div className="text-center space-y-2 flex flex-col items-center">
          <Loader2 className="animate-spin text-slate-400" size={32} />
          <p className="text-sm font-semibold text-slate-400">Retrieving alert configurations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans selection:bg-slate-800 selection:text-white w-full">
      <div className="w-full space-y-6">

        {showToast && (
          <div className="fixed bottom-5 right-5 bg-slate-900 border border-slate-700/80 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-semibold z-50">
            <Check size={16} className="text-emerald-400" /> Alert created successfully!
          </div>
        )}
        
        <div className="flex items-center justify-between bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 border border-slate-800/80 shadow-xl w-full">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Bell className="text-slate-400" size={24} /> Job Alerts / Skill Monitors
            </h1>
            <p className="text-sm font-semibold text-slate-400">Manage your automated position notification monitors.</p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-950/60 border border-rose-900/80 text-rose-300 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-xl w-full">
            <ShieldAlert size={18} /> {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start w-full">
          
          <AlertForm 
            newName={newName}
            setNewName={setNewName}
            onSubmit={handleCreateSkill}
            isSubmitting={isSubmitting}
          />

          <div className="md:col-span-2 bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-800/80 shadow-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                Configured Monitors ({skills.length})
              </h3>
            </div>

            {skills.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 bg-slate-950 text-slate-500 rounded-2xl flex items-center justify-center mx-auto border border-slate-800 shadow-inner">
                  <Bell size={20} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white">No active alerts configured.</p>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto font-medium">Set up keyword watch-lists to track incoming database registry entries.</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80">
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