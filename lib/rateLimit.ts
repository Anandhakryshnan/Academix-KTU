interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const ipStore = new Map<string, RateLimitEntry>();
const accountStore = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_IP_REQUESTS = 10;
const MAX_ACCOUNT_REQUESTS = 3;

export function checkRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
  resetIn: number;
} {
  const now = Date.now();
  const entry = ipStore.get(ip);

  if (!entry || now > entry.resetAt) {
    ipStore.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_IP_REQUESTS - 1, resetIn: WINDOW_MS };
  }

  if (entry.count >= MAX_IP_REQUESTS) {
    return { allowed: false, remaining: 0, resetIn: entry.resetAt - now };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: MAX_IP_REQUESTS - entry.count,
    resetIn: entry.resetAt - now,
  };
}

export function checkAccountRateLimit(username: string): {
  allowed: boolean;
  resetIn: number;
} {
  const now = Date.now();
  const entry = accountStore.get(username);

  // Use a 2 minute window for account rate limit to prevent spam
  const accountWindow = 2 * 60 * 1000;

  if (!entry || now > entry.resetAt) {
    accountStore.set(username, { count: 1, resetAt: now + accountWindow });
    return { allowed: true, resetIn: accountWindow };
  }

  if (entry.count >= MAX_ACCOUNT_REQUESTS) {
    return { allowed: false, resetIn: entry.resetAt - now };
  }

  entry.count++;
  return {
    allowed: true,
    resetIn: entry.resetAt - now,
  };
}
