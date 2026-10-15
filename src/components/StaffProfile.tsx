import React, { useState } from 'react';
import {
  Building2,
  Camera,
  CheckCircle2,
  Mail,
  Pencil,
  Save,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react';
import { Department, User } from '../types';
import { EditableStaffProfile } from '../utils/staffProfiles';

interface StaffProfileProps {
  currentUser: User;
  onSave: (profile: EditableStaffProfile) => boolean;
}

const departments: Department[] = [
  'BS Information Technology',
  'BS Business Administration',
  'BS Criminology',
];

const profileFieldClass = 'w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 disabled:cursor-default disabled:bg-slate-100 dark:disabled:bg-slate-900';

export const StaffProfile: React.FC<StaffProfileProps> = ({ currentUser, onSave }) => {
  const [profile, setProfile] = useState<EditableStaffProfile>(() => ({
    name: currentUser.name,
    email: currentUser.email,
    department: currentUser.department,
    avatar: currentUser.avatar,
  }));
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Choose an image file for your profile photo.');
      return;
    }
    if (file.size > 1.5 * 1024 * 1024) {
      setError('Choose an image smaller than 1.5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProfile((current) => ({ ...current, avatar: reader.result as string }));
        setError('');
        setSaved(false);
      }
    };
    reader.onerror = () => setError('The selected image could not be read.');
    reader.readAsDataURL(file);
  };

  const handleCancel = () => {
    setProfile({
      name: currentUser.name,
      email: currentUser.email,
      department: currentUser.department,
      avatar: currentUser.avatar,
    });
    setIsEditing(false);
    setError('');
    setSaved(false);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const updated = { ...profile, name: profile.name.trim(), email: profile.email.trim() };
    if (!updated.name || !updated.email) {
      setError('Name and email are required.');
      return;
    }
    if (!onSave(updated)) {
      setError('Your profile could not be saved in this browser. Try a smaller photo.');
      return;
    }
    setProfile(updated);
    setIsEditing(false);
    setError('');
    setSaved(true);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-blue-600 dark:text-blue-400">Account</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">My Profile</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">View and update your staff account information.</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button type="button" onClick={handleCancel} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-4 w-4" /> Cancel
              </button>
              <button type="submit" form="staff-profile-form" className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800">
                <Save className="h-4 w-4" /> Save changes
              </button>
            </>
          ) : (
            <button type="button" onClick={() => { setIsEditing(true); setSaved(false); }} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700 dark:bg-blue-700 dark:hover:bg-blue-600">
              <Pencil className="h-4 w-4" /> Edit profile
            </button>
          )}
        </div>
      </div>

      {saved && (
        <div role="status" className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4" /> Profile changes saved.
        </div>
      )}
      {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">{error}</p>}

      <form id="staff-profile-form" onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col items-center text-center">
            <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-slate-100 bg-slate-100 dark:border-slate-800 dark:bg-slate-800">
              {profile.avatar ? (
                <img src={profile.avatar} alt={`${profile.name} profile`} className="h-full w-full object-cover" />
              ) : (
                <UserRound className="m-auto h-full w-12 text-slate-400" />
              )}
            </div>
            {isEditing && (
              <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                <Camera className="h-4 w-4" /> Change photo
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="sr-only" />
              </label>
            )}
            <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">{profile.name}</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{profile.email}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              <ShieldCheck className="h-3.5 w-3.5" /> {currentUser.role}
            </span>
          </div>
          <div className="mt-5 border-t border-slate-200 pt-4 text-sm dark:border-slate-800">
            <div className="flex items-start gap-2 text-slate-500 dark:text-slate-400">
              <Building2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{profile.department}</span>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5 border-b border-slate-200 pb-4 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Account information</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Your role is managed by the system administrator.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
              Full name
              <input value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} disabled={!isEditing} required className={`${profileFieldClass} mt-1.5`} />
            </label>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
              Email address
              <span className="relative mt-1.5 block">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input type="email" value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} disabled={!isEditing} required className={`${profileFieldClass} pl-9`} />
              </span>
            </label>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
              Department
              <select value={profile.department} onChange={(event) => setProfile({ ...profile, department: event.target.value as Department })} disabled={!isEditing} className={`${profileFieldClass} mt-1.5`}>
                {departments.map((department) => <option key={department} value={department}>{department}</option>)}
              </select>
            </label>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
              Account role
              <input value={currentUser.role} disabled className={`${profileFieldClass} mt-1.5`} />
            </label>
          </div>
        </section>
      </form>
    </div>
  );
};