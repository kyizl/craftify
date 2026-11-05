import { expectAssignable, expectType } from 'tsd';
import {
  ClanMemberSchema,
  PikaNetworkProfileFriendSchema,
  PikaNetworkProfileStatsResponseSchema,
  type ClanMember,
  type PikaNetworkClientOptions,
  type PikaNetworkCustomHostOptions,
  type PikaNetworkDefaultHostOptions,
  type PikaNetworkProfileFriend,
  type PikaNetworkProfileStatsResponse,
} from '../dist/index.js';

const clanMember = ClanMemberSchema.parse({ user: { username: 'player' } });
const profileFriend = PikaNetworkProfileFriendSchema.parse({ username: 'friend' });
const profileStats = PikaNetworkProfileStatsResponseSchema.parse({});

expectType<ClanMember>(clanMember);
expectType<string>(clanMember.user.username);
expectType<PikaNetworkProfileFriend>(profileFriend);
expectType<string>(profileFriend.username);
expectType<PikaNetworkProfileStatsResponse>(profileStats);

const defaultHostOptions: PikaNetworkDefaultHostOptions = { apiKey: 'key' };
const customHostOptions: PikaNetworkCustomHostOptions = {
  baseUrl: 'https://example.com',
};

expectAssignable<PikaNetworkClientOptions>(defaultHostOptions);
expectAssignable<PikaNetworkClientOptions>(customHostOptions);
