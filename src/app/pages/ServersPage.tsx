import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Server,
  Users,
  Activity,
  Eye,
  Filter,
  ArrowLeft,
  Ban,
  Copy,
} from 'lucide-react';
import {
  serversAPI,
  GlobalServerItem,
  BfvPlayersResponse,
  BfvPlayerItem,
  groupsAPI,
  GroupListItem,
  bansAPI,
} from '../services/api';

export function ServersPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [servers, setServers] = useState<GlobalServerItem[]>([]);
  const [liveServer, setLiveServer] = useState<BfvPlayersResponse | null>(null);
  const [liveLinkedServer, setLiveLinkedServer] = useState<GlobalServerItem | null>(null);
  const [groups, setGroups] = useState<GroupListItem[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<BfvPlayerItem | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [loading, setLoading] = useState(true);
  const [banLoading, setBanLoading] = useState(false);

  const gameIdFilter = searchParams.get('gameid') || '';

  useEffect(() => {
    if (gameIdFilter) {
      loadLiveServer(gameIdFilter);
    } else {
      loadServers();
    }
  }, [gameIdFilter]);

  const loadServers = async () => {
    try {
      setLoading(true);
      setLiveServer(null);
      setLiveLinkedServer(null);
      setSelectedPlayer(null);

      const data = await serversAPI.listAll();
      setServers(Array.isArray(data?.items) ? data.items : []);
    } catch (error) {
      console.error('Failed to load servers:', error);
      setServers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadLiveServer = async (gameId: string) => {
    try {
      setLoading(true);
      setSelectedPlayer(null);

      const [liveData, allServersData, groupsData] = await Promise.all([
        serversAPI.getLivePlayers(gameId),
        serversAPI.listAll(),
        groupsAPI.list(),
      ]);

      const allServers = Array.isArray(allServersData?.items) ? allServersData.items : [];
      const allGroups = Array.isArray(groupsData?.items) ? groupsData.items : [];
      const matchedLinkedServer =
        allServers.find((server) => String(server.game_id) === String(gameId)) || null;

      setLiveServer(liveData);
      setLiveLinkedServer(matchedLinkedServer);
      setGroups(allGroups);
      setSelectedGroupId(matchedLinkedServer?.group_id || allGroups[0]?.group_id || '');
    } catch (error) {
      console.error('Failed to load live server:', error);
      setLiveServer(null);
      setLiveLinkedServer(null);
      setGroups([]);
      setSelectedGroupId('');
    } finally {
      setLoading(false);
    }
  };

  const filteredServers = useMemo(() => {
    if (!gameIdFilter) return servers;
    return servers.filter((server) => String(server.game_id) === String(gameIdFilter));
  }, [servers, gameIdFilter]);

  const queueAndLoading = useMemo(() => {
    if (!liveServer) return [];
    return [...(liveServer.que || []), ...(liveServer.loading || [])];
  }, [liveServer]);

  const totalLoadedPlayers = useMemo(() => {
    if (!liveServer) return 0;

    const teamPlayers = (liveServer.teams || []).reduce(
      (sum, team) => sum + (team.players?.length || 0),
      0
    );

    return (
      teamPlayers +
      (liveServer.spectators?.length || 0) +
      (liveServer.que?.length || 0) +
      (liveServer.loading?.length || 0)
    );
  }, [liveServer]);

  const handleOpenServer = (gameId: string | null) => {
    if (!gameId) return;
    setSearchParams({ gameid: gameId });
  };

  const clearFilter = () => {
    navigate('/servers');
  };

  const copyGameId = async () => {
    if (!gameIdFilter) return;

    try {
      await navigator.clipboard.writeText(gameIdFilter);
    } catch (error) {
      console.error('Failed to copy game ID:', error);
    }
  };

  const handleBanSelectedPlayer = async () => {
    if (!selectedPlayer) {
      alert('Selecione um jogador primeiro.');
      return;
    }

    if (!selectedGroupId) {
      alert('Selecione um grupo.');
      return;
    }

    const publicReason = prompt('Motivo público do ban:', 'Cheat confirmado');
    if (!publicReason) return;

    const staffNotes =
      prompt(
        'Notas internas da equipe:',
        `Ban aplicado pela tela ao vivo do servidor ${liveServer?.serverinfo?.name || ''}`
      ) || '';

    try {
      setBanLoading(true);

      await bansAPI.add(selectedGroupId, {
        ea_id: String(selectedPlayer.player_id),
        platform: 'pc',
        reason_type: 'other',
        public_reason: publicReason.trim(),
        staff_notes: staffNotes.trim(),
        evidence_urls: [],
        visibility: 'public',
      });

      alert(`Ban enviado para o grupo selecionado.`);
    } catch (error) {
      console.error('Failed to ban selected player:', error);
      alert('Falha ao adicionar ban.');
    } finally {
      setBanLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  if (gameIdFilter) {
    if (!liveServer) {
      return (
        <div className="p-8">
          <div className="mb-6">
            <button
              onClick={clearFilter}
              className="inline-flex items-center gap-2 px-4 py-2 border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-zinc-400">
            Não foi possível carregar o servidor ao vivo para o game ID {gameIdFilter}.
          </div>
        </div>
      );
    }

    const info = liveServer.serverinfo;
    const teamOne = liveServer.teams?.[0]?.players || [];
    const teamTwo = liveServer.teams?.[1]?.players || [];

    return (
      <div className="p-6">
        <div className="mb-4">
          <button
            onClick={clearFilter}
            className="inline-flex items-center gap-2 px-4 py-2 border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
        </div>

        {selectedPlayer && (
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4">
            <ChipOnline label="Online" />

            <button
              onClick={copyGameId}
              className="rounded-full border border-blue-900/60 bg-blue-950/40 px-4 py-2 text-sm text-blue-100 hover:bg-blue-900/40"
            >
              Copiar GameID
            </button>

            <Chip label="Player" value={selectedPlayer.name} />
            <Chip label="ID" value={String(selectedPlayer.player_id)} />
            <Chip label="UID" value={String(selectedPlayer.user_id)} />
            <Chip label="Ping" value={`${selectedPlayer.latency} ms`} />
            <Chip label="Slot" value={String(selectedPlayer.slot)} />

            <div className="min-w-[240px]">
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full rounded-full border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm text-white focus:outline-none focus:border-zinc-500"
              >
                <option value="">Selecione um grupo</option>
                {groups.map((group) => (
                  <option key={group.group_id} value={group.group_id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleBanSelectedPlayer}
              disabled={banLoading || !selectedGroupId}
              className="inline-flex items-center gap-2 rounded-full border border-red-900/60 bg-red-950/40 px-4 py-2 text-sm text-red-200 hover:bg-red-900/40 disabled:opacity-50"
            >
              <Ban className="w-4 h-4" />
              {banLoading ? 'Banindo...' : 'Banir'}
            </button>
          </div>
        )}

        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl text-white font-semibold">Current Game</h1>
            <p className="text-zinc-400 text-sm">{info.name}</p>
          </div>

          <div className="text-sm text-zinc-300 font-semibold">
            Jogadores carregados
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <GameColumn
            title="Time 1"
            subtitle={`${teamOne.length} players`}
            players={teamOne}
            selectedPlayer={selectedPlayer}
            onSelectPlayer={setSelectedPlayer}
          />

          <GameColumn
            title="Time 2"
            subtitle={`${teamTwo.length} players`}
            players={teamTwo}
            selectedPlayer={selectedPlayer}
            onSelectPlayer={setSelectedPlayer}
          />

          <GameColumn
            title="Fila / Loading"
            subtitle={`${queueAndLoading.length} players`}
            players={queueAndLoading}
            selectedPlayer={selectedPlayer}
            onSelectPlayer={setSelectedPlayer}
          />

          <GameColumn
            title="Spectators"
            subtitle={`${liveServer.spectators.length} players`}
            players={liveServer.spectators}
            selectedPlayer={selectedPlayer}
            onSelectPlayer={setSelectedPlayer}
          />
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <InfoCard label="Players" value={`${info.currentPlayers} / ${info.maxPlayers}`} />
          <InfoCard label="Map" value={info.currentMap || info.mapPretty || '-'} />
          <InfoCard label="Mode" value={info.modePretty || info.mode || '-'} />
          <InfoCard label="Game ID" value={String(info.gameId)} mono />
          <InfoCard label="Queue" value={String(info.queue)} />
          <InfoCard label="Spectators" value={String(info.spectators)} />
          <InfoCard label="Region" value={info.region} />
          <InfoCard label="Playground ID" value={info.playgroundId} mono />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl text-white mb-1">Servers</h1>
          <p className="text-zinc-400">Monitor and manage linked game servers</p>
        </div>

        {gameIdFilter && (
          <button
            onClick={clearFilter}
            className="px-4 py-2 border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            Limpar filtro
          </button>
        )}
      </div>

      {gameIdFilter && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm">
          <Filter className="w-4 h-4 text-zinc-400" />
          <span className="text-zinc-400">Filtrando por game ID:</span>
          <span className="text-white font-mono">{gameIdFilter}</span>
        </div>
      )}

      {filteredServers.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-zinc-400">
          Nenhum server encontrado.
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredServers.map((server) => (
            <div
              key={server.server_id}
              className={`bg-zinc-900 border rounded-lg p-6 ${
                server.online ? 'border-green-900/60' : 'border-zinc-800'
              }`}
            >
              <div className="flex items-start justify-between mb-4 gap-4">
                <div className="flex items-start gap-4 flex-1">
                  {server.map_image ? (
                    <img
                      src={server.map_image}
                      alt={server.current_map || server.server_name || 'Server'}
                      className="w-24 h-16 rounded-lg object-cover border border-zinc-800"
                    />
                  ) : (
                    <div className="w-24 h-16 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                      <Server className="w-6 h-6 text-zinc-400" />
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg text-white">
                        {server.server_name || 'Sem nome'}
                      </h3>

                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          server.online ? 'bg-green-500' : 'bg-zinc-500'
                        }`}
                      />

                      <span
                        className={`text-sm ${
                          server.online ? 'text-green-400' : 'text-zinc-500'
                        }`}
                      >
                        {server.online ? 'online' : 'offline'}
                      </span>
                    </div>

                    <div className="text-sm text-zinc-400">
                      Grupo: <span className="text-white">{server.group_name}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 min-w-[140px]">
                  {server.game_id && (
                    <button
                      onClick={() => handleOpenServer(server.game_id)}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      Ver server
                    </button>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-6">
                <div>
                  <div className="flex items-center gap-2 text-zinc-500 text-sm mb-1">
                    <Users className="w-4 h-4" />
                    Players
                  </div>
                  <div className="text-white">
                    {server.playerAmount ?? '-'} / {server.maxPlayers ?? '-'}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-zinc-500 text-sm mb-1">
                    <Activity className="w-4 h-4" />
                    Current Map
                  </div>
                  <div className="text-white">{server.current_map || '-'}</div>
                </div>

                <div>
                  <div className="text-zinc-500 text-sm mb-1">Mode</div>
                  <div className="text-white">{server.mode || '-'}</div>
                </div>

                <div>
                  <div className="text-zinc-500 text-sm mb-1">Game ID</div>
                  <div className="text-white font-mono text-sm break-all">
                    {server.game_id || '-'}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-6 mt-6 text-sm">
                <div>
                  <span className="text-zinc-500">Playground ID:</span>
                  <div className="text-white font-mono break-all mt-1">
                    {server.playground_id}
                  </div>
                </div>

                <div>
                  <span className="text-zinc-500">Config:</span>
                  <div className="text-white mt-1">{server.config_name || '-'}</div>
                </div>

                <div>
                  <span className="text-zinc-500">Region:</span>
                  <div className="text-white mt-1">{server.region || '-'}</div>
                </div>

                <div>
                  <span className="text-zinc-500">Status source:</span>
                  <div className="text-white mt-1">{server.status_source || '-'}</div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-6 text-sm">
                <div>
                  <span className="text-zinc-500">Spectators:</span>
                  <div className="text-white mt-1">{server.inSpectator ?? '-'}</div>
                </div>

                <div>
                  <span className="text-zinc-500">Queue:</span>
                  <div className="text-white mt-1">{server.inQue ?? '-'}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GameColumn({
  title,
  subtitle,
  players,
  selectedPlayer,
  onSelectPlayer,
}: {
  title: string;
  subtitle: string;
  players: BfvPlayerItem[];
  selectedPlayer: BfvPlayerItem | null;
  onSelectPlayer: (player: BfvPlayerItem) => void;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#16233a] p-4">
      <h2 className="text-white text-xl font-semibold mb-1">{title}</h2>
      <p className="text-zinc-400 text-sm mb-4">{subtitle}</p>

      {players.length === 0 ? (
        <div className="text-zinc-500 text-sm">0 players</div>
      ) : (
        <div className="space-y-2">
          {players.map((player, index) => {
            const isSelected =
              selectedPlayer &&
              String(selectedPlayer.player_id) === String(player.player_id) &&
              String(selectedPlayer.user_id) === String(player.user_id);

            return (
              <button
                key={`${title}-${player.player_id}-${index}`}
                onClick={() => onSelectPlayer(player)}
                className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                  isSelected
                    ? 'border-blue-500 bg-blue-950/40'
                    : 'border-zinc-800 bg-[#0f1b30] hover:bg-[#13213a]'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-white font-semibold truncate">
                    {player.name}
                  </span>
                  <span className="text-zinc-300 text-sm whitespace-nowrap">
                    Ping: {player.latency > 0 ? `${player.latency} ms` : '- ms'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Chip({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-full border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm text-zinc-200">
      <span className="text-zinc-400">{label}: </span>
      <span className="text-white font-semibold">{value}</span>
    </div>
  );
}

function ChipOnline({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-green-900/60 bg-green-950/40 px-4 py-2 text-sm text-green-200">
      <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
      <span className="font-semibold">{label}</span>
    </div>
  );
}

function InfoCard({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <div className="text-zinc-500 text-sm mb-1">{label}</div>
      <div className={`text-white ${mono ? 'font-mono text-sm break-all' : ''}`}>
        {value}
      </div>
    </div>
  );
}