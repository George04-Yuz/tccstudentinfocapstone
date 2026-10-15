import { Capacitor } from '@capacitor/core';

const vercelApiOrigin = 'https://tccstudentinfocapstone.vercel.app';
const configuredApiOrigin = import.meta.env.VITE_API_BASE_URL?.trim();
const apiOrigin = (configuredApiOrigin || (Capacitor.isNativePlatform() ? vercelApiOrigin : '')).replace(/\/$/, '');

export const apiUrl = (path: string): string =>
  `${apiOrigin}/api/${path.replace(/^\/+/, '')}`;