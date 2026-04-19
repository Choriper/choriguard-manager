import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Radar,
  Trophy,
  Activity,
  Wifi,
  User,
  Clock3,
  Shield,
} from 'lucide-react';

type SearchMode = 'name' | 'nucleus_id';

interface SearchUser {
  EAID: string;
  userId: string;
  id: string;
  avatarUrl?: string;
  subscriptionLevel?: string;
  subscriptionLevelIcon?: string;
  nickname?: string;
  platform?: string;
  status?: string;
  createdAt?: string;
  platformIcon?: string;
}

interface SearchResponse {
  error: boolean;
  message: string;
  users: SearchUser[];
}

interface NetworkPingSite {
  code: string;
  provider: string;
  city: string;
  country: string;
  country_code: string;
  continent: string;
  flag_emoji?: string;
  flag_url?: string;
  ping_ms: number | null;
}

interface NetworkResult {
  ok: boolean;
  message: string;
  status: string;
  player: {
    name: string;
    avatar?: string;
    personaId: number | string;
    userId: number | string;
    namespace?: string;
    location?: {
      id?: number | string;
      code?: string;
      language?: string;
      region?: string;
    };
    country?: {
      countryId?: number;
      name?: string;
      country_code?: string;
      continent?: string;
      flag_emoji?: string;
      flag_url?: string;
    };
  };
  network: {
    region?: NetworkPingSite;
    hardware_flags?: number;
    best_ping?: NetworkPingSite;
    ping_sites: NetworkPingSite[];
    quality?: {
      nat_attempts?: number;
      bandwidth_history?: number;
      download_bps?: number;
      upload_bps?: number;
      nat_history?: number;
    };
  };
  session?: {
    session_blob_id?: number | string;
    active_game_id?: number | string;
    active_game_blob_id?: number | string;
  };
}

interface NetworkResponse {
  ok: boolean;
  count: number;
  results: NetworkResult[];
}

interface DetailedStatsResponse {
  platform: string;
  personaId: string;
  bbPrefix?: string;
  result: {
    basicStats?: {
      timePlayed?: number;
      wins?: number;
      losses?: number;
      kills?: number;
      deaths?: number;
      kpm?: number;
      spm?: number;
      skill?: number;
      soldierImageUrl?: string;
      rankNumber?: number;
      rankName?: string;
      rankImageUrl?: string;
      rankProgressCurrent?: number;
      rankProgressTotal?: number;
    };
    accuracyRatio?: number;
    headShots?: number;
    longestHeadShot?: number;
    revives?: number;
    heals?: number;
    repairs?: number;
    killAssists?: number;
    kdr?: number;
    highestKillStreak?: number;
    roundsPlayed?: number;
    flagsCaptured?: number;
    flagsDefended?: number;
    topClass?: {
      name?: string;
      code?: string;
      timePlayed?: number;
      stats?: {
        kd?: number;
        kad?: number;
        accuracy?: number;
        score?: number;
        kills?: number;
        deaths?: number;
        hits?: number;
        shots?: number;
        rank?: number;
        perMinute?: {
          kills?: number;
          deaths?: number;
          score?: number;
          shots?: number;
          hits?: number;
        };
      };
    };
  };
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.detail || data?.message || `HTTP ${response.status}`);
  }

  return data as T;
}

function pingWidth(ping: number | null) {
  if (ping == null) return 6;
  return Math.max(8, Math.min(100, 100 - ping / 4));
}

function pingColor(ping: number | null) {
  if (ping == null) return 'bg-zinc-600';
  if (ping <= 40) return 'bg-green-500';
  if (ping <= 90) return 'bg-lime-400';
  if (ping <= 150) return 'bg-yellow-400';
  if (ping <= 220) return 'bg-orange-400';
  return 'bg-red-500';
}

function formatSeconds(seconds?: number) {
  if (!seconds) return '-';

  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);

  return `${h}h ${m}m`;
}

function normalizePlayerStatus(status?: string) {
  if (!status) {
    return {
      label: 'Unknown',
      dot: 'bg-zinc-500',
      border: 'border-zinc-800',
      bg: 'bg-zinc-950/40',
      text: 'text-zinc-200',
    };
  }

  const value = status.toLowerCase();

  if (value === 'offline') {
    return {
      label: 'Offline',
      dot: 'bg-zinc-500',
      border: 'border-zinc-800',
      bg: 'bg-zinc-950/40',
      text: 'text-zinc-200',
    };
  }

  if (value === 'in_game' || value === 'online') {
    return {
      label: value === 'in_game' ? 'In Game' : 'Online',
      dot: 'bg-green-500',
      border: 'border-green-900/60',
      bg: 'bg-green-950/30',
      text: 'text-green-200',
    };
  }

  return {
    label: status,
    dot: 'bg-blue-500',
    border: 'border-blue-900/60',
    bg: 'bg-blue-950/30',
    text: 'text-blue-200',
  };
}

function InfoCard({
  label,
  value,
  icon,
  mono = false,
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 shadow-lg shadow-black/20">
      <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
        {icon}
        <span>{label}</span>
      </div>
      <div className={`text-white ${mono ? 'font-mono text-sm break-all' : 'text-lg font-semibold'}`}>
        {value}
      </div>
    </div>
  );
}

export function PlayerPage() {
  const navigate = useNavigate();
  const [searchMode, setSearchMode] = useState<SearchMode>('name');
  const [query, setQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [playerLoading, setPlayerLoading] = useState(false);

  const [users, setUsers] = useState<SearchUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null);
  const [networkResult, setNetworkResult] = useState<NetworkResult | null>(null);
  const [statsResult, setStatsResult] = useState<DetailedStatsResponse | null>(null);
  const [error, setError] = useState('');

  const sortedPingSites = useMemo(() => {
    const sites = networkResult?.network?.ping_sites || [];
    return [...sites].sort((a, b) => {
      if (a.ping_ms == null) return 1;
      if (b.ping_ms == null) return -1;
      return a.ping_ms - b.ping_ms;
    });
  }, [networkResult]);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!query.trim()) return;

    try {
      setSearchLoading(true);
      setError('');
      setUsers([]);
      setSelectedUser(null);
      setNetworkResult(null);
      setStatsResult(null);

      const qs =
        searchMode === 'name'
          ? `name=${encodeURIComponent(query.trim())}`
          : `nucleus_id=${encodeURIComponent(query.trim())}`;

      const data = await fetchJson<SearchResponse>(`https://rip-bf.com/api/eaid/?${qs}`);

      if (data.error) {
        throw new Error(data.message || 'Falha na busca');
      }

      const list = Array.isArray(data.users) ? data.users : [];
      setUsers(list);

      if (list.length === 1) {
        await handleSelectUser(list[0]);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Falha ao buscar jogador.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectUser = async (user: SearchUser) => {
    try {
      setSelectedUser(user);
      setPlayerLoading(true);
      setError('');

      const personaId = user.id;

      const [networkData, statsData] = await Promise.all([
        fetchJson<NetworkResponse>(
          `https://api.choriper.com/bfv/playersNetwork?personaId=${encodeURIComponent(
            personaId
          )}&avatar=true`
        ),
        fetchJson<DetailedStatsResponse>(
          `https://api.choriper.com/bfv/getdetailedStats?personaId=${encodeURIComponent(
            personaId
          )}&platform=pc`
        ),
      ]);

      setNetworkResult(networkData?.results?.[0] || null);
      setStatsResult(statsData);
    } catch (err: any) {
      console.error(err);
      setNetworkResult(null);
      setStatsResult(null);
      setError(err?.message || 'Falha ao carregar dados do jogador.');
    } finally {
      setPlayerLoading(false);
    }
  };

  const bestPingCode = networkResult?.network?.best_ping?.code;

    const finalStatus = normalizePlayerStatus(
    networkResult?.status || selectedUser?.status
  );

  const activeGameId = networkResult?.session?.active_game_id
    ? String(networkResult.session.active_game_id)
    : '';

  const handleOpenActiveServer = () => {
    if (!activeGameId) return;
    navigate(`/servers?gameid=${encodeURIComponent(activeGameId)}`);
  };

  return (
    <div className="p-6 md:p-8 text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Player</h1>
        <p className="text-zinc-400">
          Pesquise por nome ou nucleus id e carregue network + stats detalhados.
        </p>
      </div>

      <form
        onSubmit={handleSearch}
        className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-2xl shadow-black/20 mb-8"
      >
        <div className="flex flex-wrap gap-3 mb-4">
          <button
            type="button"
            onClick={() => setSearchMode('name')}
            className={`px-4 py-2 rounded-full border transition-colors ${
              searchMode === 'name'
                ? 'bg-white text-black border-white'
                : 'bg-zinc-950 text-zinc-300 border-zinc-700 hover:bg-zinc-800'
            }`}
          >
            Buscar por nome
          </button>

          <button
            type="button"
            onClick={() => setSearchMode('nucleus_id')}
            className={`px-4 py-2 rounded-full border transition-colors ${
              searchMode === 'nucleus_id'
                ? 'bg-white text-black border-white'
                : 'bg-zinc-950 text-zinc-300 border-zinc-700 hover:bg-zinc-800'
            }`}
          >
            Buscar por nucleus_id
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              searchMode === 'name' ? 'Ex: jn-nicolas' : 'Ex: 1016126611454'
            }
            className="flex-1 rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white focus:outline-none focus:border-zinc-500"
          />

          <button
            type="submit"
            disabled={searchLoading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white text-black px-5 py-3 font-medium hover:bg-zinc-100 disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            {searchLoading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-900/70 bg-red-950/30 px-4 py-3 text-red-300">
            {error}
          </div>
        )}
      </form>

      {users.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Resultados</h2>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {users.map((user) => {
              const active = selectedUser?.id === user.id;

              return (
                <button
                  key={`${user.id}-${user.userId}`}
                  type="button"
                  onClick={() => handleSelectUser(user)}
                  className={`text-left rounded-3xl border p-4 transition-all ${
                    active
                      ? 'border-green-500/60 bg-green-950/20 shadow-lg shadow-green-950/20'
                      : 'border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.EAID}
                        className="w-16 h-16 rounded-2xl object-cover border border-zinc-800"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700" />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="text-lg font-semibold text-white truncate">
                        {user.nickname || user.EAID}
                      </div>
                      <div className="text-sm text-zinc-400 truncate">{user.EAID}</div>

                      <div className="mt-3 space-y-1 text-sm">
                        <div>
                          <span className="text-zinc-500">personaId:</span>{' '}
                          <span className="text-white font-mono">{user.id}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500">userId:</span>{' '}
                          <span className="text-white font-mono">{user.userId}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500">status:</span>{' '}
                          <span className="text-white">{user.status || '-'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {playerLoading && (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-8 text-zinc-400">
          Carregando network e stats do jogador...
        </div>
      )}

      {selectedUser && !playerLoading && (
        <div className="space-y-8">
          <div className="rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 p-6 shadow-2xl shadow-black/20">
            <div className="flex flex-col xl:flex-row gap-6 xl:items-center">
              <div className="flex items-start gap-5">
                {(networkResult?.player?.avatar || selectedUser.avatarUrl) ? (
                  <img
                    src={networkResult?.player?.avatar || selectedUser.avatarUrl}
                    alt={selectedUser.EAID}
                    className="w-24 h-24 rounded-3xl object-cover border border-zinc-800"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-3xl bg-zinc-800 border border-zinc-700" />
                )}

                <div>
                  <div className="text-3xl font-semibold">
                    {selectedUser.nickname || networkResult?.player?.name || selectedUser.EAID}
                  </div>
                  <div className="text-zinc-400 mt-1">{selectedUser.EAID}</div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full border border-zinc-700 bg-zinc-950 text-sm">
                      personaId: <span className="font-mono">{selectedUser.id}</span>
                    </span>
                    <span className="px-3 py-1 rounded-full border border-zinc-700 bg-zinc-950 text-sm">
                      userId: <span className="font-mono">{selectedUser.userId}</span>
                    </span>
                    <span className="px-3 py-1 rounded-full border border-zinc-700 bg-zinc-950 text-sm">
                      plataforma: {selectedUser.platform || 'pc'}
                    </span>
                    <span
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm ${finalStatus.border} ${finalStatus.bg} ${finalStatus.text}`}
                    >
                    <span className={`w-2.5 h-2.5 rounded-full ${finalStatus.dot}`} />
                    status: {finalStatus.label}
                    </span>
                  </div>
                </div>
              </div>

                <div className="xl:ml-auto flex flex-wrap gap-4">
                <div className={`rounded-2xl border px-4 py-3 ${finalStatus.border} ${finalStatus.bg}`}>
                    <div className={`text-xs uppercase tracking-wide mb-1 ${finalStatus.text}`}>
                    Status
                    </div>

                    <div className="flex items-center gap-3">
                    <span className="relative flex h-3 w-3">
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${finalStatus.dot}`} />
                    </span>
                    <span className="text-white font-semibold">{finalStatus.label}</span>
                    </div>

                    <div className="text-xs text-zinc-400 mt-1">
                    {networkResult?.message || '-'}
                    </div>
                </div>

                <div className="rounded-2xl border border-green-900/60 bg-green-950/30 px-4 py-3 min-w-[150px]">
                    <div className="text-xs uppercase tracking-wide text-green-300 mb-1">
                    Melhor ping
                    </div>

                    <div className="flex items-center gap-3">
                    {networkResult?.network?.best_ping?.flag_url ? (
                        <img
                        src={networkResult.network.best_ping.flag_url}
                        alt={networkResult.network.best_ping.country_code || 'flag'}
                        className="w-5 h-5 rounded-full object-cover border border-white/10"
                        />
                    ) : (
                        <span className="text-lg">
                        {networkResult?.network?.best_ping?.flag_emoji || '🌐'}
                        </span>
                    )}

                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                    </span>

                    <span className="text-white font-semibold">
                        {networkResult?.network?.best_ping?.ping_ms != null
                        ? `${networkResult.network.best_ping.ping_ms} ms`
                        : '-'}
                    </span>
                    </div>

                    <div className="text-xs text-zinc-300 mt-1">
                    {(networkResult?.network?.best_ping?.flag_emoji || '')}{' '}
                    {networkResult?.network?.best_ping?.code || '-'}
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleOpenActiveServer}
                    disabled={!activeGameId}
                    className={`rounded-2xl border px-4 py-3 text-left transition-colors min-w-[180px] ${
                    activeGameId
                        ? 'border-zinc-700 bg-zinc-950/50 hover:bg-zinc-900'
                        : 'border-zinc-800 bg-zinc-950/30 opacity-60 cursor-not-allowed'
                    }`}
                >
                    <div className="text-xs uppercase tracking-wide text-zinc-400 mb-1">
                    Partida ativa
                    </div>

                    <div className="text-white font-semibold font-mono">
                    {activeGameId || '-'}
                    </div>

                    <div className="text-xs text-zinc-400 mt-1">
                    {activeGameId ? 'Abrir server' : 'Sem partida ativa'}
                    </div>
                </button>
                </div>
            </div>
          </div>

          <div className="grid xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-lg shadow-black/20">
              <div className="flex items-center gap-2 mb-5">
                <Radar className="w-5 h-5 text-zinc-300" />
                <h2 className="text-xl font-semibold">Players Network</h2>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <InfoCard
                  label="Região atual"
                    value={
                    networkResult?.network?.region
                        ? `${networkResult.network.region.flag_emoji || ''} ${networkResult.network.region.city} / ${networkResult.network.region.code}`
                        : '-'
                    }
                  icon={<Wifi className="w-4 h-4" />}
                />

                <InfoCard
                  label="País da conta"
                    value={
                    networkResult?.player?.country?.name
                        ? `${networkResult.player.country.flag_emoji || ''} ${networkResult.player.country.name} (${networkResult.player.country.country_code || '-'})`
                        : '-'
                    }
                  icon={<User className="w-4 h-4" />}
                />

                <InfoCard
                  label="Session blob"
                  value={String(networkResult?.session?.session_blob_id || '-')}
                  icon={<Shield className="w-4 h-4" />}
                  mono
                />
              </div>

              <div className="space-y-3">
                {sortedPingSites.map((site) => (
                  <div
                    key={site.code}
                    className={`rounded-2xl border p-4 transition-all ${
                      site.code === bestPingCode
                        ? 'border-green-800 bg-green-950/20'
                        : 'border-zinc-800 bg-zinc-950/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <div className="min-w-0">
                        <div className="text-white font-medium truncate">
                          {site.flag_emoji ? `${site.flag_emoji} ` : ''}
                          {site.city} · {site.provider}
                        </div>
                        <div className="text-sm text-zinc-400">
                          {site.country} · {site.code}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-white font-semibold">
                          {site.ping_ms != null ? `${site.ping_ms} ms` : '-'}
                        </div>
                      </div>
                    </div>

                    <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className={`h-2 rounded-full ${pingColor(site.ping_ms)} ${
                          site.code === bestPingCode ? 'animate-pulse' : ''
                        }`}
                        style={{
                          width: `${pingWidth(site.ping_ms)}%`,
                          transition: 'width 700ms ease',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-lg shadow-black/20">
              <div className="flex items-center gap-2 mb-5">
                <Clock3 className="w-5 h-5 text-zinc-300" />
                <h2 className="text-xl font-semibold">Resumo rápido</h2>
              </div>

              <div className="space-y-4">
                <InfoCard
                  label="Tempo jogado"
                  value={formatSeconds(statsResult?.result?.basicStats?.timePlayed)}
                />
                <InfoCard
                  label="Rank"
                  value={statsResult?.result?.basicStats?.rankName || '-'}
                />
                <InfoCard
                  label="Classe principal"
                  value={statsResult?.result?.topClass?.name || '-'}
                />
                <InfoCard
                  label="KDR"
                  value={statsResult?.result?.kdr?.toFixed(2) || '-'}
                />
                <InfoCard
                  label="Accuracy"
                  value={
                    statsResult?.result?.accuracyRatio != null
                      ? `${(statsResult.result.accuracyRatio * 100).toFixed(2)}%`
                      : '-'
                  }
                />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
            <InfoCard
              label="Kills"
              value={statsResult?.result?.basicStats?.kills || 0}
              icon={<Trophy className="w-4 h-4" />}
            />
            <InfoCard
              label="Deaths"
              value={statsResult?.result?.basicStats?.deaths || 0}
              icon={<Activity className="w-4 h-4" />}
            />
            <InfoCard
              label="KPM"
              value={statsResult?.result?.basicStats?.kpm?.toFixed(2) || '-'}
              icon={<Activity className="w-4 h-4" />}
            />
            <InfoCard
              label="SPM"
              value={statsResult?.result?.basicStats?.spm?.toFixed(2) || '-'}
              icon={<Activity className="w-4 h-4" />}
            />
            <InfoCard
              label="Wins"
              value={statsResult?.result?.basicStats?.wins || 0}
              icon={<Trophy className="w-4 h-4" />}
            />
            <InfoCard
              label="Losses"
              value={statsResult?.result?.basicStats?.losses || 0}
              icon={<Trophy className="w-4 h-4" />}
            />
            <InfoCard
              label="Headshots"
              value={statsResult?.result?.headShots || 0}
              icon={<Trophy className="w-4 h-4" />}
            />
            <InfoCard
              label="Longest HS"
              value={statsResult?.result?.longestHeadShot || 0}
              icon={<Trophy className="w-4 h-4" />}
            />
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-lg shadow-black/20">
            <div className="flex items-center gap-2 mb-5">
              <Trophy className="w-5 h-5 text-zinc-300" />
              <h2 className="text-xl font-semibold">Top Class</h2>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-4">
              <InfoCard
                label="Classe"
                value={statsResult?.result?.topClass?.name || '-'}
              />
              <InfoCard
                label="Kills"
                value={statsResult?.result?.topClass?.stats?.kills || 0}
              />
              <InfoCard
                label="Deaths"
                value={statsResult?.result?.topClass?.stats?.deaths || 0}
              />
              <InfoCard
                label="KD"
                value={statsResult?.result?.topClass?.stats?.kd?.toFixed(2) || '-'}
              />
              <InfoCard
                label="Accuracy"
                value={
                  statsResult?.result?.topClass?.stats?.accuracy != null
                    ? `${statsResult.result.topClass.stats.accuracy.toFixed(1)}%`
                    : '-'
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}