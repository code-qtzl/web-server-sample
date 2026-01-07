import { Request, Response } from 'express';
import { getBearerToken } from '../auth.js';
import {
	revokeRefreshToken,
	userForRefreshToken,
} from '../db/queries/refreshTokens.js';
import { UserNotAuthenticatedError } from './errors.js';

export async function handlerRevoke(req: Request, res: Response) {
	// Get the refresh token from the Authorization header
	const refreshToken = getBearerToken(req);

	// Check if the token exists and is valid before revoking
	const validToken = await userForRefreshToken(refreshToken);
	if (!validToken) {
		// Return 401 if token doesn't exist, is already revoked, or is expired
		throw new UserNotAuthenticatedError('Invalid or expired refresh token');
	}

	// Revoke the refresh token
	await revokeRefreshToken(refreshToken);

	// Return 204 No Content - successful but no response body
	res.status(204).send();
}
