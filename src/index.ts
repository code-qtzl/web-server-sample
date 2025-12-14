import express from 'express';
import 'dotenv/config';

import apiRouter from './api/router.js';
import { middlewareLogResponses } from './api/middleware.js';
import { handlerMetrics, middlewareMetricsInc } from './api/metrics.js';

const app = express();
const PORT = process.env.PORT;

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to log non-OK responses
app.use(middlewareLogResponses);

// Middleware to count file server hits
app.use(middlewareMetricsInc);

// Serve static files from the ./src/app directory at the /app route
app.use('/app', express.static('./src/app'));

// Mount all API routes under /api namespace
app.use('/api', apiRouter);

// admin metrics endpoint
app.get('/admin/metrics', handlerMetrics);

app.listen(PORT, () => {
	console.log(`Server is running at http://localhost:${PORT}`);
});
