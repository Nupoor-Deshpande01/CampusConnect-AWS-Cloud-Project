import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { getCorsOptions } from './config/cors.js';
import apiRoutes from './routes/index.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Security and Parsing Middleware
app.use(cors(getCorsOptions()));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Mount API routes
app.use('/api', apiRoutes);

// Catch-all 404 handler for unknown routes
app.use(notFoundHandler);

// Centralized error handling middleware
app.use(errorHandler);

export default app;
