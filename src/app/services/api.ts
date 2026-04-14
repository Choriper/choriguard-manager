const API_BASE = '/api';

async function fetchAPI<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  let data: any = null;

  try {
    if (response.status !== 204) {
      data = isJson ? await response.json() : await response.text();
    }
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      typeof data === 'string'
        ? data
        : data?.detail || data?.message || `${response.status} ${response.statusText}`;

    throw new Error(`API Error: ${message}`);
  }

  return data as T;
}

/* =========================
   TYPES
========================= */

export interface GroupListItem {
  group_id: string;
  name: string;
  game: string;
  role: string;
  created_at: string;
}

export interface GroupListResponse {
  items: GroupListItem[];
}

export interface GroupDetail {
  group_id: string;
  name: string;
  game: string;
  owner_user_id: number;
  owner_ea_pd: string;
  created_at: string;
  updated_at: string;
}

export interface GroupLinkedEaAccount {
  group_id: string;
  ea_pd: string;
  ea_id: string | null;
  ea_name: string | null;
  avatar_url: string | null;
  sid: string;
  remid: string;
  linked_by_user_id: number | null;
  created_at: string | null;
}

export interface EAAccount {
  ea_pd: string;
  ea_id: string | null;
  ea_name: string | null;
  avatar_url: string | null;
  sid: string;
  remid: string;
  email: string | null;
  country: string | null;
  subscription_level: string | null;
  created_by_user_id: number;
  created_at: string;
  updated_at: string | null;
}

export interface GroupServerItem {
  server_id: string;
  group_id: string;
  playground_id: string;
  region: string | null;
  game_id: string | null;
  server_name: string | null;
  config_name: string | null;
  status: string;
  created_by_user_id: number;
  created_at: string;
  updated_at: string | null;
  ea_pd: string;
  ea_id: string | null;
  owner_id: string | null;
  checksum: string | null;
  blueprint_type: string | null;
}

export interface GroupServerListResponse {
  items: GroupServerItem[];
}

export interface OwnerPlaygroundItem {
  playground_id: string;
  server_name: string | null;
  config_name: string | null;
  owner_id: string | null;
  checksum: string | null;
  blueprint_type: string | null;
  created_at_raw: number | null;
  updated_at_raw: number | null;
}

export interface OwnerPlaygroundListResponse {
  persona_id: string;
  items: OwnerPlaygroundItem[];
}

export interface ServerCreateResponse {
  ea_pd: string;
  ea_id: string | null;
  playground_id: string;
  region: string | null;
  game_id: string | null;
  server_name: string | null;
  config_name: string | null;
  owner_id: string | null;
  checksum: string | null;
  blueprint_type: string | null;
  create_response?: {
    ok?: boolean;
    message?: string;
    creator_persona_id?: number;
    manager_persona_id?: number;
    game_id?: number | string;
    region?: string;
    manager_in_admin?: boolean;
    create_response?: {
      message?: string;
      server_name?: string;
      description?: string;
      owner_id?: string;
      game_id?: number | string;
      region?: string;
    };
    inject_response?: Record<string, any>;
    admin_list?: Array<number | string>;
    game_data?: Record<string, any>;
  };
}

export interface GroupServerStatusResponse {
  group_id?: string;
  playground_id?: string;
  online?: boolean;
  source?: string | null;
  searched_name?: string | null;
  refreshed_name?: string | null;
  game_id?: string | null;
  server_name?: string | null;
  config_name?: string | null;
  matched_server?: {
    prefix?: string;
    description?: string;
    playerAmount?: number;
    maxPlayers?: number;
    inSpectator?: number;
    inQue?: number;
    serverInfo?: string;
    url?: string;
    mode?: string;
    currentMap?: string;
    ownerId?: string;
    country?: string;
    region?: string;
    platform?: string;
    serverId?: string;
    isCustom?: boolean;
    gameId?: string;
    overallGameMode?: string;
    settings?: Record<string, any>;
  };
  detail?: string | { detail?: string };
}

export interface GlobalServerItem {
  server_id: string;
  group_id: string;
  group_name: string;
  ea_pd: string;
  ea_id: string | null;
  playground_id: string;
  region: string | null;
  game_id: string | null;
  server_name: string | null;
  config_name: string | null;
  owner_id: string | null;
  checksum: string | null;
  blueprint_type: string | null;
  status: string;
  created_by_user_id: number;
  created_at: string;
  updated_at: string | null;
  map_image: string | null;
  current_map: string | null;
  mode: string | null;
  playerAmount: number | null;
  maxPlayers: number | null;
  inSpectator: number | null;
  inQue: number | null;
  online: boolean;
  status_source: string | null;
}

export interface GlobalServerListResponse {
  items: GlobalServerItem[];
}

export interface GroupBanItem {
  ban_id: string;
  group_id: string;
  ea_id: string;
  is_global: boolean;
  source_mode: string;
  matched_loc: number | string | null;

  name?: string | null;
  nickname?: string | null;
  avatar?: string | null;
  location_id?: number | null;
  account_id?: string | null;

  platform: string;
  reason_type: string;
  public_reason: string | null;
  staff_notes: string | null;
  evidence_urls: string[];
  visibility: string;
  status: string;
  banned_by_user_id: number;
  created_at: string;
  updated_at: string | null;
  unbanned_at: string | null;
  unbanned_by_user_id: number | null;
  applied_servers: Array<{
    server_id?: string;
    game_id?: string;
    server_name?: string;
    ok?: boolean;
    message?: string;
  }>;
}

export interface GroupBanUpdatePayload {
  is_global: boolean;
  platform: string;
  reason_type: string;
  public_reason: string;
  staff_notes?: string;
  evidence_urls?: string[];
  visibility: string;
  status: string;
}

export interface GroupBanListResponse {
  items: GroupBanItem[];
}

export interface GroupBanAddResponse {
  ok: boolean;
  mode: string;
  total_servers: number;
  affected_servers: number;
  saved_to_db: boolean;
  message: string;
  results: any[];
}

export interface GroupBanRemoveResponse {
  ok: boolean;
  mode: string;
  total_servers: number;
  affected_servers: number;
  removed_from_db: boolean;
  deleted_count: number;
  message: string;
  results: any[];
}

export interface BfvServerInfo {
  name: string;
  description: string;
  region: string;
  country: string;
  level: string;
  mode: string;
  maps: string[];
  owner: string;
  admins: Array<number | string>;
  settings: any[];
  servertype: string;
  playgroundId: string;
  tickRate: number;
  tickRateMax: number;
  currentPlayers: number;
  spectators: number;
  queue: number;
  maxPlayers: number;
  serverId: string;
  gameId: number | string;
  mapPretty: string;
  modePretty: string;
}

export interface BfvPlayerItem {
  rank: number;
  latency: number;
  slot: number;
  join_time: number;
  user_id: number | string;
  player_id: number | string;
  name: string;
  loc: number | string;
  platoon: string;
}

export interface BfvTeamItem {
  teamid: string;
  players: BfvPlayerItem[];
  key: string;
  name: string;
  shortName: string;
  image: string;
  faction: string;
}

export interface BfvPlayersResponse {
  serverinfo: BfvServerInfo;
  admins: Array<number | string>;
  teams: BfvTeamItem[];
  spectators: BfvPlayerItem[];
  que: BfvPlayerItem[];
  loading: BfvPlayerItem[];
  update_timestamp: number;
}

export interface GroupVipItem {
  vip_id: string;
  group_id: string;
  ea_id: string;
  public_reason: string | null;
  staff_notes: string | null;
  visibility: string;
  status: string;
  added_by_user_id: number;
  created_at: string;
  updated_at: string | null;
  removed_at: string | null;
  removed_by_user_id: number | null;
}

export interface GroupVipListResponse {
  items: GroupVipItem[];
}

export interface GroupVipAddResponse {
  ok: boolean;
  group_id: string;
  ea_id: string;
  status: string;
}

export interface GroupVipRemoveResponse {
  ok: boolean;
  group_id: string;
  ea_id: string;
  status: string;
}
export interface GroupSecurityConfig {
  group_id: string;
  protect_bfban_known_cheaters: boolean;
  enable_global_ban: boolean;
  auto_kick_high_ping_enabled: boolean;
  high_ping_limit: number;
  high_ping_min_players: number;
  exclude_added_platoons_from_kick: boolean;
  kick_by_rank_enabled: boolean;
  kick_if_rank_lower_than: number | null;
  kick_if_rank_higher_than: number | null;
  kick_by_country_enabled: boolean;
  country_mode: 'blocklist' | 'allowlist';
  blocked_countries: string[];
  created_by_user_id: number;
  created_at: string;
  updated_at: string;
  updated_by_user_id: number;
}

export interface GroupSecurityUpdatePayload {
  protect_bfban_known_cheaters: boolean;
  enable_global_ban: boolean;
  auto_kick_high_ping_enabled: boolean;
  high_ping_limit: number;
  high_ping_min_players: number;
  exclude_added_platoons_from_kick: boolean;
  kick_by_rank_enabled: boolean;
  kick_if_rank_lower_than: number | null;
  kick_if_rank_higher_than: number | null;
  kick_by_country_enabled: boolean;
  country_mode: 'blocklist' | 'allowlist';
  blocked_countries: string[];
}

export interface ValidBlockedCountriesResponse {
  items: string[];
}

export interface GroupMemberItem {
  group_id: string;
  user_id: number;
  ea_pd: string;
  role: string;
  created_at: string;
  updated_at: string | null;
}

export interface GroupMembersResponse {
  items: GroupMemberItem[];
}

export interface GroupMemberCreatePayload {
  ea_pd: string;
  role: string;
}

export interface GroupMemberUpdatePayload {
  role: string;
}

export interface GroupMemberRemoveResponse {
  ok: boolean;
  group_id: string;
  ea_pd: string;
  removed: boolean;
}
/* =========================
   GROUPS
========================= */

export const groupsAPI = {
  list: () => fetchAPI<GroupListResponse>('/groups'),

  get: (id: string) => fetchAPI<GroupDetail>(`/groups/${id}`),

  create: (data: { name: string; game: string }) =>
    fetchAPI<GroupDetail>('/groups', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchAPI<{ ok?: boolean; detail?: string }>(`/groups/${id}`, {
      method: 'DELETE',
    }),

  getSecurity: (groupId: string) =>
    fetchAPI<GroupSecurityConfig>(`/groups/${groupId}/security`),

  updateSecurity: (groupId: string, data: GroupSecurityUpdatePayload) =>
    fetchAPI<GroupSecurityConfig>(`/groups/${groupId}/security`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getValidBlockedCountries: () =>
    fetchAPI<ValidBlockedCountriesResponse>(`/groups/security/valid-blocked-countries`),

  getAccounts: (id: string) =>
    fetchAPI<GroupLinkedEaAccount[]>(`/groups/${id}/ea-accounts`),

  getPlaygrounds: (groupId: string, eaPd: string) =>
    fetchAPI<OwnerPlaygroundListResponse>(`/groups/${groupId}/ea-accounts/${eaPd}/playgrounds`),

  getPlaygroundDetail: (groupId: string, playgroundId: string) =>
    fetchAPI(`/groups/${groupId}/playgrounds/${playgroundId}`),

  listMembers: (groupId: string) =>
  fetchAPI<GroupMembersResponse>(`/groups/${groupId}/members`),

  addMember: (groupId: string, data: GroupMemberCreatePayload) =>
    fetchAPI<GroupMemberItem>(`/groups/${groupId}/members`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateMember: (groupId: string, eaPd: string, data: GroupMemberUpdatePayload) =>
    fetchAPI<GroupMemberItem>(`/groups/${groupId}/members/${eaPd}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  removeMember: (groupId: string, eaPd: string) =>
    fetchAPI<GroupMemberRemoveResponse>(`/groups/${groupId}/members/${eaPd}`, {
      method: 'DELETE',
    }),
};

/* =========================
   SERVERS
========================= */

export const serversAPI = {
  list: (groupId: string) =>
    fetchAPI<GroupServerListResponse>(`/groups/${groupId}/servers`),

  listAll: () => 
    fetchAPI<GlobalServerListResponse>('/servers'),

  getLivePlayers: (gameId: string) =>
    fetchAPI<BfvPlayersResponse>(`/bfv/players/${gameId}`),

  link: (groupId: string, data: { playground_id: string; region?: string }) =>
    fetchAPI<GroupServerItem>(`/groups/${groupId}/servers/link`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  unlink: (groupId: string, data: { playground_id: string }) =>
    fetchAPI<{ ok: boolean; group_id: string; playground_id: string; status: string }>(
      `/groups/${groupId}/servers/unlink`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    ),

  start: (data: { ea_pd: string; playground_id: string; region?: string }) =>
    fetchAPI<ServerCreateResponse>(`/servers/create`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  status: (groupId: string, playgroundId: string) =>
    fetchAPI<GroupServerStatusResponse>(`/groups/${groupId}/servers/${playgroundId}/status`),
};

/* =========================
   BANS
========================= */

export const bansAPI = {
  list: (groupId: string) =>
    fetchAPI<GroupBanListResponse>(`/groups/${groupId}/bans`),

  add: (
    groupId: string,
    data: {
      ea_id: string;
      platform: string;
      reason_type: string;
      public_reason: string;
      staff_notes?: string;
      evidence_urls?: string[];
      visibility: string;
      is_global: boolean;
    }
  ) =>
    fetchAPI<GroupBanAddResponse>(`/groups/${groupId}/bans`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (groupId: string, eaId: string, data: GroupBanUpdatePayload) =>
    fetchAPI<GroupBanItem>(`/groups/${groupId}/bans/${eaId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
    
  remove: (groupId: string, eaId: string) =>
    fetchAPI<GroupBanRemoveResponse>(`/groups/${groupId}/bans/${eaId}`, {
      method: 'DELETE',
    }),
};

/* =========================
   VIPS
========================= */

export const vipsAPI = {
  list: (groupId: string) =>
    fetchAPI<GroupVipListResponse>(`/groups/${groupId}/vips`),

  add: (
    groupId: string,
    data: {
      ea_id: string;
      public_reason: string;
      staff_notes?: string;
      visibility: string;
    }
  ) =>
    fetchAPI<GroupVipAddResponse>(`/groups/${groupId}/vips`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  remove: (groupId: string, eaId: string) =>
    fetchAPI<GroupVipRemoveResponse>(`/groups/${groupId}/vips/${eaId}`, {
      method: 'DELETE',
    }),
};

/* =========================
   EA ACCOUNTS
========================= */

export const eaAccountsAPI = {
  list: () => fetchAPI<EAAccount[]>('/ea-accounts'),

  save: (data: { sid: string; remid: string; locale?: string }) =>
    fetchAPI('/ea-accounts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  remove: (eaPd: string) =>
    fetchAPI(`/ea-accounts/${eaPd}`, {
      method: 'DELETE',
    }),

  link: (groupId: string, data: { ea_pd: string }) =>
    fetchAPI(`/groups/${groupId}/ea-accounts/link`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  unlink: (groupId: string, eaPd: string) =>
    fetchAPI(`/groups/${groupId}/ea-accounts/${eaPd}`, {
      method: 'DELETE',
    }),
};