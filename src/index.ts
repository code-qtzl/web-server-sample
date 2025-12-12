import express from 'express';
import 'dotenv/config';

import { handlerReadiness } from './api/readiness.js';
import { middlewareLogResponses } from './api/middleware.js';

const app = express();
const PORT = process.env.PORT;

// Middleware to log non-OK responses
app.use(middlewareLogResponses);

// Serve static files from the ./src/app directory at the /app route
app.use('/app', express.static('./src/app'));

// Readiness endpoint
app.get('/healthz', handlerReadiness);

app.listen(PORT, () => {
	console.log(`Server is running at http://localhost:${PORT}`);
});
