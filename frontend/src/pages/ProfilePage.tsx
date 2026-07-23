import React, { useState, useEffect } from 'react';
import { User, Briefcase, Bell, MapPin, Mail, Save, Lock, Plus, X, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import api from '../services/axios';

interface UserProfile {
  name: string;
  role?: string;
  email: string;
  location?: string;
  bio?: string;
  skills: string[];
}

export default function Profile() {
  const [activeTab, setActiveTab] = useState<'info' | 'security' | 'alerts'>('info');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [profile, setProfile] = useState<UserProfile>({
    name: 'Zelalem Getnet',
    role: 'Full Stack Developer',
    email: '',
    location: 'Addis Ababa',
    bio: '',
    skills: [],
  });

  // State for typing a new skill input
  const [newSkill, setNewSkill] = useState('');

  // Password change state
  const [passwords, setPasswords] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  const [passLoading, setPassLoading] = useState(false);
  const [passMessage, setPassMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/profile');
      const data = res.data;
      
      const formattedSkills = Array.isArray(data.skills)
        ? data.skills.map((s: any) => (typeof s === 'object' && s !== null ? s.name : s))
        : [];

      setProfile({
        name: data.name || 'Zelalem Getnet',
        role: data.role || 'Full Stack Developer',
        email: data.email || '',
        location: data.location || 'Addis Ababa',
        bio: data.bio || '',
        skills: formattedSkills,
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    if (profile.skills.includes(newSkill.trim())) {
      setNewSkill('');
      return;
    }
    setProfile(prev => ({
      ...prev,
      skills: [...prev.skills, newSkill.trim()]
    }));
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setMessage(null);
      const res = await api.put('/api/profile', {
        name: profile.name,
        email: profile.email,
        location: profile.location,
        bio: profile.bio,
        skills: profile.skills,
        role: profile.role,
      });

      const savedUser = res.data.user;
      const updatedSkills = savedUser?.skills
        ? savedUser.skills.map((s: any) => (typeof s === 'object' && s !== null ? s.name : s))
        : profile.skills;

      setProfile(prev => ({
        ...prev,
        skills: updatedSkills,
      }));

      setMessage({ type: 'success', text: res.data.message || 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setPassLoading(true);
      setPassMessage(null);
      const res = await api.put('/api/profile/password', passwords);
      setPassMessage({ type: 'success', text: res.data.message || 'Password updated successfully!' });
      setPasswords({ current_password: '', password: '', password_confirmation: '' });
    } catch (err: any) {
      console.error('Error updating password:', err);
      setPassMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update password.' });
    } finally {
      setPassLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <div className="relative">
          <div className="animate-spin h-12 w-12 rounded-full border-4 border-slate-700 border-t-slate-200" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles size={16} className="text-slate-400 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-slate-800 selection:text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* --- FEEDBACK NOTIFICATIONS --- */}
        {message && (
          <div className={`p-4 rounded-2xl text-sm font-medium flex items-center gap-3 backdrop-blur-xl transition-all duration-300 animate-fadeIn ${
            message.type === 'success' 
              ? 'bg-slate-900 text-slate-200 border border-slate-800 shadow-lg' 
              : 'bg-rose-500/10 text-rose-300 border border-rose-500/20 shadow-lg'
          }`}>
            <span className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-slate-400' : 'bg-rose-400'} animate-ping`} />
            {message.text}
          </div>
        )}

        {/* --- PROFILE HEADER CARD --- */}
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-800/80 overflow-hidden relative group">
          <div className="absolute inset-0 bg-slate-900/40 pointer-events-none" />
          <div className="h-40 bg-slate-900 relative overflow-hidden border-b border-slate-800/80">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.05),transparent)]" />
          </div>
          
          <div className="px-8 pb-8 relative flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-16">
            <div className="w-32 h-32 rounded-3xl bg-slate-900 border-4 border-slate-950 shadow-2xl flex items-center justify-center text-slate-400 overflow-hidden relative group/avatar">
              <div className="absolute inset-0 bg-slate-800/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
              <User size={60} className="text-slate-400 transition-transform duration-300 group-hover/avatar:scale-110" />
            </div>

            <div className="flex-1 pt-4 sm:pt-0">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-extrabold tracking-tight text-white">{profile.name}</h1>
                <span className="px-3 py-1 bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold rounded-full flex items-center gap-1 shadow-inner">
                  <Zap size={12} className="text-slate-400" /> Pro
                </span>
              </div>
              <p className="text-slate-400 font-medium mt-1">{profile.role}</p>
              
              <div className="flex flex-wrap items-center gap-6 mt-3 text-sm text-slate-400">
                <span className="flex items-center gap-1.5 hover:text-slate-200 transition-colors">
                  <MapPin size={16} className="text-slate-400" /> {profile.location || 'Addis Ababa'}
                </span>
                <span className="flex items-center gap-1.5 hover:text-slate-200 transition-colors">
                  <Mail size={16} className="text-slate-400" /> {profile.email}
                </span>
              </div>
            </div>

            <button 
              onClick={() => {
                if (isEditing) {
                  handleSaveProfile();
                } else {
                  setIsEditing(true);
                }
              }}
              disabled={saving}
              className={`px-6 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-300 shadow-lg flex items-center gap-2 ${
                isEditing 
                  ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700' 
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 shadow-slate-950/50'
              }`}
            >
              {isEditing ? <><Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}</> : 'Edit Profile'}
            </button>
          </div>
        </div>

        {/* --- NAVIGATION TABS --- */}
        <div className="flex border-b border-slate-800/80 gap-8">
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-4 text-sm font-semibold border-b-2 transition-all duration-300 ${
              activeTab === 'info' 
                ? 'border-slate-200 text-white' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Account Details
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`pb-4 text-sm font-semibold border-b-2 transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'security' 
                ? 'border-slate-200 text-white' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock size={16} /> Security
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`pb-4 text-sm font-semibold border-b-2 transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'alerts' 
                ? 'border-slate-200 text-white' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bell size={16} /> Scraper Alerts
          </button>
        </div>

        {/* --- TAB WINDOW: ACCOUNT DETAILS --- */}
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left column: Bio & Form fields */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-slate-800/80 space-y-6 relative overflow-hidden">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles size={18} className="text-slate-400" /> About Me
                </h3>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={profile.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-2xl focus:ring-1 focus:ring-slate-500 focus:border-slate-500 text-slate-200 outline-none transition-all duration-300 resize-none shadow-inner"
                  />
                ) : (
                  <p className="text-slate-300 leading-relaxed text-sm bg-slate-950/40 p-4 rounded-2xl border border-slate-800/50">
                    {profile.bio || 'No bio provided yet.'}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      disabled={!isEditing}
                      value={profile.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-950/80 disabled:bg-slate-950/40 disabled:text-slate-400 border border-slate-800 rounded-2xl text-slate-200 outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500 transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      disabled={!isEditing}
                      value={profile.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-950/80 disabled:bg-slate-950/40 disabled:text-slate-400 border border-slate-800 rounded-2xl text-slate-200 outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500 transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Job Title</label>
                    <input
                      type="text"
                      name="role"
                      disabled={!isEditing}
                      value={profile.role}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-950/80 disabled:bg-slate-950/40 disabled:text-slate-400 border border-slate-800 rounded-2xl text-slate-200 outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500 transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Location</label>
                    <input
                      type="text"
                      name="location"
                      disabled={!isEditing}
                      value={profile.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-950/80 disabled:bg-slate-950/40 disabled:text-slate-400 border border-slate-800 rounded-2xl text-slate-200 outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right column: Technical Skills List */}
            <div className="space-y-6">
              <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-slate-800/80 space-y-5">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Briefcase size={18} className="text-slate-400" /> Monitored Tech & Skills
                </h3>

                {/* Add Skill Input (Only visible when editing) */}
                {isEditing && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a skill (e.g. React)"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                      className="flex-1 px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-2xl text-sm text-slate-200 outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-sm transition-all duration-300 shadow-lg flex items-center justify-center border border-slate-700"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                )}

                {/* Skills Chips Container */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {profile.skills.length > 0 ? (
                    profile.skills.map((skill, index) => (
                      <span 
                        key={index} 
                        className="px-3.5 py-1.5 bg-slate-800/80 text-slate-200 text-xs font-medium rounded-xl tracking-wide border border-slate-700/60 flex items-center gap-2 shadow-sm hover:border-slate-600 transition-colors"
                      >
                        {skill}
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="text-slate-400 hover:text-rose-400 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic">No skills added yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB WINDOW: SECURITY --- */}
        {activeTab === 'security' && (
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-slate-800/80 max-w-xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-slate-800 rounded-2xl border border-slate-700 text-slate-300">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Change Password</h3>
                <p className="text-slate-400 text-sm mt-0.5">Ensure your account is using a secure password.</p>
              </div>
            </div>

            {passMessage && (
              <div className={`p-4 rounded-2xl text-xs font-semibold ${passMessage.type === 'success' ? 'bg-slate-900 text-slate-200 border border-slate-800' : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'}`}>
                {passMessage.text}
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Current Password</label>
                <input
                  type="password"
                  name="current_password"
                  required
                  value={passwords.current_password}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-slate-200 outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">New Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  value={passwords.password}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-slate-200 outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Confirm New Password</label>
                <input
                  type="password"
                  name="password_confirmation"
                  required
                  value={passwords.password_confirmation}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-slate-200 outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={passLoading}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-sm font-semibold transition-all duration-300 shadow-lg border border-slate-700 disabled:opacity-50"
              >
                {passLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}

        {/* --- TAB WINDOW: SCRAPER ALERTS --- */}
        {activeTab === 'alerts' && (
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-slate-800/80 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">Configured Search Watches</h3>
              <p className="text-slate-400 text-sm mt-0.5">Control filters handled by your backend scrapers.</p>
            </div>

            <div className="divide-y divide-slate-800/80">
              <div className="py-4 flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">Remote Python Engineers</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Scanning RemoteOK and LinkedIn hourly</p>
                </div>
                <span className="px-3 py-1 bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold rounded-xl shadow-inner">
                  Active
                </span>
              </div>
              <div className="py-4 flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">Laravel Core Architect Roles</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Scanning Indeed daily</p>
                </div>
                <span className="px-3 py-1 bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold rounded-xl">
                  Paused
                </span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}