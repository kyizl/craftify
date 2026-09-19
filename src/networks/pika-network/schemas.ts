import { z } from 'zod';

/**
 * numeric fields sometimes arrive as unrounded IEEE-754 string floats
 * (e.g. balance: "5158777955980.7333984375"; see docs section 3.5), and
 * sometimes as plain numbers. coerce either into a number safely.
 */
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

/**
 * GET /profile/{username}/leaderboard
 */
export const PikaNetworkProfileStatsResponseSchema = z.record(
  z.string(),
  PikaNetworkLeaderboardResponseSchema,
);
export type PikaNetworkProfileStatsResponse = z.infer<
  typeof PikaNetworkProfileStatsResponseSchema
>;

/**
 * GET /leaderboards/total
 */
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
    season: z.string().nullable().optional(),
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

/**
 * GET /clans/{clanName}
 */
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

/**
 * GET /profile/{username}
 */
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

/**
 * GET /recaps/{gameId}
 */
export const PikaNetworkRecapResponseSchema = z.record(z.string(), z.unknown());
export type PikaNetworkRecapResponse = z.infer<typeof PikaNetworkRecapResponseSchema>;
