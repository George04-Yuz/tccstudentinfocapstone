import { ThemeMode } from '../types';

const THEME_STORAGE_KEY = 'tcc_sis_theme_preference';

/**
 * Get stored theme from localStorage or fallback to 'system'
 */
export function getStoredTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved;
    }
  } catch (e) {
    console.error('Failed to read theme from localStorage', e);
  }
  return 'system';
}

/**
 * Resolve effective theme ('light' or 'dark') based on setting
 */
export function getEffectiveTheme(theme: ThemeMode): 'light' | 'dark' {
  if (theme === 'system') {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }
  return theme;
}

/**
 * Apply the theme to document.documentElement and sync with Tailwind CSS dark classes
 */
export function applyTheme(theme: ThemeMode): void {
  if (typeof document === 'undefined') return;

  const effective = getEffectiveTheme(theme);
  const root = document.documentElement;

  if (effective === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
    root.style.colorScheme = 'light';
  }
}

/**
 * Save theme preference to localStorage and apply it
 */
export function saveTheme(theme: ThemeMode): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (e) {
    console.error('Failed to save theme to localStorage', e);
  }
  applyTheme(theme);
}

/**
 * Initialize theme listener and set initial classes
 */
export function initTheme(): () => void {
  const current = getStoredTheme();
  applyTheme(current);

  if (typeof window !== 'undefined' && window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const activeTheme = getStoredTheme();
      if (activeTheme === 'system') {
        applyTheme('system');
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }

  return () => {};
}
