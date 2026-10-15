import { User } from '../types';

export type EditableStaffProfile = Pick<User, 'name' | 'email' | 'department' | 'avatar'>;

const STAFF_PROFILES_KEY = 'tcc_staff_profiles';

export const loadStaffProfiles = (): Record<string, Partial<EditableStaffProfile>> => {
  try {
    const saved = localStorage.getItem(STAFF_PROFILES_KEY);
    if (!saved) return {};

    const parsed: unknown = JSON.parse(saved);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, Partial<EditableStaffProfile>>;
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