import {
  PikaNetworkModes,
  PikaNetworkRequiredMode,
  YearlyCapableGamemodes,
  type PikaNetworkGamemode,
  type PikaNetworkInterval,
  type PikaNetworkMode,
} from '@/networks/pika-network/enums';

export function resolveDefaultMode<G extends PikaNetworkGamemode>(
  gamemode: G,
): PikaNetworkMode<G> {
  const required = (PikaNetworkRequiredMode as Record<string, string>)[gamemode];
  return (required ?? 'ALL_MODES') as PikaNetworkMode<G>;
}

export function assertValidCombination(
  gamemode: PikaNetworkGamemode,
  mode: string,
  interval: PikaNetworkInterval,
): void {
  const validModes = (PikaNetworkModes as Record<string, readonly string[]>)[gamemode];
  if (!validModes) {
    throw new RangeError(`"${gamemode}" is not a valid PikaNetwork gamemode.`);
  }

  const isYearly = interval === 'yearly';
  const isYearlyCapable = (YearlyCapableGamemodes as readonly string[]).includes(
    gamemode,
  );

  if (!validModes.includes(mode)) {
    throw new RangeError(
      `"${mode}" is not a valid mode for gamemode "${gamemode}". Valid modes: ${validModes.join(', ')}`,
    );
  }

  if (isYearly && !isYearlyCapable) {
    throw new RangeError(
      `interval="yearly" is only supported for ${YearlyCapableGamemodes.join(' and ')} — "${gamemode}" will silently return empty results instead of erroring, so this is checked client-side.`,
    );
  }
}

export function assertValidGamemode(
  gamemode: string,
): asserts gamemode is PikaNetworkGamemode {
  if (!Object.hasOwn(PikaNetworkModes, gamemode)) {
    throw new RangeError(`"${gamemode}" is not a valid PikaNetwork gamemode.`);
  }
}
