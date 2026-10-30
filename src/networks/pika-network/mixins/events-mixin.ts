import {
  assertIntegerRange,
  assertNonNegativeInteger,
  clampIntegerMaximum,
} from '@/networks/pika-network/request-validation';
import {
  PikaNetworkEventPageSchema,
  PikaNetworkEventSchema,
  PikaNetworkEventTypesSchema,
  PikaNetworkEventWinnersSchema,
} from '@/networks/pika-network/schemas';
import type {
  PikaNetworkMixinConstructor,
  PikaNetworkMixinResult,
} from '@/networks/pika-network/mixins/mixin-constructor';
import type {
  GetEventsParams,
  GetEventWinnersParams,
  PikaNetworkEvent,
  PikaNetworkEventPage,
  PikaNetworkEventType,
  PikaNetworkEventWinner,
} from '@/networks/pika-network/types';
import type { RequestConfig } from '@/types';

export interface EventsMixin {
  getEvents(
    parameters?: GetEventsParams,
    config?: RequestConfig,
  ): Promise<PikaNetworkEventPage>;
  getEvent(id: string, config?: RequestConfig): Promise<PikaNetworkEvent | null>;
  getEventWinners(
    parameters?: GetEventWinnersParams,
    config?: RequestConfig,
  ): Promise<PikaNetworkEventWinner[]>;
  getEventTypes(config?: RequestConfig): Promise<PikaNetworkEventType[]>;
}

export function withEvents<TBase extends PikaNetworkMixinConstructor>(
  Base: TBase,
): PikaNetworkMixinResult<TBase, EventsMixin> {
  abstract class WithEvents extends Base implements EventsMixin {
    async getEvents(
      parameters: GetEventsParams = {},
      config?: RequestConfig,
    ): Promise<PikaNetworkEventPage> {
      const { type, limit, offset } = parameters;
      const query = new URLSearchParams();
      if (type) query.set('type', type);
      if (limit !== undefined) {
        query.set('limit', String(clampIntegerMaximum(limit, 'limit', 50, 1)));
      }
      if (offset !== undefined) {
        query.set('offset', String(assertNonNegativeInteger(offset, 'offset')));
      }
      const suffix = query.size > 0 ? `?${query.toString()}` : '';
      const url = `${this.baseUrl}/events${suffix}`;
      const raw = await this.fetchAndValidate(
        `pika-network:events:${query.toString()}`,
        url,
        PikaNetworkEventPageSchema,
        config,
      );
      return raw ?? { total: 0, events: [] };
    }

    async getEvent(id: string, config?: RequestConfig): Promise<PikaNetworkEvent | null> {
      const url = `${this.baseUrl}/events/${encodeURIComponent(id)}`;
      return this.fetchAndValidate(
        `pika-network:event:${id}`,
        url,
        PikaNetworkEventSchema,
        config,
      );
    }

    async getEventWinners(
      parameters: GetEventWinnersParams = {},
      config?: RequestConfig,
    ): Promise<PikaNetworkEventWinner[]> {
      const { type, days, limit } = parameters;
      if (days !== undefined) assertIntegerRange(days, 'days', 0, 3650);
      const query = new URLSearchParams();
      if (type) query.set('type', type);
      if (days !== undefined) query.set('days', String(days));
      if (limit !== undefined) {
        query.set('limit', String(clampIntegerMaximum(limit, 'limit', 50, 1)));
      }
      const suffix = query.size > 0 ? `?${query.toString()}` : '';
      const url = `${this.baseUrl}/events/winners${suffix}`;
      const raw = await this.fetchAndValidate(
        `pika-network:event-winners:${query.toString()}`,
        url,
        PikaNetworkEventWinnersSchema,
        config,
      );
      return raw ?? [];
    }

    async getEventTypes(config?: RequestConfig): Promise<PikaNetworkEventType[]> {
      const url = `${this.baseUrl}/events/types`;
      const raw = await this.fetchAndValidate(
        'pika-network:event-types',
        url,
        PikaNetworkEventTypesSchema,
        config,
      );
      return raw ?? [];
    }
  }

  return WithEvents;
}
