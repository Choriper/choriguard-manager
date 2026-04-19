import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Search, X } from 'lucide-react';
import { bansAPI } from '../services/api';

const GROUP_ID = 'ab90478d-466d-435b-a846-52e68adf1527';

interface AppliedServer {
  server_id?: string;
  game_id?: string;
  server_name?: string;
  ok?: boolean;
  message?: string;
}

interface BanItem {
  ban_id: string;
  group_id: string;
  ea_id: string;
  is_global: boolean;
  source_mode: string;
  matched_loc: number | null;
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
  applied_servers: AppliedServer[];
}

interface BansListResponse {
  items: BanItem[];
}

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

interface PlayerSearchResponse {
  error: boolean;
  message: string;
  users: SearchUser[];
}

export function BansPage() {
  const [bans, setBans] = useState<BanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadBans();
  }, []);

  const loadBans = async () => {
    try {
      setLoading(true);
      const data = (await bansAPI.list(GROUP_ID)) as BansListResponse;
      setBans(Array.isArray(data?.items) ? data.items : []);
    } catch (error) {
      console.error('Failed to load bans:', error);
      setBans([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredBans = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return bans;

    return bans.filter((ban) => {
      const haystack = [
        ban.ea_id,
        ban.name || '',
        ban.nickname || '',
        ban.account_id || '',
        ban.public_reason || '',
        ban.staff_notes || '',
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [bans, filter]);

  const handleUnban = async (eaId: string) => {
    if (!confirm(`Remover ban do EA ID ${eaId}?`)) return;

    try {
      await bansAPI.remove(GROUP_ID, eaId);
      await loadBans();
    } catch (error) {
      console.error('Failed to remove ban:', error);
      alert('Falha ao remover ban.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 text-white">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl text-white mb-1">Bans</h1>
          <p className="text-zinc-400">Manage banned players in this group</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg hover:bg-zinc-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Ban
        </button>
      </div>

      <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
        <div className="flex items-center gap-3">
          <Search className="w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Pesquisar por EA ID, nome, nickname, motivo..."
            className="w-full bg-transparent text-white placeholder:text-zinc-500 focus:outline-none"
          />
        </div>
      </div>

      {filteredBans.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-zinc-400">
          Nenhum ban encontrado.
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredBans.map((ban) => (
            <div
              key={ban.ban_id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4 flex-1 min-w-0">
                  {ban.avatar ? (
                    <img
                      src={ban.avatar}
                      alt={ban.nickname || ban.name || ban.ea_id}
                      className="w-16 h-16 rounded-2xl object-cover border border-zinc-800"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700" />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-white">
                        {ban.nickname || ban.name || ban.ea_id}
                      </h3>

                      <span className="px-2 py-1 rounded-full border border-red-900/60 bg-red-950/30 text-red-200 text-xs">
                        {ban.status}
                      </span>

                      {ban.is_global && (
                        <span className="px-2 py-1 rounded-full border border-yellow-900/60 bg-yellow-950/30 text-yellow-200 text-xs">
                          global
                        </span>
                      )}
                    </div>

                    <div className="text-sm text-zinc-400 mb-3">
                      {ban.name && ban.nickname && ban.name !== ban.nickname
                        ? `${ban.name} (${ban.nickname})`
                        : ban.name || ban.nickname || '-'}
                    </div>

                    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-zinc-500">EA ID:</span>{' '}
                        <span className="text-white font-mono">{ban.ea_id}</span>
                      </div>

                      <div>
                        <span className="text-zinc-500">Account ID:</span>{' '}
                        <span className="text-white font-mono">{ban.account_id || '-'}</span>
                      </div>

                      <div>
                        <span className="text-zinc-500">Platform:</span>{' '}
                        <span className="text-white">{ban.platform}</span>
                      </div>

                      <div>
                        <span className="text-zinc-500">Reason type:</span>{' '}
                        <span className="text-white">{ban.reason_type}</span>
                      </div>

                      <div>
                        <span className="text-zinc-500">Visibility:</span>{' '}
                        <span className="text-white">{ban.visibility}</span>
                      </div>

                      <div>
                        <span className="text-zinc-500">Created:</span>{' '}
                        <span className="text-white">
                          {new Date(ban.created_at).toLocaleString('pt-BR')}
                        </span>
                      </div>

                      <div>
                        <span className="text-zinc-500">Applied servers:</span>{' '}
                        <span className="text-white">{ban.applied_servers?.length || 0}</span>
                      </div>

                      <div>
                        <span className="text-zinc-500">By user:</span>{' '}
                        <span className="text-white">{ban.banned_by_user_id}</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="text-zinc-500 text-sm mb-1">Public reason</div>
                      <div className="text-white">{ban.public_reason || '-'}</div>
                    </div>

                    <div className="mt-3">
                      <div className="text-zinc-500 text-sm mb-1">Staff notes</div>
                      <div className="text-white whitespace-pre-wrap">
                        {ban.staff_notes || '-'}
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="text-zinc-500 text-sm mb-2">Evidence URLs</div>
                      {ban.evidence_urls?.length ? (
                        <div className="space-y-1">
                          {ban.evidence_urls.map((url, index) => (
                            <a
                              key={index}
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="block text-blue-400 hover:text-blue-300 break-all"
                            >
                              {url}
                            </a>
                          ))}
                        </div>
                      ) : (
                        <div className="text-white">-</div>
                      )}
                    </div>

                    {ban.applied_servers?.length > 0 && (
                      <div className="mt-4">
                        <div className="text-zinc-500 text-sm mb-2">Applied servers</div>
                        <div className="space-y-2">
                          {ban.applied_servers.map((server, index) => (
                            <div
                              key={`${server.server_id || server.game_id || index}`}
                              className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm"
                            >
                              <div className="text-white">
                                {server.server_name || 'Server'}
                              </div>
                              <div className="text-zinc-400 font-mono text-xs">
                                game_id: {server.game_id || '-'}
                              </div>
                              <div className={server.ok ? 'text-green-400' : 'text-red-400'}>
                                {server.message || '-'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleUnban(ban.ea_id)}
                  className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors shrink-0"
                  title="Remover ban"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <AddBanModal
          onClose={() => setShowAddModal(false)}
          onAdded={async () => {
            setShowAddModal(false);
            await loadBans();
          }}
        />
      )}
    </div>
  );
}

function AddBanModal({
  onClose,
  onAdded,
}: {
  onClose: () => void;
  onAdded: () => Promise<void>;
}) {
  const [playerQuery, setPlayerQuery] = useState('');
  const [playerResults, setPlayerResults] = useState<SearchUser[]>([]);
  const [searchingPlayers, setSearchingPlayers] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<SearchUser | null>(null);

  const [eaId, setEaId] = useState('');
  const [platform, setPlatform] = useState('pc');
  const [reasonType, setReasonType] = useState('other');
  const [publicReason, setPublicReason] = useState('');
  const [staffNotes, setStaffNotes] = useState('');
  const [evidenceUrlsText, setEvidenceUrlsText] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [isGlobal, setIsGlobal] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSearchPlayer = async () => {
    if (!playerQuery.trim()) return;

    try {
      setSearchingPlayers(true);
      setPlayerResults([]);

      const response = await fetch(
        `https://rip-bf.com/api/eaid/?name=${encodeURIComponent(playerQuery.trim())}`
      );
      const data: PlayerSearchResponse = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.message || 'Falha ao buscar jogador');
      }

      setPlayerResults(Array.isArray(data.users) ? data.users : []);
    } catch (error) {
      console.error('Failed to search player:', error);
      alert('Falha ao buscar jogador.');
    } finally {
      setSearchingPlayers(false);
    }
  };

  const handleSelectPlayer = (player: SearchUser) => {
    setSelectedPlayer(player);
    setEaId(player.id);
    setPlatform(player.platform || 'pc');
    setPlayerResults([]);
    setPlayerQuery(player.nickname || player.EAID);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const evidence_urls = evidenceUrlsText
      .split('\n')
      .map((x) => x.trim())
      .filter(Boolean);

    try {
      setSaving(true);

      await bansAPI.add(GROUP_ID, {
        ea_id: eaId.trim(),
        platform,
        reason_type: reasonType,
        public_reason: publicReason.trim(),
        staff_notes: staffNotes.trim(),
        evidence_urls,
        visibility,
        is_global: isGlobal,
      });

      await onAdded();
    } catch (error) {
      console.error('Failed to add ban:', error);
      alert('Falha ao adicionar ban.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl text-white">Add Ban</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
          <div className="text-sm text-zinc-400 mb-3">Pesquisar jogador</div>

          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              value={playerQuery}
              onChange={(e) => setPlayerQuery(e.target.value)}
              placeholder="Ex: jn-nicolas"
              className="flex-1 bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-zinc-600"
            />
            <button
              type="button"
              onClick={handleSearchPlayer}
              disabled={searchingPlayers}
              className="px-4 py-2 bg-white text-black rounded-lg hover:bg-zinc-100 transition-colors disabled:opacity-50"
            >
              {searchingPlayers ? 'Buscando...' : 'Buscar player'}
            </button>
          </div>

          {playerResults.length > 0 && (
            <div className="mt-4 grid gap-3">
              {playerResults.map((player) => (
                <button
                  key={`${player.id}-${player.userId}`}
                  type="button"
                  onClick={() => handleSelectPlayer(player)}
                  className="text-left rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800/70 p-3 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {player.avatarUrl ? (
                      <img
                        src={player.avatarUrl}
                        alt={player.EAID}
                        className="w-14 h-14 rounded-xl object-cover border border-zinc-800"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-zinc-800 border border-zinc-700" />
                    )}

                    <div className="min-w-0">
                      <div className="text-white font-semibold">
                        {player.nickname || player.EAID}
                      </div>
                      <div className="text-zinc-400 text-sm">{player.EAID}</div>
                      <div className="text-zinc-500 text-xs mt-1 font-mono">
                        personaId: {player.id} · userId: {player.userId}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {selectedPlayer && (
            <div className="mt-4 rounded-xl border border-green-900/60 bg-green-950/20 p-4">
              <div className="text-green-300 text-sm mb-2">Player selecionado</div>
              <div className="flex items-center gap-3">
                {selectedPlayer.avatarUrl ? (
                  <img
                    src={selectedPlayer.avatarUrl}
                    alt={selectedPlayer.EAID}
                    className="w-14 h-14 rounded-xl object-cover border border-zinc-800"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-zinc-800 border border-zinc-700" />
                )}

                <div>
                  <div className="text-white font-semibold">
                    {selectedPlayer.nickname || selectedPlayer.EAID}
                  </div>
                  <div className="text-zinc-400 text-sm">{selectedPlayer.EAID}</div>
                  <div className="text-zinc-500 text-xs font-mono">
                    personaId: {selectedPlayer.id}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">EA ID</label>
              <input
                type="text"
                value={eaId}
                onChange={(e) => setEaId(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-zinc-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-zinc-600"
              >
                <option value="pc">pc</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Reason type</label>
              <select
                value={reasonType}
                onChange={(e) => setReasonType(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-zinc-600"
              >
                <option value="other">other</option>
                <option value="aimbot">aimbot</option>
                <option value="wallhack">wallhack</option>
                <option value="toxicity">toxicity</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Visibility</label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-zinc-600"
              >
                <option value="public">public</option>
                <option value="private">private</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Global ban</label>
              <select
                value={isGlobal ? 'true' : 'false'}
                onChange={(e) => setIsGlobal(e.target.value === 'true')}
                className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-zinc-600"
              >
                <option value="false">false</option>
                <option value="true">true</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Public reason</label>
            <input
              type="text"
              value={publicReason}
              onChange={(e) => setPublicReason(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-zinc-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Staff notes</label>
            <textarea
              value={staffNotes}
              onChange={(e) => setStaffNotes(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-zinc-600 resize-none"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">
              Evidence URLs (uma por linha)
            </label>
            <textarea
              value={evidenceUrlsText}
              onChange={(e) => setEvidenceUrlsText(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-zinc-600 resize-none"
              rows={4}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-4 py-2 border border-zinc-700 text-zinc-400 rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-white text-black rounded-lg hover:bg-zinc-100 transition-colors disabled:opacity-50"
            >
              {saving ? 'Adding...' : 'Add Ban'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}