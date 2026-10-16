import type { Express, Request, Response } from 'express';
import { readSharedAppState, SharedAppState, writeSharedAppState } from './sharedAppState.js';

export function registerSharedAppStateApi(app: Express) {
  app.use('/api', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });

  app.get('/api/app-state', async (_req: Request, res: Response) => {
    try {
      const shared = await readSharedAppState();
      res.setHeader('Cache-Control', 'no-store');
      res.json(shared);
    } catch (error) {
      console.error('Shared state read failed:', error);
      res.status(503).json({ error: 'Shared database is unavailable.' });
    }
  });

  app.put('/api/app-state', async (req: Request, res: Response) => {
    const state = req.body as SharedAppState;
    if (!state || typeof state !== 'object' || Array.isArray(state)) {
      res.status(400).json({ error: 'A valid app state object is required.' });
      return;
    }

    try {
      const updatedAt = await writeSharedAppState(state);
      res.setHeader('Cache-Control', 'no-store');
      res.json({ updatedAt });
    } catch (error) {
      console.error('Shared state write failed:', error);
      res.status(503).json({ error: 'Shared database is unavailable.' });
    }
  });
}