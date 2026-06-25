import React, { useState } from 'react';
import { User, Briefcase, Bell, Settings, MapPin, Mail, Shield, Save } from 'lucide-react';

interface UserProfile {
  name: string;
  role: string;
  email: string;
  location: string;
  bio: string;
  skills: string[];
}

export default function Profile() {
  const [activeTab, setActiveTab] = useState<'info' | 'alerts'>('info');
  const [isEditing, setIsEditing] = useState(false);
  
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Zelalem',
    role: 'Full Stack Developer',
    email: 'zelalem@example.com',
    location: 'Addis Ababa, Ethiopia',
    bio: 'Building JobPulse. Passionate about automating data pipelines, web scraping with Python, and crafting seamless responsive dashboards with React and Laravel.',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Laravel', 'Python', 'PostgreSQL', 'Docker'],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
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
                <span className="flex items-center gap-1"><MapPin size={16} /> {profile.location}</span>
                <span className="flex items-center gap-1"><Mail size={16} /> {profile.email}</span>
              </div>
            </div>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition shadow-sm ${
                isEditing 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2' 
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
              }`}
            >
              {isEditing ? <><Save size={16} /> Save Changes</> : 'Edit Profile'}
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
                  <p className="text-slate-600 leading-relaxed text-sm">{profile.bio}</p>
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
                      className="w-full px-4 py-2.5 disabled:bg-slate-50 disabled:text-slate-400 border border-slate-200 rounded-xl text-slate-700 outline-none transition"
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
                      className="w-full px-4 py-2.5 disabled:bg-slate-50 disabled:text-slate-400 border border-slate-200 rounded-xl text-slate-700 outline-none transition"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right column: Technical Skills List */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Briefcase size={18} className="text-slate-400" /> Monitored Tech
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <span 
                      key={index} 
                      className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg tracking-wide border border-slate-200/40"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
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