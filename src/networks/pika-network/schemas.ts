import { z } from 'zod';

const numericString = z
  .union([
    z.number(),
    z.string().refine((val) => val.trim() !== '' && !Number.isNaN(Number(val)), {
      message: 'Expected valid numeric string',
    }),
  ])
  .transform(Number);

const leaderboardEntrySchema = z.object({
  place: z.number(),
  value: numericString,
  id: z.string(),
  clan: z.string().nullable().optional(),
  rank: z.string().nullable().optional(),
});

export const PikaNetworkLeaderboardResponseSchema = z.object({
  metadata: z.object({ total: z.number() }),
  entries: z.array(leaderboardEntrySchema).nullable(),
});
export type PikaNetworkLeaderboardResponse = z.infer<
  typeof PikaNetworkLeaderboardResponseSchema
>;

export const PikaNetworkProfileStatsResponseSchema = z.record(
  z.string(),
  PikaNetworkLeaderboardResponseSchema,
);
export type PikaNetworkProfileStatsResponse = z.infer<
  typeof PikaNetworkProfileStatsResponseSchema
>;

const totalsEntrySchema = z.object({
  name: z.string(),
  total: z.number(),
  average: z.number(),
  sum: z.number(),
});
export const PikaNetworkTotalsResponseSchema = z.array(totalsEntrySchema);
export type PikaNetworkTotalsResponse = z.infer<typeof PikaNetworkTotalsResponseSchema>;

const profileRankSchema = z.object({
  level: z.number().optional(),
  experience: z.number().optional(),
  percentage: z.number().optional(),
  rankDisplay: z.string().optional(),
});

export const PikaNetworkProfileDonorRankSchema = z
  .object({
    name: z.string().optional(),
    displayName: z.string().optional(),
    server: z.string().optional(),
    season: z.union([z.number(), z.string()]).nullable().optional(),
    expiry: z.number().optional(),
  })
  .passthrough();
export type PikaNetworkProfileDonorRank = z.infer<
  typeof PikaNetworkProfileDonorRankSchema
>;

export const clanMemberSchema = z
  .object({
    user: z.object({
      username: z.string(),
    }),
    joinDate: z.string().optional(),
    rank: z.string().optional(),
  })
  .passthrough();
export type ClanMember = z.infer<typeof clanMemberSchema>;

const profileFriendSchema = z
  .object({
    username: z.string(),
  })
  .passthrough();
export type PikaNetworkProfileFriend = z.infer<typeof profileFriendSchema>;

export const PikaNetworkClanResponseSchema = z
  .object({
    name: z.string().optional(),
    tag: z.string().optional(),
    trophies: z.number().optional(),
    currentTrophies: z.number().optional(),
    createdAt: z.union([z.number(), z.string()]).optional(),
    creationTime: z.string().optional(),
    members: z.array(clanMemberSchema).optional(),
    owner: z.object({ username: z.string() }).optional(),
    leveling: z
      .object({
        level: z.number().optional(),
        exp: z.number().optional(),
        totalExp: z.number().optional(),
      })
      .optional(),
  })
  .passthrough();
export type PikaNetworkClanResponse = z.infer<typeof PikaNetworkClanResponseSchema>;

export const PikaNetworkProfileResponseSchema = z
  .object({
    username: z.string().optional(),
    lastSeen: z.number().optional(),
    discord_verified: z.boolean().optional(),
    email_verified: z.boolean().optional(),
    boosting: z.boolean().optional(),
    discord_boosting: z.boolean().optional(),
    rank: profileRankSchema.optional(),
    ranks: z.array(PikaNetworkProfileDonorRankSchema).optional(),
    clan: PikaNetworkClanResponseSchema.nullable().optional(),
    friends: z.array(profileFriendSchema).optional(),
  })
  .passthrough();
export type PikaNetworkProfileResponse = z.infer<typeof PikaNetworkProfileResponseSchema>;

export const PikaNetworkRecapResponseSchema = z
  .object({
    id: z.string().optional(),
    mapName: z.string().optional(),
    gameType: z.string().optional(),
    gameServerName: z.string().optional(),
    gameStart: z.string().optional(),
    gameDuration: z.string().optional(),
    users: z
      .array(
        z
          .object({
            username: z.string().optional(),
            stats: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
          })
          .passthrough(),
      )
      .optional(),
    winners: z.array(z.string()).optional(),
    stats: z.array(z.string()).optional(),
  })
  .passthrough();
export type PikaNetworkRecapResponse = z.infer<typeof PikaNetworkRecapResponseSchema>;

const numberRecordSchema = z.record(z.string(), z.number());

export const PikaNetworkPlayerTeamSchema = z
  .object({
    gamemode: z.string().optional(),
    entityId: z.string().optional(),
    displayName: z.string().optional(),
    role: z.string().optional(),
  })
  .passthrough();
export type PikaNetworkPlayerTeam = z.infer<typeof PikaNetworkPlayerTeamSchema>;
export const PikaNetworkPlayerTeamsSchema = z.array(PikaNetworkPlayerTeamSchema);

export const PikaNetworkPlayerHistorySchema = z
  .object({
    type: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    series: z
      .array(
        z
          .object({
            stat: z.union([z.string(), z.number()]).optional(),
            name: z.string().optional(),
            points: z
              .array(
                z
                  .object({ date: z.string().optional(), value: z.number().optional() })
                  .passthrough(),
              )
              .optional(),
          })
          .passthrough(),
      )
      .optional(),
  })
  .passthrough();
export type PikaNetworkPlayerHistory = z.infer<typeof PikaNetworkPlayerHistorySchema>;

export const PikaNetworkStatIdSchema = z
  .object({ id: z.string(), name: z.string() })
  .passthrough();
export type PikaNetworkStatId = z.infer<typeof PikaNetworkStatIdSchema>;
export const PikaNetworkLeaderboardStatsSchema = z.array(PikaNetworkStatIdSchema);

export const PikaNetworkMoverSchema = z
  .object({
    id: z.string().optional(),
    from: z.number().optional(),
    to: z.number().optional(),
    gain: z.number().optional(),
    place: z.number().optional(),
  })
  .passthrough();
export type PikaNetworkMover = z.infer<typeof PikaNetworkMoverSchema>;
export const PikaNetworkMoversSchema = z.array(PikaNetworkMoverSchema);

export const PikaNetworkTopTeamSchema = z
  .object({
    place: z.number().optional(),
    entityId: z.string().optional(),
    displayName: z.string().optional(),
    value: z.string().optional(),
    placeChange24h: z.number().nullable().optional(),
    valueChange24h: z.number().nullable().optional(),
  })
  .passthrough();
export type PikaNetworkTopTeam = z.infer<typeof PikaNetworkTopTeamSchema>;
export const PikaNetworkTopTeamsSchema = z.array(PikaNetworkTopTeamSchema);

export const PikaNetworkTeamMemberSchema = z
  .object({
    user: z.object({ username: z.string().optional() }).passthrough().optional(),
    role: z.string().optional(),
    active: z.boolean().optional(),
    joinedAt: z.number().optional(),
  })
  .passthrough();
export type PikaNetworkTeamMember = z.infer<typeof PikaNetworkTeamMemberSchema>;

export const PikaNetworkTeamSchema = z
  .object({
    gamemode: z.string().optional(),
    family: z.string().optional(),
    entityId: z.string().optional(),
    displayName: z.string().optional(),
    tag: z.string().optional(),
    memberCount: z.number().optional(),
    headlineValue: z.number().nullable().optional(),
    season: z.number().optional(),
    aggStats: numberRecordSchema.optional(),
    breakdown: z.record(z.string(), z.unknown()).optional(),
    members: z.array(PikaNetworkTeamMemberSchema).optional(),
  })
  .passthrough();
export type PikaNetworkTeam = z.infer<typeof PikaNetworkTeamSchema>;

export const PikaNetworkTeamDetailSchema = z
  .object({
    place: z.number().nullable().optional(),
    team: PikaNetworkTeamSchema.optional(),
  })
  .passthrough();
export type PikaNetworkTeamDetail = z.infer<typeof PikaNetworkTeamDetailSchema>;

export const PikaNetworkTeamStatCatalogSchema = z
  .object({
    gamemode: z.string().optional(),
    stats: z
      .array(
        z
          .object({ id: z.string().optional(), name: z.string().optional() })
          .passthrough(),
      )
      .optional(),
  })
  .passthrough();
export type PikaNetworkTeamStatCatalog = z.infer<typeof PikaNetworkTeamStatCatalogSchema>;

export const PikaNetworkTeamSnapshotSchema = z
  .object({
    snapshotTs: z.number().optional(),
    headlineValue: z.number().nullable().optional(),
    place: z.number().nullable().optional(),
    aggStats: numberRecordSchema.optional(),
  })
  .passthrough();
export type PikaNetworkTeamSnapshot = z.infer<typeof PikaNetworkTeamSnapshotSchema>;

export const PikaNetworkTeamHistorySchema = z
  .object({
    gamemode: z.string().optional(),
    entityId: z.string().optional(),
    interval: z.string().optional(),
    points: z.array(PikaNetworkTeamSnapshotSchema).optional(),
  })
  .passthrough();
export type PikaNetworkTeamHistory = z.infer<typeof PikaNetworkTeamHistorySchema>;

export const PikaNetworkTeamVsSideSchema = z
  .object({
    entityId: z.string().optional(),
    displayName: z.string().nullable().optional(),
    place: z.number().nullable().optional(),
    headlineValue: z.number().nullable().optional(),
    aggStats: numberRecordSchema.nullable().optional(),
    snapshot: PikaNetworkTeamSnapshotSchema.nullable().optional(),
    series: z.array(PikaNetworkTeamSnapshotSchema).nullable().optional(),
  })
  .passthrough();

export const PikaNetworkTeamComparisonSchema = z
  .object({
    gamemode: z.string().optional(),
    mode: z.enum(['current', 'at', 'range']).optional(),
    at: z.number().nullable().optional(),
    from: z.number().nullable().optional(),
    to: z.number().nullable().optional(),
    a: PikaNetworkTeamVsSideSchema.optional(),
    b: PikaNetworkTeamVsSideSchema.optional(),
  })
  .passthrough();
export type PikaNetworkTeamComparison = z.infer<typeof PikaNetworkTeamComparisonSchema>;

export const PikaNetworkClanMemberStatsSchema = z
  .object({
    total: numberRecordSchema.optional(),
    weekly: numberRecordSchema.optional(),
    monthly: numberRecordSchema.optional(),
  })
  .passthrough();
export type PikaNetworkClanMemberStats = z.infer<typeof PikaNetworkClanMemberStatsSchema>;

export const PikaNetworkClanMemberStatsResponseSchema = z
  .object({
    username: z.string().optional(),
    joinDate: z.string().optional(),
    stats: PikaNetworkClanMemberStatsSchema.nullable().optional(),
  })
  .passthrough();
export type PikaNetworkClanMemberStatsResponse = z.infer<
  typeof PikaNetworkClanMemberStatsResponseSchema
>;
export const PikaNetworkClanMembersSchema = z.array(
  PikaNetworkClanMemberStatsResponseSchema,
);

export const PikaNetworkSeasonDatesSchema = z
  .object({
    season: z.number().optional(),
    start: z.string().optional(),
    end: z.string().nullable().optional(),
  })
  .passthrough();
export type PikaNetworkSeasonDates = z.infer<typeof PikaNetworkSeasonDatesSchema>;
export const PikaNetworkSeasonsSchema = z.record(z.string(), z.array(z.number()));
export type PikaNetworkSeasons = Record<string, number[]>;
export const PikaNetworkSeasonDetailsSchema = z.union([
  z.record(z.string(), z.array(PikaNetworkSeasonDatesSchema)),
  z.array(PikaNetworkSeasonDatesSchema),
]);
export type PikaNetworkSeasonDetails = z.infer<typeof PikaNetworkSeasonDetailsSchema>;

export const PikaNetworkEventSummarySchema = z
  .object({
    id: z.string().optional(),
    type: z.string().optional(),
    name: z.string().optional(),
    map: z.string().nullable().optional(),
    mapName: z.string().nullable().optional(),
    teamSize: z.number().nullable().optional(),
    startedAt: z.number().optional(),
    endedAt: z.number().optional(),
    outcome: z.enum(['WIN', 'NO_WINNER', 'FORCE_ENDED']).optional(),
    players: z.number().optional(),
    winners: z.array(z.string()).optional(),
  })
  .passthrough();
export type PikaNetworkEventSummary = z.infer<typeof PikaNetworkEventSummarySchema>;

export const PikaNetworkEventStandingSchema = z
  .object({
    username: z.string().optional(),
    placement: z.number().optional(),
    winner: z.boolean().optional(),
    team: z.number().nullable().optional(),
    teamColor: z.string().nullable().optional(),
    outAt: z.number().nullable().optional(),
    outReason: z.enum(['ELIMINATED', 'KNOCKED_OUT', 'LEFT']).nullable().optional(),
    kills: z.number().optional(),
    score: z.number().optional(),
  })
  .passthrough();
export type PikaNetworkEventStanding = z.infer<typeof PikaNetworkEventStandingSchema>;

export const PikaNetworkEventSchema = PikaNetworkEventSummarySchema.extend({
  progression: z
    .enum(['LAST_STANDING', 'BRACKET', 'BEST_SCORE', 'MOST_KILLS'])
    .optional(),
  server: z.string().optional(),
  host: z.string().nullable().optional(),
  endReason: z.string().nullable().optional(),
  standings: z.array(PikaNetworkEventStandingSchema).optional(),
});
export type PikaNetworkEvent = z.infer<typeof PikaNetworkEventSchema>;

export const PikaNetworkEventPageSchema = z
  .object({
    total: z.number().optional(),
    events: z.array(PikaNetworkEventSummarySchema),
  })
  .passthrough();
export type PikaNetworkEventPage = z.infer<typeof PikaNetworkEventPageSchema>;

export const PikaNetworkEventWinnerSchema = z
  .object({
    username: z.string().optional(),
    wins: z.number().optional(),
    podiums: z.number().optional(),
    played: z.number().optional(),
  })
  .passthrough();
export type PikaNetworkEventWinner = z.infer<typeof PikaNetworkEventWinnerSchema>;
export const PikaNetworkEventWinnersSchema = z.array(PikaNetworkEventWinnerSchema);

export const PikaNetworkEventTypeSchema = z
  .object({
    type: z.string().optional(),
    name: z.string().optional(),
    events: z.number().optional(),
    lastStartedAt: z.number().optional(),
  })
  .passthrough();
export type PikaNetworkEventType = z.infer<typeof PikaNetworkEventTypeSchema>;
export const PikaNetworkEventTypesSchema = z.array(PikaNetworkEventTypeSchema);

export const PikaNetworkPlayerEventsSchema = z
  .object({
    summary: z
      .object({
        played: z.number().optional(),
        wins: z.number().optional(),
        podiums: z.number().optional(),
        bestPlacement: z.number().nullable().optional(),
      })
      .passthrough()
      .optional(),
    events: z
      .array(
        z
          .object({
            event: PikaNetworkEventSummarySchema.optional(),
            placement: z.number().optional(),
            winner: z.boolean().optional(),
            kills: z.number().optional(),
            score: z.number().optional(),
            outReason: z.string().nullable().optional(),
          })
          .passthrough(),
      )
      .optional(),
  })
  .passthrough();
export type PikaNetworkPlayerEvents = z.infer<typeof PikaNetworkPlayerEventsSchema>;

export const PikaNetworkConsumableSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().optional(),
    count: z.number().optional(),
  })
  .passthrough();
export type PikaNetworkConsumable = z.infer<typeof PikaNetworkConsumableSchema>;

export const PikaNetworkCountSchema = z
  .object({ key: z.string().optional(), count: z.number().optional() })
  .passthrough();
export type PikaNetworkCount = z.infer<typeof PikaNetworkCountSchema>;

export const PikaNetworkGearPieceSchema = z
  .object({
    type: z.string().optional(),
    ench: numberRecordSchema.optional(),
    set: z.string().optional(),
    kit: z.string().optional(),
    scrolls: z.array(z.string()).optional(),
    extra: numberRecordSchema.optional(),
  })
  .passthrough();
export type PikaNetworkGearPiece = z.infer<typeof PikaNetworkGearPieceSchema>;

export const PikaNetworkFightSideSchema = z
  .object({
    username: z.string().nullable().optional(),
    rank: z.string().nullable().optional(),
    elo: z.number().nullable().optional(),
    sets: z.array(z.string()).optional(),
    weapon: z.string().nullable().optional(),
    loadout: z.record(z.string(), PikaNetworkGearPieceSchema).nullable().optional(),
    consumables: z.array(PikaNetworkConsumableSchema).optional(),
    startLoadout: z.record(z.string(), PikaNetworkGearPieceSchema).nullable().optional(),
  })
  .passthrough();
export type PikaNetworkFightSide = z.infer<typeof PikaNetworkFightSideSchema>;

export const PikaNetworkFightSchema = z
  .object({
    id: z.string().optional(),
    time: z.number().optional(),
    mode: z.string().optional(),
    server: z.string().nullable().optional(),
    killType: z.enum(['melee', 'projectile', 'other']).optional(),
    cause: z.string().nullable().optional(),
    duration: z.number().nullable().optional(),
    weapon: z
      .object({ item: z.string().optional(), enchants: numberRecordSchema.optional() })
      .nullable()
      .optional(),
    winner: PikaNetworkFightSideSchema.optional(),
    loser: PikaNetworkFightSideSchema.optional(),
  })
  .passthrough();
export type PikaNetworkFight = z.infer<typeof PikaNetworkFightSchema>;
export const PikaNetworkFightsSchema = z.array(PikaNetworkFightSchema);

export const PikaNetworkFightDetailSchema = z
  .object({
    fight: PikaNetworkFightSchema,
    items: z
      .record(
        z.string(),
        z
          .object({
            name: z.string().optional(),
            lore: z.array(z.string()).optional(),
            material: z.string().nullable().optional(),
          })
          .passthrough(),
      )
      .optional(),
  })
  .passthrough();
export type PikaNetworkFightDetail = z.infer<typeof PikaNetworkFightDetailSchema>;

export const PikaNetworkPlayerFightsSchema = z
  .object({
    days: z.number().optional(),
    kills: z.number().optional(),
    deaths: z.number().optional(),
    bestStreak: z.number().optional(),
    streak: z.number().optional(),
    recent: z
      .array(
        z
          .object({
            fight: PikaNetworkFightSchema.optional(),
            won: z.boolean().optional(),
          })
          .passthrough(),
      )
      .optional(),
    opponents: z
      .array(
        z
          .object({
            username: z.string().optional(),
            kills: z.number().optional(),
            deaths: z.number().optional(),
          })
          .passthrough(),
      )
      .optional(),
    weapons: z.array(PikaNetworkCountSchema).optional(),
    consumables: z.array(PikaNetworkConsumableSchema).optional(),
    deathsBy: z.array(PikaNetworkCountSchema).optional(),
    modes: z
      .array(
        z
          .object({
            mode: z.string().optional(),
            kills: z.number().optional(),
            deaths: z.number().optional(),
          })
          .passthrough(),
      )
      .optional(),
  })
  .passthrough();
export type PikaNetworkPlayerFights = z.infer<typeof PikaNetworkPlayerFightsSchema>;

export const PikaNetworkModeFightsSchema = z
  .object({
    hours: z.number().optional(),
    kills: z.number().optional(),
    medianDuration: z.number().nullable().optional(),
    killers: z
      .array(
        z
          .object({ username: z.string().optional(), kills: z.number().optional() })
          .passthrough(),
      )
      .optional(),
    weapons: z.array(PikaNetworkCountSchema).optional(),
    sets: z
      .array(
        z
          .object({
            set: z.string().optional(),
            kills: z.number().optional(),
            worn: z.number().optional(),
          })
          .passthrough(),
      )
      .optional(),
    consumables: z.array(PikaNetworkConsumableSchema).optional(),
    causes: z.array(PikaNetworkCountSchema).optional(),
  })
  .passthrough();
export type PikaNetworkModeFights = z.infer<typeof PikaNetworkModeFightsSchema>;
