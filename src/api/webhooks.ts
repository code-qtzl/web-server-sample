import type { Request, Response } from 'express';
import { upgradeToChirpyRed } from '../db/queries/users.js';
import { config } from '../config.js';
import { getAPIKey } from './auth.js';
import { UserNotAuthenticatedError } from './errors.js';

export async function handlerWebhooks(req: Request, res: Response) {
	type WebhookRequest = {
		event: string;
		data: {
			userId: string;
		};
	};

	const apiKey = getAPIKey(req);
	if (apiKey !== config.api.polkaApiKey) {
		throw new UserNotAuthenticatedError('Invalid API key');
	}

	const body: WebhookRequest = req.body;

	if (body.event !== 'user.upgraded') {
		res.status(204).send();
		return;
	}

	await upgradeToChirpyRed(body.data.userId);

	res.status(204).send();
}
