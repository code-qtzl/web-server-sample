import express from 'express';
import { Request, Response } from 'express';

const app = express();
const PORT = 8080;

// app.use(express.static('.'));

app.use('/app', express.static('./src/app'));

app.get('/healthz', (request, response) => {
	return response
		.set('Content-Type', 'text/plain; charset=utf-8')
		.status(200)
		.send('OK');
});

app.listen(PORT, () => {
	console.log(`Server is running at http://localhost:${PORT}`);
});
