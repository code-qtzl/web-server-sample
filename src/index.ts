import express from 'express';
import 'dotenv/config';

import { handlerReadiness } from './api/readiness.js';
import {
	middlewareLogResponses,
	middlewareMetricsInc,
	handlerMetrics,
	handlerResetMetrics,
} from './api/middleware.js';

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

// Readiness endpoint
app.get('/healthz', handlerReadiness);

// registering handler for metrics
app.get('/metrics', handlerMetrics);

// registering handler for resetting metrics
app.get('/reset', handlerResetMetrics);

app.listen(PORT, () => {
	console.log(`Server is running at http://localhost:${PORT}`);
});
