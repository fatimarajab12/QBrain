/**
 * Creates a valid JWT token for testing
 * @param payload - The payload to encode in the token
 * @param expired - Whether the token should be expired
 * @returns A JWT token string
 */
export const createJWTToken = (payload: Record<string, unknown>, expired = false): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const exp = expired
    ? Math.floor(Date.now() / 1000) - 3600 // expired 1 hour ago
    : Math.floor(Date.now() / 1000) + 3600; // expires in 1 hour
  const tokenPayload = btoa(JSON.stringify({ ...payload, exp }));
  return `${header}.${tokenPayload}.signature`;
};

/**
 * Creates an expired JWT token
 */
export const createExpiredJWTToken = (payload: Record<string, unknown>): string => {
  return createJWTToken(payload, true);
};

