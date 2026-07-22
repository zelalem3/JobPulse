import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ShieldAlert, Loader2, Calendar, Plus, Trash2, Check } from 'lucide-react';
import api from '../services/axios';

interface Skill {
  id: number;
  name: string;
  created_at?: string;
}

export default function AlertsPage() {
  const navigate = useNavigate();
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
      
      // Your controller returns: { skills: [...] }
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

      // Your controller returns updated skills array on store
      const updatedSkills = response.data.skills;
      if (Array.isArray(updatedSkills)) {
        setSkills(updatedSkills);
      } else {
        fetchSkills(); // Fallback reload
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-2 flex flex-col items-center">
          <Loader2 className="animate-spin text-blue-600" size={32} />
          <p className="text-sm font-semibold text-slate-500">Retrieving alert configurations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">

        {showToast && (
          <div className="fixed bottom-5 right-5 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg border border-slate-800 flex items-center gap-2 text-sm font-semibold z-50">
            <Check size={16} className="text-emerald-400" /> Alert created successfully!
          </div>
        )}
        
        <div className="flex items-center justify-between bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Bell className="text-blue-600" size={24} /> Job Alerts / Skill Monitors
            </h1>
            <p className="text-sm text-slate-500 font-medium">Manage your automated position notification monitors.</p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm font-semibold flex items-center gap-2">
            <ShieldAlert size={18} /> {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          
          {/* Create Alert Form */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-5">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <Plus size={16} className="text-blue-600" /> New Alert Monitor
            </h3>

            <form onSubmit={handleCreateSkill} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Skill Name</label>
                <input 
                  type="text" 
                  placeholder="e.g., React, Python..." 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-sm text-slate-700 outline-none placeholder-slate-400"
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition shadow-sm flex items-center justify-center gap-1.5"
              >
                <Plus size={16} /> Save Alert
              </button>
            </form>
          </div>

          {/* Active Alerts List Area */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Configured Monitors ({skills.length})
              </h3>
            </div>

            {skills.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Bell className="mx-auto text-slate-300" size={40} />
                <p className="text-sm font-bold text-slate-600">No active alerts configured.</p>
                <p className="text-xs text-slate-400">Set up keyword watch-lists to track incoming database registry entries.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {skills.map((skill) => (
                  <div key={skill.id} className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-slate-800">Monitor: <span className="text-blue-600">{skill.name}</span></h3>
                      <p className="text-xs text-slate-400 flex items-center gap-2">
                        <span className="flex items-center gap-1"><Calendar size={12} /> Active Watch</span>
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteSkill(skill.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-xl transition"
                      title="Delete Alert"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}