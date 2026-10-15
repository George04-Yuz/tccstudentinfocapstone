import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import {
  AttendanceRecord,
  AuditLogEntry,
  Course,
  GradeItem,
  Instructor,
  NewsItem,
  PushNotification,
  RolePermissions,
  Student,
} from '../types';
import { apiUrl } from './apiUrl';

export interface SharedAppState {
  students: Student[];
  courses: Course[];
  instructors: Instructor[];
  grades: GradeItem[];
  attendanceRecords: AttendanceRecord[];
  auditLogs: AuditLogEntry[];
  notifications: PushNotification[];
  newsList: NewsItem[];
  permissions: Record<string, RolePermissions>;
}

export type SharedSyncStatus = 'connecting' | 'synced' | 'syncing' | 'offline';

const LOCAL_CACHE_KEY = 'tcc_shared_app_state';
const POLL_INTERVAL_MS = 3000;

function readLocalCache<T>(fallback: T): T {
  try {
    const cached = localStorage.getItem(LOCAL_CACHE_KEY);
    return cached ? (JSON.parse(cached) as T) : fallback;
  } catch (error) {
    console.error('Unable to read the local app-state cache', error);
    return fallback;
  }
}

function resolveUpdate<T>(update: SetStateAction<T>, current: T): T {
  return typeof update === 'function' ? (update as (previous: T) => T)(current) : update;
}

export function useSharedAppState(initialState: SharedAppState) {
  const [state, setState] = useState(() => readLocalCache(initialState));
  const [syncStatus, setSyncStatus] = useState<SharedSyncStatus>('connecting');
  const stateRef = useRef(state);
  const lastSyncedJsonRef = useRef('');
  const lastUpdatedAtRef = useRef('');
  const initializedRef = useRef(false);

  useEffect(() => {
    stateRef.current = state;
    try {
      localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Unable to cache app state locally', error);
    }
  }, [state]);

  useEffect(() => {
    let isMounted = true;

    const readRemoteState = async () => {
      const response = await fetch(apiUrl('app-state'), { cache: 'no-store' });
      if (!response.ok) throw new Error(`Shared state returned ${response.status}`);
      return response.json() as Promise<{ state: SharedAppState | null; updatedAt: string | null } | null>;
    };

    const writeRemoteState = async (snapshot: SharedAppState) => {
      const response = await fetch(apiUrl('app-state'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(snapshot),
      });
      if (!response.ok) throw new Error(`Shared state save returned ${response.status}`);
      return response.json() as Promise<{ updatedAt: string }>;
    };

    const poll = async () => {
      try {
        const remote = await readRemoteState();
        if (!isMounted) return;

        if (!remote?.state) {
          const snapshot = stateRef.current;
          const saved = await writeRemoteState(snapshot);
          if (!isMounted) return;
          lastSyncedJsonRef.current = JSON.stringify(snapshot);
          lastUpdatedAtRef.current = saved.updatedAt;
        } else if (
          remote.updatedAt !== lastUpdatedAtRef.current &&
          JSON.stringify(stateRef.current) === lastSyncedJsonRef.current
        ) {
          const remoteJson = JSON.stringify(remote.state);
          if (remoteJson !== lastSyncedJsonRef.current) setState(remote.state);
          lastSyncedJsonRef.current = remoteJson;
          lastUpdatedAtRef.current = remote.updatedAt || '';
        }

        initializedRef.current = true;
        setSyncStatus('synced');
      } catch (error) {
        console.warn('Shared app-state sync is unavailable:', error);
        if (!isMounted) return;
        initializedRef.current = true;
        lastSyncedJsonRef.current ||= JSON.stringify(stateRef.current);
        setSyncStatus('offline');
      }
    };

    void poll();
    const interval = setInterval(() => void poll(), POLL_INTERVAL_MS);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!initializedRef.current) return;
    const snapshotJson = JSON.stringify(state);
    if (snapshotJson === lastSyncedJsonRef.current) return;

    const timeout = setTimeout(async () => {
      try {
        setSyncStatus('syncing');
        const response = await fetch(apiUrl('app-state'), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: snapshotJson,
        });
        if (!response.ok) throw new Error(`Shared state save returned ${response.status}`);
        const saved = await response.json() as { updatedAt: string };
        lastSyncedJsonRef.current = snapshotJson;
        lastUpdatedAtRef.current = saved.updatedAt;
        setSyncStatus('synced');
      } catch (error) {
        console.warn('Unable to save shared app state:', error);
        setSyncStatus('offline');
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [state]);

  const setStudents: Dispatch<SetStateAction<Student[]>> = (update) => {
    setState((current) => ({ ...current, students: resolveUpdate(update, current.students) }));
  };
  const setCourses: Dispatch<SetStateAction<Course[]>> = (update) => {
    setState((current) => ({ ...current, courses: resolveUpdate(update, current.courses) }));
  };
  const setInstructors: Dispatch<SetStateAction<Instructor[]>> = (update) => {
    setState((current) => ({ ...current, instructors: resolveUpdate(update, current.instructors) }));
  };
  const setGrades: Dispatch<SetStateAction<GradeItem[]>> = (update) => {
    setState((current) => ({ ...current, grades: resolveUpdate(update, current.grades) }));
  };
  const setAttendanceRecords: Dispatch<SetStateAction<AttendanceRecord[]>> = (update) => {
    setState((current) => ({ ...current, attendanceRecords: resolveUpdate(update, current.attendanceRecords) }));
  };
  const setAuditLogs: Dispatch<SetStateAction<AuditLogEntry[]>> = (update) => {
    setState((current) => ({ ...current, auditLogs: resolveUpdate(update, current.auditLogs) }));
  };
  const setNotifications: Dispatch<SetStateAction<PushNotification[]>> = (update) => {
    setState((current) => ({ ...current, notifications: resolveUpdate(update, current.notifications) }));
  };
  const setNewsList: Dispatch<SetStateAction<NewsItem[]>> = (update) => {
    setState((current) => ({ ...current, newsList: resolveUpdate(update, current.newsList) }));
  };
  const setPermissions: Dispatch<SetStateAction<Record<string, RolePermissions>>> = (update) => {
    setState((current) => ({ ...current, permissions: resolveUpdate(update, current.permissions) }));
  };

  return {
    state,
    setters: {
      setStudents,
      setCourses,
      setInstructors,
      setGrades,
      setAttendanceRecords,
      setAuditLogs,
      setNotifications,
      setNewsList,
      setPermissions,
    },
    syncStatus,
  };
}