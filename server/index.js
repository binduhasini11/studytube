import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import summarizeRouter from './routes/summarize.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const IS_PROD = process.env.NODE_ENV === 'production';

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true }));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Too many requests. Please wait a moment and try again.' },
});
app.use('/api/', limiter);
app.use('/api', summarizeRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

if (IS_PROD) {
  const distPath = join(__dirname, '..', 'dist');
  if (existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(join(distPath, 'index.html'));
    });
  }
}

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error.' });
});

const host = IS_PROD ? '0.0.0.0' : '127.0.0.1';
app.listen(PORT, host, () => {
  console.log(`Server running on http://${host}:${PORT}`);
});
