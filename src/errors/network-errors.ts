export class NetworkAPIError extends Error {
  readonly network: string;
  readonly status: number | undefined;
  readonly url?: string;

  constructor(
    network: string,
    message: string,
    options: { status?: number; url?: string; cause?: unknown } = {},
  ) {
    super(message, { cause: options.cause });
    this.name = new.target.name;
    this.network = network;
    this.status = options.status;
    this.url = options.url;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NetworkBadRequestError extends NetworkAPIError {
  constructor(
    network: string,
    message: string,
    options: { url?: string; cause?: unknown } = {},
  ) {
    super(network, message, { ...options, status: 400 });
  }
}

export class NetworkHTTPError extends NetworkAPIError {}

export class NetworkRateLimitError extends NetworkAPIError {
  readonly retryAfterMs: number | undefined;

  constructor(
    network: string,
    message: string,
    options: { url?: string; retryAfterMs?: number; cause?: unknown } = {},
  ) {
    super(network, message, { ...options, status: 429 });
    this.retryAfterMs = options.retryAfterMs;
  }
}

export class NetworkValidationError extends NetworkAPIError {
  readonly issues: unknown;

  constructor(
    network: string,
    message: string,
    options: { url?: string; issues?: unknown; cause?: unknown } = {},
  ) {
    super(network, message, options);
    this.issues = options.issues;
  }
}

export class NetworkAuthExhaustedError extends NetworkAPIError {}
