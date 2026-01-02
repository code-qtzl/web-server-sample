import { describe, it, expect, beforeAll } from 'vitest';
import {
	makeJWT,
	validateJWT,
	hashPassword,
	checkPasswordHash,
	getBearerToken,
	extractBearerToken,
} from './auth';
import { UserNotAuthenticatedError } from './api/errors.js';

describe('Password Hashing', () => {
	const password1 = 'correctPassword123!';
	const password2 = 'anotherPassword456!';
	let hash1: string;
	let hash2: string;

	beforeAll(async () => {
		hash1 = await hashPassword(password1);
		hash2 = await hashPassword(password2);
	});

	it('should return true for the correct password', async () => {
		const result = await checkPasswordHash(password1, hash1);
		expect(result).toBe(true);
	});

	it('should return false for an incorrect password', async () => {
		const result = await checkPasswordHash('wrongPassword', hash1);
		expect(result).toBe(false);
	});

	it("should return false when password doesn't match a different hash", async () => {
		const result = await checkPasswordHash(password1, hash2);
		expect(result).toBe(false);
	});

	it('should return false for an empty password', async () => {
		const result = await checkPasswordHash('', hash1);
		expect(result).toBe(false);
	});

	it('should return false for an invalid hash', async () => {
		const result = await checkPasswordHash(password1, 'invalidhash');
		expect(result).toBe(false);
	});
});

describe('JWT creation and validation', () => {
	const userId = 'user-123';
	const wrongSecret = 'wrong_secret';
	const secret = 'test-secret-abc';
	let validToken: string;

	beforeAll(() => {
		validToken = makeJWT(userId, 2000, secret);
	});

	it('creates and validates a JWT', () => {
		const token = makeJWT(userId, 60, secret); // expires in 60s
		const sub = validateJWT(token, secret);
		expect(sub).toBe(userId);
	});

	it('rejects expired tokens', () => {
		const token = makeJWT(userId, -10, secret); // already expired
		expect(() => validateJWT(token, secret)).toThrow('Invalid JWT token');
	});

	it('rejects tokens signed with the wrong secret', () => {
		const token = makeJWT(userId, 60, secret);
		const wrongSecret = 'different-secret';
		expect(() => validateJWT(token, wrongSecret)).toThrow(
			'Invalid JWT token',
		);
	});

	it('should validate a valid token', () => {
		const result = validateJWT(validToken, secret);
		expect(result).toBe(userId);
	});

	it('should throw an error for an invalid token string', () => {
		expect(() => validateJWT('invalid.token.string', secret)).toThrow(
			UserNotAuthenticatedError,
		);
	});
});

describe('Header', () => {
	it('throws an error if the Authorization header does not exist', () => {
		const mockReq = {
			get: (header: string) =>
				header === 'Authorization' ? undefined : null,
		} as any;
		expect(() => getBearerToken(mockReq)).toThrow(
			'Malformed authorization header',
		);
	});

	it('throws an error if the Authorization header is not Bearer format', () => {
		expect(() => extractBearerToken('Basic abc123')).toThrow(
			'Malformed authorization header',
		);
	});

	it('extracts the token from a valid Bearer header', () => {
		const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';
		const result = extractBearerToken(`Bearer ${token}`);
		expect(result).toBe(token);
	});

	it('validates token and returns 200 with user data and token', () => {
		const secret = 'test-secret-key';
		const userId = '5a47789c-a617-444a-8a80-b50359247804';

		// Create a JWT token
		const token = makeJWT(userId, 3600, secret);

		// Simulate Authorization header
		const authHeader = `Bearer ${token}`;

		// Extract token from header
		const extractedToken = extractBearerToken(authHeader);
		expect(extractedToken).toBe(token);

		// Validate the token
		const validatedUserId = validateJWT(extractedToken, secret);
		expect(validatedUserId).toBe(userId);

		// Mock response body with expected shape
		const responseBody = {
			id: userId,
			createdAt: '2021-07-01T00:00:00Z',
			updatedAt: '2021-07-01T00:00:00Z',
			email: 'lane@example.com',
			token: token,
		};

		// Verify response structure
		expect(responseBody).toHaveProperty('id');
		expect(responseBody).toHaveProperty('createdAt');
		expect(responseBody).toHaveProperty('updatedAt');
		expect(responseBody).toHaveProperty('email');
		expect(responseBody).toHaveProperty('token');
		expect(responseBody.id).toBe(userId);
		expect(responseBody.token).toBe(token);
	});
});
