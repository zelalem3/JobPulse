import React, { useState, useEffect } from 'react';
import {
  User,
  Briefcase,
  MapPin,
  Mail,
  Save,
  Lock,
  Plus,
  X,
  Sparkles,
  ShieldCheck,
  Zap,

  Globe,
  DollarSign,
} from 'lucide-react';

import api from '../services/axios';
import Spinner from '../components/Spinner';

interface ProfileData {
  headline?: string | null;
  bio?: string | null;
  experience_level?: string | null;
  years_of_experience?: number | null;
  location?: string | null;
  work_preference?: string | null;
  expected_salary_min?: number | null;
  expected_salary_max?: number | null;
  availability?: string | null;
  open_to_work?: boolean;
  github_url?: string | null;
  linkedin_url?: string | null;
  portfolio_url?: string | null;
  resume_path?: string | null;
}

interface UserProfile {
  id?: number;
  name: string;
  role?: string;
  email: string;
  skills: string[];
  telegram_username?: string | null;
  telegram_chat_id?: string | number | null;
  telegram_connected_at?: string | null;
  telegram_enabled?: boolean;
  profile: ProfileData;
}

const emptyProfile: ProfileData = {
  headline: '',
  bio: '',
  experience_level: '',
  years_of_experience: null,
  location: '',
  work_preference: '',
  expected_salary_min: null,
  expected_salary_max: null,
  availability: '',
  open_to_work: true,
  github_url: '',
  linkedin_url: '',
  portfolio_url: '',
  resume_path: '',
};

export default function Profile() {
  const [activeTab, setActiveTab] = useState<'info' | 'security' | 'telegram'>('info');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    role: '',
    email: '',
    skills: [],
    telegram_username: null,
    telegram_chat_id: null,
    telegram_connected_at: null,
    telegram_enabled: false,
    profile: { ...emptyProfile },
  });

  const [newSkill, setNewSkill] = useState('');

  // Password state
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
      const data = res.data.user ?? res.data;

      const formattedSkills = Array.isArray(data.skills)
        ? data.skills.map((skill: any) =>
            typeof skill === 'object' && skill !== null ? skill.name : skill
          )
        : [];

      const profileData = data.profile ?? {};

      setProfile({
        id: data.id,
        name: data.name || '',
        role: data.role || '',
        email: data.email || '',
        skills: formattedSkills,
        telegram_username: data.telegram_username ?? null,
        telegram_chat_id: data.telegram_chat_id ?? null,
        telegram_connected_at: data.telegram_connected_at ?? null,
        telegram_enabled: data.telegram_enabled ?? false,
        profile: {
          headline: profileData.headline ?? '',
          bio: profileData.bio ?? data.bio ?? '',
          experience_level: profileData.experience_level ?? '',
          years_of_experience: profileData.years_of_experience ?? null,
          location: profileData.location ?? data.location ?? '',
          work_preference: profileData.work_preference ?? '',
          expected_salary_min: profileData.expected_salary_min ?? null,
          expected_salary_max: profileData.expected_salary_max ?? null,
          availability: profileData.availability ?? '',
          open_to_work: profileData.open_to_work ?? true,
          github_url: profileData.github_url ?? '',
          linkedin_url: profileData.linkedin_url ?? '',
          portfolio_url: profileData.portfolio_url ?? '',
          resume_path: profileData.resume_path ?? '',
        },
      });
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to load profile.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'number' ? (value === '' ? null : Number(value)) : value;

    setProfile((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        [name]: finalValue,
      },
    }));
  };

  const handleAddSkill = () => {
    const skill = newSkill.trim();
    if (!skill || profile.skills.includes(skill)) {
      setNewSkill('');
      return;
    }
    setProfile((prev) => ({
      ...prev,
      skills: [...prev.skills, skill],
    }));
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const payload = {
        name: profile.name,
        email: profile.email,
        role: profile.role,
        skills: profile.skills,
        // Profile fields
        headline: profile.profile.headline,
        bio: profile.profile.bio,
        experience_level: profile.profile.experience_level,
        years_of_experience: profile.profile.years_of_experience,
        location: profile.profile.location,
        work_preference: profile.profile.work_preference,
        expected_salary_min: profile.profile.expected_salary_min,
        expected_salary_max: profile.profile.expected_salary_max,
        availability: profile.profile.availability,
        open_to_work: profile.profile.open_to_work,
        github_url: profile.profile.github_url,
        linkedin_url: profile.profile.linkedin_url,
        portfolio_url: profile.profile.portfolio_url,
      };

      const res = await api.put('/api/profile', payload);
      const savedUser = res.data.user;

      const updatedSkills = savedUser?.skills
        ? savedUser.skills.map((s: any) => (typeof s === 'object' && s !== null ? s.name : s))
        : profile.skills;

      setProfile((prev) => ({
        ...prev,
        skills: updatedSkills,
        profile: {
          ...prev.profile,
          ...(savedUser?.profile ?? {}),
        },
      }));

      setMessage({ type: 'success', text: res.data.message || 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update profile.',
      });
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
      setPassMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update password.',
      });
    } finally {
      setPassLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Spinner size="lg" label="Loading your profile..." card />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 font-sans selection:bg-emerald-900 selection:text-white">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Feedback */}
        {message && (
          <div
            className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-3 backdrop-blur-xl shadow-xl ${
              message.type === 'success'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80'
                : 'bg-rose-950/80 text-rose-300 border border-rose-800/80'
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                message.type === 'success' ? 'bg-emerald-400' : 'bg-rose-400'
              } animate-ping`}
            />
            {message.text}
          </div>
        )}

        {/* Header Card */}
        <div className="bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-emerald-950/30 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-800/80 overflow-hidden relative">
          <div className="h-40 bg-gradient-to-r from-emerald-950/50 via-blue-950/40 to-slate-900 relative border-b border-slate-800/80">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.1),transparent)]" />
          </div>

          <div className="px-8 pb-8 relative flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-16">
            <div className="w-32 h-32 rounded-3xl bg-slate-900 border-4 border-slate-950 shadow-2xl flex items-center justify-center text-emerald-400">
              <User size={60} className="text-emerald-400" />
            </div>

            <div className="flex-1 pt-4 sm:pt-0">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black tracking-tight text-white">{profile.name || 'Your Name'}</h1>
                <span className="px-3 py-1 bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-xs font-black rounded-full flex items-center gap-1">
                  <Zap size={12} className="text-emerald-400" /> Pro Member
                </span>
              </div>
              <p className="text-slate-400 font-semibold mt-1">
                {profile.profile.headline || profile.role || 'Add a headline'}
              </p>

              <div className="flex flex-wrap items-center gap-6 mt-3 text-sm text-slate-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <MapPin size={16} className="text-emerald-500" />
                  {profile.profile.location || 'Add location'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail size={16} className="text-emerald-500" />
                  {profile.email}
                </span>
              </div>
            </div>

            {activeTab === 'info' && (
              <button
                type="button"
                onClick={() => {
                  if (isEditing) {
                    handleSaveProfile();
                  } else {
                    setIsEditing(true);
                  }
                }}
                disabled={saving}
                className={`px-6 py-3 rounded-2xl text-sm font-black transition-all duration-300 shadow-xl flex items-center gap-2 ${
                  isEditing
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/40'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800'
                }`}
              >
                {isEditing ? (
                  <>
                    <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                  </>
                ) : (
                  'Edit Profile'
                )}
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800/80 gap-8">
          {(['info', 'telegram', 'security'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-bold border-b-2 transition-all duration-300 flex items-center gap-2 ${
                activeTab === tab
                  ? 'border-emerald-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'security' && <Lock size={16} />}
              {tab === 'info' && 'Account Details'}
              {tab === 'telegram' && 'Telegram Alerts'}
              {tab === 'security' && 'Security'}
            </button>
          ))}
        </div>

        {/* ===================== ACCOUNT DETAILS TAB ===================== */}
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              {/* About + Basic Info */}
              <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-slate-800/80 space-y-6">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Sparkles size={18} className="text-emerald-400" /> About Me
                </h3>

                {isEditing ? (
                  <textarea
                    name="bio"
                    value={profile.profile.bio || ''}
                    onChange={handleProfileChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-2xl focus:ring-1 focus:ring-emerald-500 text-slate-200 outline-none resize-none"
                  />
                ) : (
                  <p className="text-slate-300 leading-relaxed text-sm bg-slate-950/40 p-4 rounded-2xl border border-slate-800/50">
                    {profile.profile.bio || 'No bio provided yet.'}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      disabled={!isEditing}
                      value={profile.name}
                      onChange={handleUserChange}
                      className="w-full px-4 py-3 bg-slate-950/80 disabled:bg-slate-950/40 disabled:text-slate-400 border border-slate-800 rounded-2xl text-slate-200 outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      disabled={!isEditing}
                      value={profile.email}
                      onChange={handleUserChange}
                      className="w-full px-4 py-3 bg-slate-950/80 disabled:bg-slate-950/40 disabled:text-slate-400 border border-slate-800 rounded-2xl text-slate-200 outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-2">
                      Headline
                    </label>
                    <input
                      type="text"
                      name="headline"
                      disabled={!isEditing}
                      value={profile.profile.headline || ''}
                      onChange={handleProfileChange}
                      placeholder="e.g. Senior Laravel Developer"
                      className="w-full px-4 py-3 bg-slate-950/80 disabled:bg-slate-950/40 disabled:text-slate-400 border border-slate-800 rounded-2xl text-slate-200 outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      disabled={!isEditing}
                      value={profile.profile.location || ''}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-3 bg-slate-950/80 disabled:bg-slate-950/40 disabled:text-slate-400 border border-slate-800 rounded-2xl text-slate-200 outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-2">
                      Experience Level
                    </label>
                    <select
                      name="experience_level"
                      disabled={!isEditing}
                      value={profile.profile.experience_level || ''}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-3 bg-slate-950/80 disabled:bg-slate-950/40 disabled:text-slate-400 border border-slate-800 rounded-2xl text-slate-200 outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                    >
                      <option value="">Select level</option>
                      <option value="junior">Junior</option>
                      <option value="mid">Mid-level</option>
                      <option value="senior">Senior</option>
                      <option value="lead">Lead</option>
                      <option value="principal">Principal</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-2">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      name="years_of_experience"
                      disabled={!isEditing}
                      value={profile.profile.years_of_experience ?? ''}
                      onChange={handleProfileChange}
                      min={0}
                      max={60}
                      className="w-full px-4 py-3 bg-slate-950/80 disabled:bg-slate-950/40 disabled:text-slate-400 border border-slate-800 rounded-2xl text-slate-200 outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Links & Preferences */}
              <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-slate-800/80 space-y-6">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Globe size={18} className="text-emerald-400" /> Links & Preferences
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-2">
                      GitHub
                    </label>
                    <input
                      type="url"
                      name="github_url"
                      disabled={!isEditing}
                      value={profile.profile.github_url || ''}
                      onChange={handleProfileChange}
                      placeholder="https://github.com/username"
                      className="w-full px-4 py-3 bg-slate-950/80 disabled:bg-slate-950/40 disabled:text-slate-400 border border-slate-800 rounded-2xl text-slate-200 outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-2">
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      name="linkedin_url"
                      disabled={!isEditing}
                      value={profile.profile.linkedin_url || ''}
                      onChange={handleProfileChange}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full px-4 py-3 bg-slate-950/80 disabled:bg-slate-950/40 disabled:text-slate-400 border border-slate-800 rounded-2xl text-slate-200 outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-2">
                      Portfolio
                    </label>
                    <input
                      type="url"
                      name="portfolio_url"
                      disabled={!isEditing}
                      value={profile.profile.portfolio_url || ''}
                      onChange={handleProfileChange}
                      placeholder="https://yourportfolio.com"
                      className="w-full px-4 py-3 bg-slate-950/80 disabled:bg-slate-950/40 disabled:text-slate-400 border border-slate-800 rounded-2xl text-slate-200 outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-2">
                      Work Preference
                    </label>
                    <select
                      name="work_preference"
                      disabled={!isEditing}
                      value={profile.profile.work_preference || ''}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-3 bg-slate-950/80 disabled:bg-slate-950/40 disabled:text-slate-400 border border-slate-800 rounded-2xl text-slate-200 outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                    >
                      <option value="">Any</option>
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="onsite">Onsite</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills Sidebar */}
            <div className="space-y-6">
              <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-slate-800/80 space-y-5">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Briefcase size={18} className="text-emerald-400" /> Skills
                </h3>

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
                      className="flex-1 px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-2xl text-sm font-semibold text-slate-200 outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-sm font-black"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-1">
                  {profile.skills.length > 0 ? (
                    profile.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3.5 py-1.5 bg-emerald-950/60 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-800/60 flex items-center gap-2"
                      >
                        {skill}
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="text-emerald-400 hover:text-rose-400"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 font-semibold italic">No skills added yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TELEGRAM TAB ===================== */}
        {activeTab === 'telegram' && (
          <div className="max-w-xl bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 border border-slate-800/80">
            <p className="text-slate-400 text-sm">
              Telegram integration UI goes here. (You already have the backend fields ready.)
            </p>
          </div>
        )}

        {/* ===================== SECURITY TAB ===================== */}
        {activeTab === 'security' && (
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-slate-800/80 max-w-xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 rounded-2xl">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Change Password</h3>
                <p className="text-slate-400 text-xs font-semibold mt-0.5">
                  Ensure your account is using a secure password.
                </p>
              </div>
            </div>

            {passMessage && (
              <div
                className={`p-4 rounded-2xl text-xs font-bold ${
                  passMessage.type === 'success'
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80'
                    : 'bg-rose-950/80 text-rose-300 border border-rose-800/80'
                }`}
              >
                {passMessage.text}
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-5">
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  name="current_password"
                  required
                  value={passwords.current_password}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-slate-200 outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                />
              </div>
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  value={passwords.password}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-slate-200 outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                />
              </div>
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="password_confirmation"
                  required
                  value={passwords.password_confirmation}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-slate-200 outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                />
              </div>
              <button
                type="submit"
                disabled={passLoading}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-sm font-black transition-all disabled:opacity-50"
              >
                {passLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}