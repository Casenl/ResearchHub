import express from 'express';
import cors from 'cors';
import { authMiddleware } from './middleware/auth';
import { researchRouter } from './routes/research';
import { sourcesRouter } from './routes/sources';
import { filesRouter } from './routes/files';
import { intelligenceRouter } from './routes/intelligence';
import { competitorsRouter } from './routes/competitors';
import { authKeysRouter } from './routes/auth-keys';

const app = express();

// Parse JSON bodies up to 75MB (base64-encoded 50MB files)
app.use(express.json({ limit: '75mb' }));

// CORS — allow all origins (agents call from various contexts)
app.use(cors({ origin: true }));

// Health check (no auth required)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// All API routes require authentication
app.use(authMiddleware);

// Mount routers
app.use('/research', researchRouter);
app.use('/research', sourcesRouter);
app.use('/research', filesRouter);
app.use('/intelligence', intelligenceRouter);
app.use('/competitors', competitorsRouter);
app.use('/auth/keys', authKeysRouter);

export { app };
