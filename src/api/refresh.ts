import { Request, Response } from 'express';
import { makeJWT, getBearerToken } from '../auth.js';
import { userForRefreshToken } from '../db/queries/refreshTokens.js';
import { UserNotAuthenticatedError } from './errors.js';
import { config } from '../config.js';

export async function refreshHandler(req: Request, res: Response) {
	// Get the refresh token from the Authorization header
	let refreshToken = getBearerToken(req);

	// Get user from refresh token - will return null if token is invalid, expired, or revoked
	const result = await userForRefreshToken(refreshToken);
	if (!result) {
		// Respond with 401 if token doesn't exist, is expired, or is revoked
		throw new UserNotAuthenticatedError('Invalid or expired refresh token');
	}
	const user = result.user;
	// Generate a new access token (JWT) that expires in 1 hour
	const accessToken = makeJWT(
		user.id,
		config.jwt.defaultDuration, // 1 hour in seconds
		config.jwt.secret,
	);

	// Respond with 200 and the new access token
	res.status(200).json({
		token: accessToken,
	});
}
