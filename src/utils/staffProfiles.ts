import { User } from '../types';

export type EditableStaffProfile = Pick<User, 'name' | 'email' | 'department' | 'avatar'>;

const STAFF_PROFILES_KEY = 'tcc_staff_profiles';
const DEFAULT_EMAIL_MIGRATIONS: Record<string, { from: string; to: string }> = {
  'usr-1': { from: 'pj.monsanto@tcc.edu', to: 'xernex01@gmail.com' },
  'usr-2': { from: 'c.rafaila@tcc.edu', to: 'xernex02@gmail.com' },
  'usr-3': { from: 'p.bote@tcc.edu', to: 'xernex03@gmail.com' },
  'usr-4': { from: 's.jenkins@tcc.edu', to: 'xernex04@gmail.com' },
};

export const loadStaffProfiles = (): Record<string, Partial<EditableStaffProfile>> => {
  try {
    const saved = localStorage.getItem(STAFF_PROFILES_KEY);
    if (!saved) return {};

    const parsed: unknown = JSON.parse(saved);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const profiles = parsed as Record<string, Partial<EditableStaffProfile>>;
      Object.entries(DEFAULT_EMAIL_MIGRATIONS).forEach(([userId, migration]) => {
        if (profiles[userId]?.email === migration.from) {
          profiles[userId] = { ...profiles[userId], email: migration.to };
        }
      });
      return profiles;
    }
  } catch (error) {
    console.error('Failed to load staff profiles', error);
  }
  return {};
};

export const loadStaffProfile = (userId: string): Partial<EditableStaffProfile> =>
  loadStaffProfiles()[userId] || {};

export const saveStaffProfile = (userId: string, profile: EditableStaffProfile): boolean => {
  try {
    const profiles = loadStaffProfiles();
    profiles[userId] = profile;
    localStorage.setItem(STAFF_PROFILES_KEY, JSON.stringify(profiles));
    return true;
  } catch (error) {
    console.error('Failed to save staff profile', error);
    return false;
  }
};