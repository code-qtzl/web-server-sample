import express from 'express';
import 'dotenv/config';

import { handlerReadiness } from './api/readiness.js';

const app = express();
const PORT = process.env.PORT;

app.use('/app', express.static('./src/app'));

app.get('/healthz', handlerReadiness);

app.listen(PORT, () => {
	console.log(`Server is running at http://localhost:${PORT}`);
});
