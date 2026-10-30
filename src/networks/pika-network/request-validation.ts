export function assertIntegerRange(
  value: number,
  name: string,
  minimum: number,
  maximum: number,
): number {
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) {
    throw new RangeError(`${name} must be an integer between ${minimum} and ${maximum}`);
  }
  return value;
}

export function clampIntegerMaximum(
  value: number,
  name: string,
  maximum: number,
  minimum?: number,
): number {
  if (!Number.isSafeInteger(value) || (minimum !== undefined && value < minimum)) {
    throw new RangeError(
      minimum === undefined
        ? `${name} must be an integer`
        : `${name} must be an integer greater than or equal to ${minimum}`,
    );
  }
  return Math.min(maximum, value);
}

export function assertNonNegativeInteger(value: number, name: string): number {
  assertSafeInteger(value, name);
  if (value < 0) {
    throw new RangeError(`${name} must be a non-negative integer`);
  }
  return value;
}

export function assertSafeInteger(value: number, name: string): number {
  if (!Number.isSafeInteger(value)) {
    throw new RangeError(`${name} must be a safe integer`);
  }
  return value;
}

export function assertMaximumListItems(
  value: string | string[],
  name: string,
  maximum: number,
): void {
  const count = Array.isArray(value)
    ? value.length
    : value.split(',').filter((item) => item.trim().length > 0).length;
  if (count > maximum) {
    throw new RangeError(`${name} must contain at most ${maximum} items`);
  }
}
