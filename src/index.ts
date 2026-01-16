import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { setupSwagger } from './config/swagger.js';
import {prisma} from './config/database.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Get PORT from environment variable
const PORT = process.env.PORT || 3000;

// Middlewares
// Enable CORS
app.use(cors());

// Parse JSON request body
app.use(express.json());

// Parse URL-encoded request body
app.use(express.urlencoded({ extended: true }));

// Request logger middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});


// Swagger Documentation
setupSwagger(app);  // ← Setup Swagger

// Routes
/**
 * @swagger
 * /:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns API status and basic information
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: API is running successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Ready
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2026-01-09T12:00:00.000Z
 *                 environment:
 *                   type: string
 *                   example: development
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 */

// Routes
// Health check endpoint
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    message: 'Ready',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

/**
 * @swagger
 * /info:
 *   get:
 *     summary: Get system information
 *     description: Returns detailed system diagnostics
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: System information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 appName:
 *                   type: string
 *                 version:
 *                   type: string
 *                 nodeVersion:
 *                   type: string
 *                 platform:
 *                   type: string
 *                 uptime:
 *                   type: number
 *                 memoryUsage:
 *                   type: object
 */

// API info endpoint
app.get('/info', (_req: Request, res: Response) => {
  res.status(200).json({
    appName: 'Backend Development Project API',
    nodeVersion: process.version,
    platform: process.platform,    
    uptime: process.uptime(),
    memoryUsage: {
      rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`
    }
  });
});

/**
 * @swagger
 * /db-test:
 *   get:
 *     summary: Test database connection
 *     description: Verify Prisma can connect to Supabase PostgreSQL
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Database connection successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 database:
 *                   type: string
 *                 userCount:
 *                   type: integer
 *                 postCount:
 *                   type: integer
 *                 timestamp:
 *                   type: string
 *       500:
 *         description: Database connection failed
 */
app.get('/db-test', async (_req: Request, res: Response) => {
  try {
    // Test database connection
    await prisma.$connect();
    
    // Count records in database
    const userCount = await prisma.user.count();
    const postCount = await prisma.post.count();
    
    res.status(200).json({
      message: 'Database connection successful',
      database: 'Supabase PostgreSQL',
      userCount,
      postCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(500).json({
      error: 'Database connection failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 404 handler (route not found)
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});


// Error Handler (Global)
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(' Server is running!');
  console.log(` URL: http://localhost:${PORT}`);
  console.log(`API Docs: http://localhost:${PORT}/api-docs`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` Module System: ES Modules`);
  console.log(' Press CTRL+C to stop\n');
});

export default app;
