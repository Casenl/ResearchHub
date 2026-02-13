import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { limiter } from './middleware/rate-limit';
import { authMiddleware } from './middleware/auth';
import { researchRouter } from './routes/research';
import { sourcesRouter } from './routes/sources';
import { filesRouter } from './routes/files';
import { intelligenceRouter } from './routes/intelligence';
import { competitorsRouter } from './routes/competitors';
import { authKeysRouter } from './routes/auth-keys';

const app = express();

// Security headers
app.use(helmet());

// JSON body parsing — 75MB limit only for file upload route, 1MB for everything else
app.use((req, res, next) => {
  const isFileUpload = req.method === 'POST' && /\/research\/[^/]+\/files$/.test(req.path);
  const limit = isFileUpload ? '75mb' : '1mb';
  express.json({ limit })(req, res, next);
});

// CORS — restrict to known origins (configurable via env)
const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins.length > 0
    ? (origin, callback) => {
        // Allow requests with no origin (server-to-server, curl, agents)
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      }
    : true, // Fallback to open if no origins configured (dev only)
}));

// Rate limiting — 100 requests per minute per IP
app.use(limiter);

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
