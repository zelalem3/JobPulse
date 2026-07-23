import React, { useState, useEffect } from 'react';
import { User, Briefcase, Bell, MapPin, Mail, Save, Lock, Plus, X } from 'lucide-react';
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
    name: '',
    role: 'Full Stack Developer',
    email: '',
    location: '',
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
      
      // Safely extract skill names whether they are objects or strings
      const formattedSkills = Array.isArray(data.skills)
        ? data.skills.map((s: any) => (typeof s === 'object' && s !== null ? s.name : s))
        : [];

      setProfile({
        name: data.name || '',
        role: data.role || 'Full Stack Developer',
        email: data.email || '',
        location: data.location || '',
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

      // Extract skills from the response user object, whether they come back as relations or strings
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
  };  const handleUpdatePassword = async (e: React.FormEvent) => {
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
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* --- FEEDBACK NOTIFICATIONS --- */}
        {message && (
          <div className={`p-4 rounded-xl text-sm font-semibold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
            {message.text}
          </div>
        )}

        {/* --- PROFILE HEADER CARD --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700" />
          <div className="px-6 pb-6 relative flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16">
            <div className="w-28 h-28 rounded-2xl bg-slate-200 border-4 border-white shadow-sm flex items-center justify-center text-slate-400 overflow-hidden">
              <User size={56} className="text-slate-500" />
            </div>
            <div className="flex-1 pt-14 sm:pt-0">
              <h1 className="text-2xl font-bold text-slate-900">{profile.name}</h1>
              <p className="text-slate-500 font-medium">{profile.role}</p>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-400">
                <span className="flex items-center gap-1"><MapPin size={16} /> {profile.location || 'Location not set'}</span>
                <span className="flex items-center gap-1"><Mail size={16} /> {profile.email}</span>
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
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition shadow-sm ${
                isEditing 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2' 
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
              }`}
            >
              {isEditing ? <><Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}</> : 'Edit Profile'}
            </button>
          </div>
        </div>

        {/* --- NAVIGATION TABS --- */}
        <div className="flex border-b border-slate-200 gap-6">
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-3 text-sm font-semibold border-b-2 transition ${
              activeTab === 'info' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Account Details
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`pb-3 text-sm font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'security' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Lock size={16} /> Security
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`pb-3 text-sm font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'alerts' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
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
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
                <h3 className="text-lg font-bold text-slate-900">About Me</h3>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={profile.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 outline-none transition"
                  />
                ) : (
                  <p className="text-slate-600 leading-relaxed text-sm">{profile.bio || 'No bio provided yet.'}</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      disabled={!isEditing}
                      value={profile.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 disabled:bg-slate-50 disabled:text-slate-500 border border-slate-200 rounded-xl text-slate-700 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      disabled={!isEditing}
                      value={profile.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 disabled:bg-slate-50 disabled:text-slate-500 border border-slate-200 rounded-xl text-slate-700 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Job Title</label>
                    <input
                      type="text"
                      name="role"
                      disabled={!isEditing}
                      value={profile.role}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 disabled:bg-slate-50 disabled:text-slate-500 border border-slate-200 rounded-xl text-slate-700 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Location</label>
                    <input
                      type="text"
                      name="location"
                      disabled={!isEditing}
                      value={profile.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 disabled:bg-slate-50 disabled:text-slate-500 border border-slate-200 rounded-xl text-slate-700 outline-none transition"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right column: Technical Skills List */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
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
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm transition flex items-center justify-center"
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
                        className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg tracking-wide border border-slate-200/40 flex items-center gap-1.5"
                      >
                        {skill}
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="text-slate-400 hover:text-rose-600 transition"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">No skills added yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB WINDOW: SECURITY --- */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 max-w-xl space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Change Password</h3>
              <p className="text-slate-400 text-sm mt-0.5">Ensure your account is using a secure password.</p>
            </div>

            {passMessage && (
              <div className={`p-3 rounded-xl text-xs font-semibold ${passMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                {passMessage.text}
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Current Password</label>
                <input
                  type="password"
                  name="current_password"
                  required
                  value={passwords.current_password}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">New Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  value={passwords.password}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Confirm New Password</label>
                <input
                  type="password"
                  name="password_confirmation"
                  required
                  value={passwords.password_confirmation}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>
              <button
                type="submit"
                disabled={passLoading}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition shadow-sm disabled:opacity-50"
              >
                {passLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}

        {/* --- TAB WINDOW: SCRAPER ALERTS --- */}
        {activeTab === 'alerts' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Configured Search Watches</h3>
              <p className="text-slate-400 text-sm mt-0.5">Control filters handled by your backend scrapers.</p>
            </div>

            <div className="divide-y divide-slate-100">
              <div className="py-4 flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">Remote Python Engineers</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Scanning RemoteOK and LinkedIn hourly</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-bold rounded-md">
                  Active
                </span>
              </div>
              <div className="py-4 flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">Laravel Core Architect Roles</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Scanning Indeed daily</p>
                </div>
                <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-400 text-xs font-bold rounded-md">
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