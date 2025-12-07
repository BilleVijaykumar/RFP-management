import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import rfpRoutes from './routes/rfp.routes';
import vendorRoutes from './routes/vendor.routes';
import proposalRoutes from './routes/proposal.routes';
import emailRoutes from './routes/email.routes';
import { startEmailPolling } from './services/email-polling.service';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/rfps', rfpRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/emails', emailRoutes);

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  
  // Start email polling if configured
  if (process.env.ENABLE_EMAIL_POLLING === 'true') {
    startEmailPolling();
  }
});

