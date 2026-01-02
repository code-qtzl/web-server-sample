import express from 'express';
import 'dotenv/config';

import apiRouter from './api/router.js';
import { errorMiddleWare, middlewareLogResponses } from './api/middleware.js';
import { handlerMetrics, middlewareMetricsInc } from './api/metrics.js';
import { handlerResetMetrics } from './api/reset.js';
import postgres from 'postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { drizzle } from 'drizzle-orm/postgres-js';
import { config } from './config.js';

const app = express();
const PORT = process.env.PORT;

const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to log non-OK responses
app.use(middlewareLogResponses);

// Middleware to count file server hits
app.use(middlewareMetricsInc);

// admin metrics endpoint
app.get('/admin/metrics', handlerMetrics);

// admin reset endpoint
app.post('/admin/reset', handlerResetMetrics);

// Mount all API routes under /api namespace
app.use('/api', apiRouter);

// Serve static files from the ./src/app directory at the /app route
app.use('/app', express.static('./src/app'));

// Error-handling middleware should be added after all other middleware and routes
app.use(errorMiddleWare);

app.listen(PORT, () => {
	console.log(`Server is running at http://localhost:${PORT}`);
});
