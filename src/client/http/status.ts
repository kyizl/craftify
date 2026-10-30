import { match, P } from 'ts-pattern';

export type StatusOutcome =
  | { kind: 'success'; body: unknown }
  | { kind: 'empty' }
  | { kind: 'bad-request'; body: unknown }
  | { kind: 'http-error'; message: string }
  | { kind: 'retryable'; isRateLimit: boolean };

export function interpretStatus(
  status: number,
  body: unknown,
  url: string,
): StatusOutcome {
  return match(status)
    .with(200, () => ({ kind: 'success' as const, body }))
    .with(204, () => ({ kind: 'empty' as const }))
    .with(404, () =>
      isNotFoundEntity(body)
        ? { kind: 'empty' as const }
        : {
            kind: 'http-error' as const,
            message: `Route not found: ${resolveRoutePath(body, url)}`,
          },
    )
    .with(400, () => ({ kind: 'bad-request' as const, body }))
    .with(429, () => ({ kind: 'retryable' as const, isRateLimit: true }))
    .with(P.number.gte(500), () => ({ kind: 'retryable' as const, isRateLimit: false }))
    .otherwise(() => ({
      kind: 'http-error' as const,
      message: `Unexpected HTTP ${status} from ${url}`,
    }));
}

function isEmptyBody(body: unknown): boolean {
  return [null, undefined, ''].includes(body as null | undefined | string);
}

function isNotFoundEntity(body: unknown): boolean {
  if (isEmptyBody(body)) return true;

  if (body && typeof body === 'object') {
    const obj = body as Record<string, unknown>;
    if ('path' in obj && typeof obj.path === 'string' && !('message' in obj)) {
      return false;
    }
    if (
      typeof obj.message === 'string' &&
      /not found|does not exist|unknown/i.test(obj.message)
    ) {
      return true;
    }
  }

  return true;
}

function resolveRoutePath(body: unknown, fallback: string): string {
  if (body && typeof body === 'object' && 'path' in body && typeof body.path === 'string')
    return body.path;
  return fallback;
}
