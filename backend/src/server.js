import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { connectDb } from './config/db.js';
import api from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: env.corsOrigin.split(',').map((s) => s.trim()),
  credentials: true
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/v1', api);

app.use('/api', (_req, res) => {
  res.status(404).json({ ok: false, message: 'API route not found.' });
});

app.use(errorHandler);

connectDb()
  .then(() => {
    app.listen(env.port, () => {
      console.log(`MUIS API listening on http://localhost:${env.port}`);
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
