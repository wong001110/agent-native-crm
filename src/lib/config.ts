import 'server-only';
import { randomBytes } from 'node:crypto';
export class AppError extends Error {
  constructor(public code: string, message: string, public status = 400) { super(message); this.name = 'AppError'; }
}
const globals = globalThis as typeof globalThis & { crmDevSecret?: string };
export function getConfig(env: Readonly<Record<string, string | undefined>> = process.env, requireModel = true) {
  const mode = env.AGENT_MODE ?? 'mock';
  if (mode !== 'mock' && mode !== 'live') throw new AppError('CONFIG', 'AGENT_MODE must be mock or live.', 503);
  const model = env.DEEPSEEK_MODEL || 'deepseek-v4-flash';
  if (mode === 'live' && ((requireModel && !env.DEEPSEEK_API_KEY) || !env.DEMO_ACCESS_TOKEN)) {
    throw new AppError('CONFIG', 'Live mode requires DEEPSEEK_API_KEY and DEMO_ACCESS_TOKEN on the server. No mock fallback was used.', 503);
  }
  if ((mode === 'live' || env.NODE_ENV === 'production') && (env.SESSION_SECRET?.length ?? 0) < 32) {
    throw new AppError('CONFIG', 'Set a random SESSION_SECRET of at least 32 characters.', 503);
  }
  const secret = env.SESSION_SECRET || (globals.crmDevSecret ??= randomBytes(32).toString('hex'));
  return { mode, model, secret, accessToken: env.DEMO_ACCESS_TOKEN ?? '', apiKey: env.DEEPSEEK_API_KEY ?? '', maxSteps: 6, maxOutputTokens: 2200, timeoutMs: 45000 } as const;
}
export function publicError(error: unknown) {
  if (error instanceof AppError) return { message: error.message, status: error.status };
  if (error instanceof Error && (error.name === 'AbortError' || error.name === 'TimeoutError')) return { message:'The run was stopped or timed out. No CRM task was created.', status:408 };
  // Provider/database exception messages can contain URLs, SQL or secrets. Do not forward them.
  return { message: 'This operation could not be completed. Check the server connection and try again. No success has been assumed.', status:503 };
}
