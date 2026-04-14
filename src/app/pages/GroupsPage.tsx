import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Trash2,
  ExternalLink,
  ArrowLeft,
  Link2,
  Unlink,
  Server,
  Shield,
  Ban,
  Star,
  Play,
  Activity,
  Eye,
  Lock,
  Pencil,
} from 'lucide-react';
import {
  groupsAPI,
  eaAccountsAPI,
  serversAPI,
  bansAPI,
  vipsAPI,
  GroupDetail,
  GroupLinkedEaAccount,
  EAAccount,
  GroupServerItem,
  OwnerPlaygroundItem,
  GroupServerStatusResponse,
  GroupBanItem,
  GroupVipItem,
  GroupSecurityConfig,
  GroupSecurityUpdatePayload,
  GroupMemberItem,
} from '../services/api';

interface GroupApiItem {
  group_id: string;
  name: string;
  game: string;
  role: string;
  created_at: string;
}

interface GroupListResponse {
  items: GroupApiItem[];
}

type GroupTab = 'server' | 'linked_accounts' | 'admins' | 'bans' | 'vips' | 'security';

const REGION_OPTIONS = [
  { value: 'aws-bom', label: 'IN Mumbai, Índia' },
  { value: 'aws-brz', label: 'BR São Paulo, Brasil' },
  { value: 'aws-cdg', label: 'FR Paris, França' },
  { value: 'aws-cmh', label: 'US Ohio, EUA' },
  { value: 'aws-dub', label: 'IE Dublin, Irlanda' },
  { value: 'aws-fra', label: 'DE Frankfurt, Alemanha' },
  { value: 'aws-hkg', label: 'HK Hong Kong' },
  { value: 'aws-iad', label: 'US N. Virginia, EUA' },
  { value: 'aws-icn', label: 'KR Seul, Coreia do Sul' },
  { value: 'aws-lhr', label: 'GB Londres, Reino Unido' },
  { value: 'aws-nrt', label: 'JP Tóquio, Japão' },
  { value: 'aws-pdx', label: 'US Oregon, EUA' },
  { value: 'aws-sin', label: 'SG Cingapura' },
  { value: 'aws-sjc', label: 'US N. California, EUA' },
  { value: 'aws-syd', label: 'AU Sydney, Austrália' },
  { value: 'm3d-dxb', label: 'AE Dubai, EAU' },
  { value: 'm3d-hkg', label: 'HK Hong Kong (M3D)' },
  { value: 'm3d-jnb', label: 'ZA Johannesburgo, África do Sul' },
];

export function GroupsPage() {
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get('groupid');

  if (groupId) {
    return <GroupManagePage groupId={groupId} />;
  }

  return <GroupsListPage />;
}

function GroupsListPage() {
  const [groups, setGroups] = useState<GroupApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadGroups();
  }, []);

  const openGroup = (groupId: string) => {
    navigate(`/?groupid=${encodeURIComponent(groupId)}`);
  };

  const loadGroups = async () => {
    try {
      setLoading(true);
      setError(null);

      const data: GroupListResponse = await groupsAPI.list();

      if (Array.isArray(data?.items)) {
        setGroups(data.items);
      } else {
        setGroups([]);
        setError('A API respondeu em um formato inesperado.');
      }
    } catch (err) {
      console.error('Failed to load groups:', err);
      setGroups([]);
      setError('Não foi possível carregar os grupos.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (groupId: string) => {
    if (!confirm('Delete this group?')) return;

    try {
      await groupsAPI.delete(groupId);
      setGroups((prev) => prev.filter((g) => g.group_id !== groupId));
    } catch (error) {
      console.error('Failed to delete group:', error);
      alert('Falha ao deletar grupo.');
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
    <div className="p-8 text-white">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl text-white mb-1">Groups</h1>
          <p className="text-zinc-400">Manage Battlefield V groups</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg hover:bg-zinc-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Group
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-800 bg-red-950/40 px-4 py-3 text-red-300">
          {error}
        </div>
      )}

      {groups.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h3 className="text-lg mb-2">Nenhum grupo encontrado</h3>
          <p className="text-zinc-400 mb-4">
            Você ainda pode criar um grupo de Battlefield V agora.
          </p>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Group
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {groups.map((group) => (
            <div
              key={group.group_id}
              onClick={() => openGroup(group.group_id)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg text-white mb-1">{group.name}</h3>

                  <div className="flex flex-wrap gap-6 text-sm mt-3">
                    <div>
                      <span className="text-zinc-500">Game:</span>
                      <span className="text-white ml-2 uppercase">{group.game}</span>
                    </div>

                    <div>
                      <span className="text-zinc-500">Role:</span>
                      <span className="text-white ml-2">{group.role}</span>
                    </div>

                    <div>
                      <span className="text-zinc-500">Created:</span>
                      <span className="text-white ml-2">
                        {new Date(group.created_at).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openGroup(group.group_id);
                    }}
                    className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                    title="Abrir grupo"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(group.group_id);
                    }}
                    className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onCreated={loadGroups}
        />
      )}
    </div>
  );
}

function GroupManagePage({ groupId }: { groupId: string }) {
  const navigate = useNavigate();

  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [linkedAccounts, setLinkedAccounts] = useState<GroupLinkedEaAccount[]>([]);
  const [allAccounts, setAllAccounts] = useState<EAAccount[]>([]);
  const [servers, setServers] = useState<GroupServerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<GroupTab>('server');

  const [showLinkEaModal, setShowLinkEaModal] = useState(false);
  const [selectedEaPd, setSelectedEaPd] = useState('');
  const [linkingEa, setLinkingEa] = useState(false);
  const [unlinkingEaPd, setUnlinkingEaPd] = useState<string | null>(null);

  const [showAddServerModal, setShowAddServerModal] = useState(false);
  const [unlinkingPlaygroundId, setUnlinkingPlaygroundId] = useState<string | null>(null);

  const [serverStatusMap, setServerStatusMap] = useState<Record<string, GroupServerStatusResponse>>({});
  const [startingPlaygroundId, setStartingPlaygroundId] = useState<string | null>(null);
  const [checkingStatusId, setCheckingStatusId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  const availableAccounts = useMemo(() => {
    const linkedSet = new Set(linkedAccounts.map((acc) => acc.ea_pd));
    return allAccounts.filter((acc) => !linkedSet.has(acc.ea_pd));
  }, [allAccounts, linkedAccounts]);

  useEffect(() => {
    loadGroupData();
  }, [groupId]);

  useEffect(() => {
    if (activeTab !== 'server') return;
    if (!servers.length) return;

    const runCheck = () => {
      servers.forEach((server) => {
        handleCheckServerStatus(server.playground_id, true);
      });
    };

    runCheck();

    const interval = setInterval(runCheck, 20000);

    return () => clearInterval(interval);
  }, [activeTab, servers]);

  const loadGroupData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [groupData, linkedData, allAccountsData, serversData] = await Promise.all([
        groupsAPI.get(groupId),
        groupsAPI.getAccounts(groupId),
        eaAccountsAPI.list(),
        serversAPI.list(groupId),
      ]);

      setGroup(groupData);
      setLinkedAccounts(Array.isArray(linkedData) ? linkedData : []);
      setAllAccounts(Array.isArray(allAccountsData) ? allAccountsData : []);
      setServers(Array.isArray(serversData?.items) ? serversData.items : []);
    } catch (err) {
      console.error('Failed to load group data:', err);
      setError('Não foi possível carregar os dados do grupo.');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkEaAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEaPd) {
      alert('Selecione uma conta EA.');
      return;
    }

    try {
      setLinkingEa(true);
      await eaAccountsAPI.link(groupId, { ea_pd: selectedEaPd });
      setSelectedEaPd('');
      setShowLinkEaModal(false);
      await loadGroupData();
    } catch (error) {
      console.error('Failed to link EA account:', error);
      alert('Falha ao vincular conta EA ao grupo.');
    } finally {
      setLinkingEa(false);
    }
  };

  const handleUnlinkEaAccount = async (eaPd: string) => {
    if (!confirm('Desvincular esta conta EA do grupo?')) return;

    try {
      setUnlinkingEaPd(eaPd);
      await eaAccountsAPI.unlink(groupId, eaPd);
      await loadGroupData();
    } catch (error) {
      console.error('Failed to unlink EA account:', error);
      alert('Falha ao desvincular conta EA do grupo.');
    } finally {
      setUnlinkingEaPd(null);
    }
  };

  const handleUnlinkServer = async (playgroundId: string) => {
    if (!confirm('Desvincular este server do grupo?')) return;

    try {
      setUnlinkingPlaygroundId(playgroundId);
      await serversAPI.unlink(groupId, { playground_id: playgroundId });
      await loadGroupData();
    } catch (error) {
      console.error('Failed to unlink server:', error);
      alert('Falha ao desvincular server do grupo.');
    } finally {
      setUnlinkingPlaygroundId(null);
    }
  };

  const extractGameIdFromStatus = (status: GroupServerStatusResponse | undefined) => {
    return (
      status?.game_id ||
      status?.matched_server?.gameId ||
      null
    );
  };

  const openLiveServer = (gameId: string) => {
    navigate(`/servers?gameid=${encodeURIComponent(gameId)}`);
  };

  const handleCheckServerStatus = async (playgroundId: string, silent = false) => {
    try {
      setCheckingStatusId(playgroundId);

      const result = await serversAPI.status(groupId, playgroundId);

      setServerStatusMap((prev) => ({
        ...prev,
        [playgroundId]: result,
      }));
    } catch (error: any) {
      console.error('Failed to check server status:', error);

      setServerStatusMap((prev) => ({
        ...prev,
        [playgroundId]: {
          detail: error?.message || 'Erro ao consultar status',
          online: false,
        },
      }));

      if (!silent) {
        alert('Falha ao consultar status do server.');
      }
    } finally {
      setCheckingStatusId(null);
    }
  };

  const handleStartServer = async (server: GroupServerItem) => {
    try {
      setStartingPlaygroundId(server.playground_id);

      const payload: { ea_pd: string; playground_id: string; region?: string } = {
        ea_pd: server.ea_pd,
        playground_id: server.playground_id,
      };

      if (server.region) {
        payload.region = server.region;
      }

      const result = await serversAPI.start(payload);

      const gameId =
        result?.game_id ||
        String(result?.create_response?.game_id || '') ||
        String(result?.create_response?.create_response?.game_id || '');

      if (gameId) {
        openLiveServer(gameId);
        return;
      }

      alert('Server iniciado, mas não veio game_id na resposta.');
    } catch (error) {
      console.error('Failed to start server:', error);
      alert('Falha ao iniciar server.');
    } finally {
      setStartingPlaygroundId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="p-8 text-white">
        <button
          onClick={() => navigate('/')}
          className="mb-6 inline-flex items-center gap-2 text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>

        <div className="rounded-lg border border-red-800 bg-red-950/40 px-4 py-3 text-red-300">
          {error || 'Grupo não encontrado.'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 text-white">
      <div className="flex items-center justify-between mb-8 gap-4">
        <div>
          <button
            onClick={() => navigate('/')}
            className="mb-4 inline-flex items-center gap-2 text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para grupos
          </button>

          <h1 className="text-2xl text-white mb-1">{group.name}</h1>
          <p className="text-zinc-400">Gerenciamento do grupo</p>
        </div>
      </div>

      <div className="grid gap-4 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h2 className="text-lg text-white mb-4">Informações do grupo</h2>

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-zinc-500">Group ID:</span>
              <span className="text-white ml-2 font-mono break-all">{group.group_id}</span>
            </div>

            <div>
              <span className="text-zinc-500">Game:</span>
              <span className="text-white ml-2 uppercase">{group.game}</span>
            </div>

            <div>
              <span className="text-zinc-500">Owner User ID:</span>
              <span className="text-white ml-2">{group.owner_user_id}</span>
            </div>

            <div>
              <span className="text-zinc-500">Owner EA PD:</span>
              <span className="text-white ml-2 font-mono">{group.owner_ea_pd}</span>
            </div>

            <div>
              <span className="text-zinc-500">Created:</span>
              <span className="text-white ml-2">
                {new Date(group.created_at).toLocaleString('pt-BR')}
              </span>
            </div>

            <div>
              <span className="text-zinc-500">Updated:</span>
              <span className="text-white ml-2">
                {new Date(group.updated_at).toLocaleString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <TabButton
          active={activeTab === 'server'}
          onClick={() => setActiveTab('server')}
          icon={<Server className="w-4 h-4" />}
          label="Server"
        />
        <TabButton
          active={activeTab === 'linked_accounts'}
          onClick={() => setActiveTab('linked_accounts')}
          icon={<Link2 className="w-4 h-4" />}
          label="Conta vinculada"
        />

        <TabButton
          active={activeTab === 'admins'}
          onClick={() => setActiveTab('admins')}
          icon={<Shield className="w-4 h-4" />}
          label="Admins"
        />
        <TabButton
          active={activeTab === 'bans'}
          onClick={() => setActiveTab('bans')}
          icon={<Ban className="w-4 h-4" />}
          label="List ban"
        />
        <TabButton
          active={activeTab === 'vips'}
          onClick={() => setActiveTab('vips')}
          icon={<Star className="w-4 h-4" />}
          label="VIP"
        />
        <TabButton
          active={activeTab === 'security'}
          onClick={() => setActiveTab('security')}
          icon={<Lock className="w-4 h-4" />}
          label="Security"
        />
      </div>

      {activeTab === 'server' && (
        <ServerTab
          groupId={groupId}
          linkedAccounts={linkedAccounts}
          servers={servers}
          serverStatusMap={serverStatusMap}
          onAddServer={() => setShowAddServerModal(true)}
          onUnlinkServer={handleUnlinkServer}
          onCheckStatus={handleCheckServerStatus}
          onStartServer={handleStartServer}
          onOpenLiveServer={openLiveServer}
          unlinkingPlaygroundId={unlinkingPlaygroundId}
          checkingStatusId={checkingStatusId}
          startingPlaygroundId={startingPlaygroundId}
        />
      )}

      {activeTab === 'linked_accounts' && (
        <LinkedAccountsTab
          linkedAccounts={linkedAccounts}
          onLinkEa={() => setShowLinkEaModal(true)}
          onUnlinkEa={handleUnlinkEaAccount}
          unlinkingEaPd={unlinkingEaPd}
        />
      )}

      {activeTab === 'admins' && (
        <GroupAdminsTab groupId={groupId} />
      )}

      {activeTab === 'bans' && (
        <BansTab groupId={groupId} />
      )}

      {activeTab === 'vips' && (
        <VipsTab groupId={groupId} />
      )}

      {activeTab === 'security' && (
        <SecurityTab groupId={groupId} />
      )}

      {showLinkEaModal && (
        <LinkEaAccountModal
          availableAccounts={availableAccounts}
          selectedEaPd={selectedEaPd}
          setSelectedEaPd={setSelectedEaPd}
          linkingEa={linkingEa}
          onClose={() => {
            setShowLinkEaModal(false);
            setSelectedEaPd('');
          }}
          onSubmit={handleLinkEaAccount}
        />
      )}

      {showAddServerModal && (
        <AddServerModal
          groupId={groupId}
          linkedAccounts={linkedAccounts}
          onClose={() => setShowAddServerModal(false)}
          onAdded={async () => {
            setShowAddServerModal(false);
            await loadGroupData();
          }}
        />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
        active
          ? 'bg-white text-black border-white'
          : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function ServerTab({
  groupId,
  linkedAccounts,
  servers,
  serverStatusMap,
  onAddServer,
  onUnlinkServer,
  onCheckStatus,
  onStartServer,
  onOpenLiveServer,
  unlinkingPlaygroundId,
  checkingStatusId,
  startingPlaygroundId,
}: {
  groupId: string;
  linkedAccounts: GroupLinkedEaAccount[];
  servers: GroupServerItem[];
  serverStatusMap: Record<string, GroupServerStatusResponse>;
  onAddServer: () => void;
  onUnlinkServer: (playgroundId: string) => void;
  onCheckStatus: (playgroundId: string) => void;
  onStartServer: (server: GroupServerItem) => void;
  onOpenLiveServer: (gameId: string) => void;
  unlinkingPlaygroundId: string | null;
  checkingStatusId: string | null;
  startingPlaygroundId: string | null;
}) {
  const getStatusStyle = (status?: GroupServerStatusResponse) => {
    if (!status) {
      return {
        label: 'unknown',
        dot: 'bg-zinc-500',
        badge: 'bg-zinc-800 text-zinc-300 border-zinc-700',
        card: 'border-zinc-800',
      };
    }

    if (status.detail) {
      return {
        label: 'error',
        dot: 'bg-red-500',
        badge: 'bg-red-950/40 text-red-300 border-red-800',
        card: 'border-red-900/60',
      };
    }

    if (status.online) {
      return {
        label: 'online',
        dot: 'bg-green-500',
        badge: 'bg-green-950/40 text-green-300 border-green-800',
        card: 'border-green-900/60',
      };
    }

    return {
      label: 'offline',
      dot: 'bg-zinc-500',
      badge: 'bg-zinc-800 text-zinc-300 border-zinc-700',
      card: 'border-zinc-700',
    };
  };
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-lg text-white">Servers</h2>
          <p className="text-zinc-400 text-sm">
            Servers vinculados a este grupo
          </p>
        </div>

        <button
          onClick={onAddServer}
          disabled={linkedAccounts.length === 0}
          className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg hover:bg-zinc-100 transition-colors disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          Add Server
        </button>
      </div>

      {linkedAccounts.length === 0 && (
        <div className="mb-4 rounded-lg border border-yellow-800 bg-yellow-950/30 px-4 py-3 text-yellow-300 text-sm">
          Vincule pelo menos uma conta EA ao grupo antes de adicionar servers.
        </div>
      )}

      {servers.length === 0 ? (
        <div className="text-zinc-400">
          Nenhum server vinculado ao grupo.
        </div>
      ) : (
        <div className="grid gap-4">
          {servers.map((server) => {
            const status = serverStatusMap[server.playground_id];
            const liveGameId =
              status?.game_id ||
              status?.matched_server?.gameId ||
              server.game_id ||
              null;
              const statusStyle = getStatusStyle(status);

            return (
              <div
                key={server.server_id}
                className={`border rounded-lg p-4 bg-zinc-950/40 ${statusStyle.card}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className={`w-3 h-3 rounded-full ${statusStyle.dot}`} />
                      <h3 className="text-white text-base">
                        {server.server_name || 'Sem nome'}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded-full border ${statusStyle.badge}`}>
                        {statusStyle.label}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-2 text-sm mt-3">
                      <div>
                        <span className="text-zinc-500">Playground ID:</span>
                        <span className="text-white ml-2 font-mono">{server.playground_id}</span>
                      </div>

                      <div>
                        <span className="text-zinc-500">Region:</span>
                        <span className="text-white ml-2">{server.region || '-'}</span>
                      </div>

                      <div>
                        <span className="text-zinc-500">Config:</span>
                        <span className="text-white ml-2">{server.config_name || '-'}</span>
                      </div>

                      <div>
                        <span className="text-zinc-500">Status:</span>
                        <span className="text-white ml-2">
                          {status?.detail ? 'error' : status?.online ? 'online' : 'offline'}
                        </span>
                      </div>

                      <div>
                        <span className="text-zinc-500">EA PD:</span>
                        <span className="text-white ml-2 font-mono">{server.ea_pd}</span>
                      </div>

                      <div>
                        <span className="text-zinc-500">EA ID:</span>
                        <span className="text-white ml-2 font-mono">{server.ea_id || '-'}</span>
                      </div>

                      <div>
                        <span className="text-zinc-500">Owner ID:</span>
                        <span className="text-white ml-2 font-mono">{server.owner_id || '-'}</span>
                      </div>

                      <div>
                        <span className="text-zinc-500">Created:</span>
                        <span className="text-white ml-2">
                          {new Date(server.created_at).toLocaleString('pt-BR')}
                        </span>
                      </div>

                      {status && (
                        <>
                          <div>
                            <span className="text-zinc-500">Online:</span>
                            <span className="text-white ml-2">
                              {status.online ? 'sim' : 'não'}
                            </span>
                          </div>

                          <div>
                            <span className="text-zinc-500">Game ID:</span>
                            <span className="text-white ml-2 font-mono">
                              {liveGameId || '-'}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 min-w-[150px]">
                    <button
                      type="button"
                      onClick={() => onCheckStatus(server.playground_id)}
                      disabled={checkingStatusId === server.playground_id}
                      className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-zinc-700 text-zinc-200 hover:bg-zinc-800 disabled:opacity-50"
                    >
                      <Activity className="w-4 h-4" />
                      {checkingStatusId === server.playground_id ? 'Checking...' : 'Status'}
                    </button>

                    <button
                      type="button"
                      onClick={() => onStartServer(server)}
                      disabled={startingPlaygroundId === server.playground_id}
                      className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white text-black hover:bg-zinc-100 disabled:opacity-50"
                    >
                      <Play className="w-4 h-4" />
                      {startingPlaygroundId === server.playground_id ? 'Starting...' : 'Start'}
                    </button>

                    {liveGameId && (
                      <button
                        type="button"
                        onClick={() => onOpenLiveServer(liveGameId)}
                        className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-zinc-700 text-zinc-200 hover:bg-zinc-800"
                      >
                        <Eye className="w-4 h-4" />
                        Ver server
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onUnlinkServer(server.playground_id)}
                      disabled={unlinkingPlaygroundId === server.playground_id}
                      className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-red-900 text-red-300 hover:bg-red-950/30 disabled:opacity-50"
                    >
                      <Unlink className="w-4 h-4" />
                      {unlinkingPlaygroundId === server.playground_id ? '...' : 'Unlink'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function GroupAdminsTab({ groupId }: { groupId: string }) {
  const [members, setMembers] = useState<GroupMemberItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<GroupMemberItem | null>(null);
  const [removingEaPd, setRemovingEaPd] = useState<string | null>(null);

  useEffect(() => {
    loadMembers();
  }, [groupId]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await groupsAPI.listMembers(groupId);
      setMembers(Array.isArray(data?.items) ? data.items : []);
    } catch (error) {
      console.error('Failed to load members:', error);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (eaPd: string) => {
    if (!confirm(`Remover membro/admin ${eaPd} do grupo?`)) return;

    try {
      setRemovingEaPd(eaPd);
      const result = await groupsAPI.removeMember(groupId, eaPd);

      if (result.ok && result.removed) {
        await loadMembers();
        return;
      }

      alert('Membro não removido.');
    } catch (error) {
      console.error('Failed to remove member:', error);
      alert('Falha ao remover membro.');
    } finally {
      setRemovingEaPd(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg text-white">Admins</h2>
          <p className="text-zinc-400 text-sm">
            Membros e administradores do grupo
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg hover:bg-zinc-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add admin
        </button>
      </div>

      {members.length === 0 ? (
        <div className="text-zinc-400">
          Nenhum membro encontrado neste grupo.
        </div>
      ) : (
        <div className="grid gap-4">
          {members.map((member) => (
            <div
              key={member.ea_pd}
              className="border border-zinc-800 rounded-lg p-4 bg-zinc-950/40"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-white text-base font-mono">{member.ea_pd}</h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full border ${
                        member.role === 'owner'
                          ? 'bg-yellow-950/40 text-yellow-300 border-yellow-800'
                          : 'bg-blue-950/40 text-blue-300 border-blue-800'
                      }`}
                    >
                      {member.role}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-zinc-500">User ID:</span>
                      <span className="text-white ml-2">{member.user_id}</span>
                    </div>

                    <div>
                      <span className="text-zinc-500">Created:</span>
                      <span className="text-white ml-2">
                        {new Date(member.created_at).toLocaleString('pt-BR')}
                      </span>
                    </div>

                    <div>
                      <span className="text-zinc-500">Updated:</span>
                      <span className="text-white ml-2">
                        {member.updated_at
                          ? new Date(member.updated_at).toLocaleString('pt-BR')
                          : '-'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {member.role !== 'owner' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setEditingMember(member)}
                        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                        title="Editar admin"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member.ea_pd)}
                        disabled={removingEaPd === member.ea_pd}
                        className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
                        title="Remover membro"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <AddAdminModal
          groupId={groupId}
          onClose={() => setShowAddModal(false)}
          onAdded={async () => {
            setShowAddModal(false);
            await loadMembers();
          }}
        />
      )}

      {editingMember && (
        <EditAdminModal
          groupId={groupId}
          member={editingMember}
          onClose={() => setEditingMember(null)}
          onSaved={async () => {
            setEditingMember(null);
            await loadMembers();
          }}
        />
      )}
    </div>
  );
}

function AddAdminModal({
  groupId,
  onClose,
  onAdded,
}: {
  groupId: string;
  onClose: () => void;
  onAdded: () => Promise<void>;
}) {
  const [eaPd, setEaPd] = useState('');
  const [role, setRole] = useState('manager_all');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      await groupsAPI.addMember(groupId, {
        ea_pd: eaPd.trim(),
        role,
      });

      await onAdded();
    } catch (error) {
      console.error('Failed to add admin/member:', error);
      alert('Falha ao adicionar admin.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl text-white mb-4">Add admin</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-2">EA PD</label>
            <input
              type="text"
              value={eaPd}
              onChange={(e) => setEaPd(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-zinc-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-zinc-600"
            >
              <option value="owner">dono</option>
              <option value="manager_all">tudo liberado</option>
              <option value="manager_moderation">apenas moderar</option>
              <option value="manager_start_only">iniciar server</option>
            </select>
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
              {saving ? 'Saving...' : 'Add admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditAdminModal({
  groupId,
  member,
  onClose,
  onSaved,
}: {
  groupId: string;
  member: GroupMemberItem;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [role, setRole] = useState(member.role);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      await groupsAPI.updateMember(groupId, member.ea_pd, {
        role,
      });

      await onSaved();
    } catch (error) {
      console.error('Failed to update member:', error);
      alert('Falha ao atualizar admin.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl text-white mb-4">Edit admin</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-2">EA PD</label>
            <input
              type="text"
              value={member.ea_pd}
              disabled
              className="w-full bg-zinc-800 border border-zinc-700 text-zinc-400 px-4 py-2 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-zinc-600"
            >
              <option value="manager_all">manager_all</option>
              <option value="manager_moderation">manager_moderation</option>
            </select>
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
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LinkedAccountsTab({
  linkedAccounts,
  onLinkEa,
  onUnlinkEa,
  unlinkingEaPd,
}: {
  linkedAccounts: GroupLinkedEaAccount[];
  onLinkEa: () => void;
  onUnlinkEa: (eaPd: string) => void;
  unlinkingEaPd: string | null;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg text-white">Contas EA vinculadas</h2>
          <p className="text-zinc-400 text-sm">
            Contas disponíveis para operar este grupo
          </p>
        </div>

        <button
          onClick={onLinkEa}
          className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg hover:bg-zinc-100 transition-colors"
        >
          <Link2 className="w-4 h-4" />
          Vincular conta EA
        </button>
      </div>

      {linkedAccounts.length === 0 ? (
        <div className="text-zinc-400">
          Nenhuma conta EA vinculada a este grupo.
        </div>
      ) : (
        <div className="grid gap-4">
          {linkedAccounts.map((linked) => (
            <div
              key={linked.ea_pd}
              className="border border-zinc-800 rounded-lg p-4 bg-zinc-950/40"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  {linked.avatar_url ? (
                    <img
                      src={linked.avatar_url}
                      alt={linked.ea_name || linked.ea_pd}
                      className="w-14 h-14 rounded-lg object-cover border border-zinc-800"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-zinc-800 border border-zinc-700" />
                  )}

                  <div className="flex-1">
                    <h3 className="text-white text-base">
                      {linked.ea_name || 'Sem nome'}
                    </h3>

                    <div className="grid md:grid-cols-2 gap-2 text-sm mt-3">
                      <div>
                        <span className="text-zinc-500">EA PD:</span>
                        <span className="text-white ml-2 font-mono">{linked.ea_pd}</span>
                      </div>

                      <div>
                        <span className="text-zinc-500">EA ID:</span>
                        <span className="text-white ml-2 font-mono">{linked.ea_id || '-'}</span>
                      </div>

                      <div>
                        <span className="text-zinc-500">Linked by user:</span>
                        <span className="text-white ml-2">{linked.linked_by_user_id ?? '-'}</span>
                      </div>

                      <div>
                        <span className="text-zinc-500">Linked at:</span>
                        <span className="text-white ml-2">
                          {linked.created_at
                            ? new Date(linked.created_at).toLocaleString('pt-BR')
                            : '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onUnlinkEa(linked.ea_pd)}
                  disabled={unlinkingEaPd === linked.ea_pd}
                  className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
                  title="Desvincular"
                >
                  <Unlink className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PlaceholderTab({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <h2 className="text-lg text-white mb-2">{title}</h2>
      <p className="text-zinc-400">{description}</p>
    </div>
  );
}

function LinkEaAccountModal({
  availableAccounts,
  selectedEaPd,
  setSelectedEaPd,
  linkingEa,
  onClose,
  onSubmit,
}: {
  availableAccounts: EAAccount[];
  selectedEaPd: string;
  setSelectedEaPd: (value: string) => void;
  linkingEa: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl text-white mb-4">Vincular conta EA</h2>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Conta EA</label>

            <select
              value={selectedEaPd}
              onChange={(e) => setSelectedEaPd(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-zinc-600"
              required
            >
              <option value="">Selecione uma conta</option>

              {availableAccounts.map((account) => (
                <option key={account.ea_pd} value={account.ea_pd}>
                  {(account.ea_name || 'Sem nome')} — {account.ea_pd}
                </option>
              ))}
            </select>
          </div>

          {availableAccounts.length === 0 && (
            <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-zinc-400 text-sm">
              Não há contas EA disponíveis para vincular.
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={linkingEa}
              className="flex-1 px-4 py-2 border border-zinc-700 text-zinc-400 rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={linkingEa || availableAccounts.length === 0}
              className="flex-1 px-4 py-2 bg-white text-black rounded-lg hover:bg-zinc-100 transition-colors disabled:opacity-50"
            >
              {linkingEa ? 'Vinculando...' : 'Vincular'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddServerModal({
  groupId,
  linkedAccounts,
  onClose,
  onAdded,
}: {
  groupId: string;
  linkedAccounts: GroupLinkedEaAccount[];
  onClose: () => void;
  onAdded: () => Promise<void>;
}) {
  const [selectedEaPd, setSelectedEaPd] = useState('');
  const [playgrounds, setPlaygrounds] = useState<OwnerPlaygroundItem[]>([]);
  const [playgroundsLoading, setPlaygroundsLoading] = useState(false);
  const [selectedPlaygroundId, setSelectedPlaygroundId] = useState('');
  const [region, setRegion] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadPlaygrounds = async () => {
      if (!selectedEaPd) {
        setPlaygrounds([]);
        setSelectedPlaygroundId('');
        return;
      }

      try {
        setPlaygroundsLoading(true);
        const data = await groupsAPI.getPlaygrounds(groupId, selectedEaPd);
        setPlaygrounds(Array.isArray(data?.items) ? data.items : []);
        setSelectedPlaygroundId('');
      } catch (error) {
        console.error('Failed to load playgrounds:', error);
        setPlaygrounds([]);
      } finally {
        setPlaygroundsLoading(false);
      }
    };

    loadPlaygrounds();
  }, [groupId, selectedEaPd]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPlaygroundId) {
      alert('Selecione um server/playground.');
      return;
    }

    try {
      setSaving(true);

      const payload: { playground_id: string; region?: string } = {
        playground_id: selectedPlaygroundId,
      };

      if (region) {
        payload.region = region;
      }

      await serversAPI.link(groupId, payload);
      await onAdded();
    } catch (error) {
      console.error('Failed to link server:', error);
      alert('Falha ao adicionar server ao grupo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-2xl">
        <h2 className="text-xl text-white mb-4">Add Server</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Conta EA vinculada</label>
            <select
              value={selectedEaPd}
              onChange={(e) => setSelectedEaPd(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-zinc-600"
              required
            >
              <option value="">Selecione uma conta</option>

              {linkedAccounts.map((account) => (
                <option key={account.ea_pd} value={account.ea_pd}>
                  {(account.ea_name || 'Sem nome')} — {account.ea_pd}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Server / Playground</label>
            <select
              value={selectedPlaygroundId}
              onChange={(e) => setSelectedPlaygroundId(e.target.value)}
              disabled={!selectedEaPd || playgroundsLoading}
              className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-zinc-600 disabled:opacity-50"
              required
            >
              <option value="">
                {playgroundsLoading ? 'Carregando...' : 'Selecione um server'}
              </option>

              {playgrounds.map((item) => (
                <option key={item.playground_id} value={item.playground_id}>
                  {(item.server_name || 'Sem nome')} — {item.playground_id}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Região</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-zinc-600"
            >
              <option value="">Automática / não enviar</option>
              {REGION_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label} — {item.value}
                </option>
              ))}
            </select>
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
              {saving ? 'Adicionando...' : 'Add Server'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BansTab({ groupId }: { groupId: string }) {
  const [bans, setBans] = useState<GroupBanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [removingEaId, setRemovingEaId] = useState<string | null>(null);
  const [editingBan, setEditingBan] = useState<GroupBanItem | null>(null);

  useEffect(() => {
    loadBans();
  }, [groupId]);

  const loadBans = async () => {
    try {
      setLoading(true);
      const data = await bansAPI.list(groupId);
      setBans(Array.isArray(data?.items) ? data.items : []);
    } catch (error) {
      console.error('Failed to load bans:', error);
      setBans([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBan = async (eaId: string) => {
    if (!confirm(`Remover ban do EA ID ${eaId}?`)) return;

    try {
      setRemovingEaId(eaId);
      const result = await bansAPI.remove(groupId, eaId);

      if (result.deleted_count === 1) {
        await loadBans();
        return;
      }

      alert(result.message || 'Ban não removido.');
    } catch (error) {
      console.error('Failed to remove ban:', error);
      alert('Falha ao remover ban.');
    } finally {
      setRemovingEaId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg text-white">List ban</h2>
          <p className="text-zinc-400 text-sm">
            Bans salvos para este grupo
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg hover:bg-zinc-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add ban
        </button>
      </div>

      {bans.length === 0 ? (
        <div className="text-zinc-400">
          Nenhum ban cadastrado neste grupo.
        </div>
      ) : (
        <div className="grid gap-4">
          {bans.map((ban) => (
            <div
              key={ban.ban_id}
              className="border border-zinc-800 rounded-lg p-4 bg-zinc-950/40"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    {ban.avatar ? (
                      <img
                        src={ban.avatar}
                        alt={ban.nickname || ban.name || ban.ea_id}
                        className="w-14 h-14 rounded-lg object-cover border border-zinc-800"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-zinc-800 border border-zinc-700" />
                    )}

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-white text-base">
                          {ban.nickname || ban.name || ban.ea_id}
                        </h3>

                        <span className="text-xs px-2 py-1 rounded-full border bg-red-950/40 text-red-300 border-red-800">
                          {ban.status}
                        </span>

                        {ban.is_global && (
                          <span className="text-xs px-2 py-1 rounded-full border bg-yellow-950/40 text-yellow-300 border-yellow-800">
                            global
                          </span>
                        )}
                      </div>

                      <div className="text-sm text-zinc-400 mb-3">
                        {ban.name && ban.nickname && ban.name !== ban.nickname
                          ? `${ban.name} (${ban.nickname})`
                          : ban.name || ban.nickname || 'Sem nome'}
                      </div>

                      <div className="grid md:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-zinc-500">EA ID:</span>
                          <span className="text-white ml-2 font-mono">{ban.ea_id}</span>
                        </div>

                        <div>
                          <span className="text-zinc-500">Account ID:</span>
                          <span className="text-white ml-2 font-mono">{ban.account_id || '-'}</span>
                        </div>

                        <div>
                          <span className="text-zinc-500">Platform:</span>
                          <span className="text-white ml-2">{ban.platform}</span>
                        </div>

                        <div>
                          <span className="text-zinc-500">Reason type:</span>
                          <span className="text-white ml-2">{ban.reason_type}</span>
                        </div>

                        <div>
                          <span className="text-zinc-500">Visibility:</span>
                          <span className="text-white ml-2">{ban.visibility}</span>
                        </div>

                        <div>
                          <span className="text-zinc-500">Created:</span>
                          <span className="text-white ml-2">
                            {new Date(ban.created_at).toLocaleString('pt-BR')}
                          </span>
                        </div>

                        <div>
                          <span className="text-zinc-500">Location ID:</span>
                          <span className="text-white ml-2 font-mono">{ban.location_id ?? '-'}</span>
                        </div>

                        <div>
                          <span className="text-zinc-500">Matched LOC:</span>
                          <span className="text-white ml-2 font-mono">{ban.matched_loc ?? '-'}</span>
                        </div>

                        <div className="md:col-span-2">
                          <span className="text-zinc-500">Public reason:</span>
                          <span className="text-white ml-2">{ban.public_reason || '-'}</span>
                        </div>

                        <div className="md:col-span-2">
                          <span className="text-zinc-500">Staff notes:</span>
                          <span className="text-white ml-2">{ban.staff_notes || '-'}</span>
                        </div>

                        <div className="md:col-span-2">
                          <span className="text-zinc-500">Applied servers:</span>
                          <span className="text-white ml-2">
                            {ban.applied_servers?.length || 0}
                          </span>
                        </div>

                        <div className="md:col-span-2">
                          <span className="text-zinc-500">Evidence URLs:</span>
                          <div className="mt-2 space-y-1">
                            {ban.evidence_urls?.length ? (
                              ban.evidence_urls.map((url, index) => (
                                <div key={index}>
                                  <a
                                    href={url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-400 hover:text-blue-300 break-all"
                                  >
                                    {url}
                                  </a>
                                </div>
                              ))
                            ) : (
                              <span className="text-white">-</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingBan(ban)}
                    className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                    title="Editar ban"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRemoveBan(ban.ea_id)}
                    disabled={removingEaId === ban.ea_id}
                    className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
                    title="Remover ban"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <AddBanModal
          groupId={groupId}
          onClose={() => setShowAddModal(false)}
          onAdded={async () => {
            setShowAddModal(false);
            await loadBans();
          }}
        />
      )}
      {editingBan && (
        <EditBanModal
          groupId={groupId}
          ban={editingBan}
          onClose={() => setEditingBan(null)}
          onSaved={async () => {
            setEditingBan(null);
            await loadBans();
          }}
        />
      )}
    </div>
  );
}

function EditBanModal({
  groupId,
  ban,
  onClose,
  onSaved,
}: {
  groupId: string;
  ban: GroupBanItem;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [isGlobal, setIsGlobal] = useState(Boolean(ban.is_global));
  const [platform, setPlatform] = useState(ban.platform || 'pc');
  const [reasonType, setReasonType] = useState(ban.reason_type || 'other');
  const [publicReason, setPublicReason] = useState(ban.public_reason || '');
  const [staffNotes, setStaffNotes] = useState(ban.staff_notes || '');
  const [evidenceUrlsText, setEvidenceUrlsText] = useState((ban.evidence_urls || []).join('\n'));
  const [visibility, setVisibility] = useState(ban.visibility || 'public');
  const [status, setStatus] = useState(ban.status || 'active');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const evidence_urls = evidenceUrlsText
      .split('\n')
      .map((x) => x.trim())
      .filter(Boolean);

    try {
      setSaving(true);

      await bansAPI.update(groupId, ban.ea_id, {
        is_global: isGlobal,
        platform,
        reason_type: reasonType,
        public_reason: publicReason.trim(),
        staff_notes: staffNotes.trim(),
        evidence_urls,
        visibility,
        status,
      });

      await onSaved();
    } catch (error) {
      console.error('Failed to update ban:', error);
      alert('Falha ao editar ban.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-2xl">
        <h2 className="text-xl text-white mb-4">Edit ban</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-2">EA ID</label>
            <input
              type="text"
              value={ban.ea_id}
              disabled
              className="w-full bg-zinc-800 border border-zinc-700 text-zinc-400 px-4 py-2 rounded-lg"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
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
              <label className="block text-sm text-zinc-400 mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-zinc-600"
              >
                <option value="active">active</option>
                <option value="inactive">inactive</option>
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
              rows={3}
              className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-zinc-600 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">
              Evidence URLs (uma por linha)
            </label>
            <textarea
              value={evidenceUrlsText}
              onChange={(e) => setEvidenceUrlsText(e.target.value)}
              rows={4}
              className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-zinc-600 resize-none"
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
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddBanModal({
  groupId,
  onClose,
  onAdded,
}: {
  groupId: string;
  onClose: () => void;
  onAdded: () => Promise<void>;
}) {
  const [eaId, setEaId] = useState('');
  const [platform, setPlatform] = useState('pc');
  const [reasonType, setReasonType] = useState('other');
  const [publicReason, setPublicReason] = useState('');
  const [staffNotes, setStaffNotes] = useState('');
  const [evidenceUrlsText, setEvidenceUrlsText] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [saving, setSaving] = useState(false);
  const [isGlobal, setIsGlobal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const evidence_urls = evidenceUrlsText
      .split('\n')
      .map((x) => x.trim())
      .filter(Boolean);

    try {
      setSaving(true);

      const result = await bansAPI.add(groupId, {
        ea_id: eaId.trim(),
        platform,
        reason_type: reasonType,
        public_reason: publicReason.trim(),
        staff_notes: staffNotes.trim(),
        evidence_urls,
        visibility,
        is_global: isGlobal,
      });

      if (result.ok && result.saved_to_db) {
        await onAdded();
        return;
      }

      alert(result.message || 'Falha ao adicionar ban.');
    } catch (error) {
      console.error('Failed to add ban:', error);
      alert('Falha ao adicionar ban.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-2xl">
        <h2 className="text-xl text-white mb-4">Add ban</h2>

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
              rows={3}
              className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-zinc-600 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">
              Evidence URLs (uma por linha)
            </label>
            <textarea
              value={evidenceUrlsText}
              onChange={(e) => setEvidenceUrlsText(e.target.value)}
              rows={4}
              className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-zinc-600 resize-none"
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
              {saving ? 'Saving...' : 'Add ban'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function VipsTab({ groupId }: { groupId: string }) {
  const [vips, setVips] = useState<GroupVipItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [removingEaId, setRemovingEaId] = useState<string | null>(null);

  useEffect(() => {
    loadVips();
  }, [groupId]);

  const loadVips = async () => {
    try {
      setLoading(true);
      const data = await vipsAPI.list(groupId);
      setVips(Array.isArray(data?.items) ? data.items : []);
    } catch (error) {
      console.error('Failed to load VIPs:', error);
      setVips([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVip = async (eaId: string) => {
    if (!confirm(`Remover VIP do EA ID ${eaId}?`)) return;

    try {
      setRemovingEaId(eaId);
      const result = await vipsAPI.remove(groupId, eaId);

      if (result.ok && result.status === 'removed') {
        await loadVips();
        return;
      }

      alert('VIP não removido.');
    } catch (error) {
      console.error('Failed to remove VIP:', error);
      alert('Falha ao remover VIP.');
    } finally {
      setRemovingEaId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg text-white">VIP</h2>
          <p className="text-zinc-400 text-sm">
            Lista de VIPs do grupo
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg hover:bg-zinc-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add VIP
        </button>
      </div>

      {vips.length === 0 ? (
        <div className="text-zinc-400">
          Nenhum VIP cadastrado neste grupo.
        </div>
      ) : (
        <div className="grid gap-4">
          {vips.map((vip) => (
            <div
              key={vip.vip_id}
              className="border border-zinc-800 rounded-lg p-4 bg-zinc-950/40"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-white text-base font-mono">{vip.ea_id}</h3>
                    <span className="text-xs px-2 py-1 rounded-full border bg-blue-950/40 text-blue-300 border-blue-800">
                      {vip.status}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-zinc-500">Visibility:</span>
                      <span className="text-white ml-2">{vip.visibility}</span>
                    </div>

                    <div>
                      <span className="text-zinc-500">Added by user:</span>
                      <span className="text-white ml-2">{vip.added_by_user_id}</span>
                    </div>

                    <div>
                      <span className="text-zinc-500">Created:</span>
                      <span className="text-white ml-2">
                        {new Date(vip.created_at).toLocaleString('pt-BR')}
                      </span>
                    </div>

                    <div>
                      <span className="text-zinc-500">Updated:</span>
                      <span className="text-white ml-2">
                        {vip.updated_at
                          ? new Date(vip.updated_at).toLocaleString('pt-BR')
                          : '-'}
                      </span>
                    </div>

                    <div className="md:col-span-2">
                      <span className="text-zinc-500">Public reason:</span>
                      <span className="text-white ml-2">{vip.public_reason || '-'}</span>
                    </div>

                    <div className="md:col-span-2">
                      <span className="text-zinc-500">Staff notes:</span>
                      <span className="text-white ml-2">{vip.staff_notes || '-'}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveVip(vip.ea_id)}
                  disabled={removingEaId === vip.ea_id}
                  className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
                  title="Remover VIP"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <AddVipModal
          groupId={groupId}
          onClose={() => setShowAddModal(false)}
          onAdded={async () => {
            setShowAddModal(false);
            await loadVips();
          }}
        />
      )}
    </div>
  );
}

function AddVipModal({
  groupId,
  onClose,
  onAdded,
}: {
  groupId: string;
  onClose: () => void;
  onAdded: () => Promise<void>;
}) {
  const [eaId, setEaId] = useState('');
  const [publicReason, setPublicReason] = useState('');
  const [staffNotes, setStaffNotes] = useState('');
  const [visibility, setVisibility] = useState('private');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      const result = await vipsAPI.add(groupId, {
        ea_id: eaId.trim(),
        public_reason: publicReason.trim(),
        staff_notes: staffNotes.trim(),
        visibility,
      });

      if (result.ok && result.status === 'active') {
        await onAdded();
        return;
      }

      alert('Falha ao adicionar VIP.');
    } catch (error) {
      console.error('Failed to add VIP:', error);
      alert('Falha ao adicionar VIP.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-xl">
        <h2 className="text-xl text-white mb-4">Add VIP</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              rows={3}
              className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-zinc-600 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Visibility</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-zinc-600"
            >
              <option value="private">private</option>
              <option value="public">public</option>
            </select>
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
              {saving ? 'Saving...' : 'Add VIP'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SecurityTab({ groupId }: { groupId: string }) {
  const [config, setConfig] = useState<GroupSecurityConfig | null>(null);
  const [countries, setCountries] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSecurity();
  }, [groupId]);

  const loadSecurity = async () => {
    try {
      setLoading(true);

      const [configData, countriesData] = await Promise.all([
        groupsAPI.getSecurity(groupId),
        groupsAPI.getValidBlockedCountries(),
      ]);

      setConfig(configData);
      setCountries(Array.isArray(countriesData?.items) ? countriesData.items : []);
    } catch (error) {
      console.error('Failed to load security config:', error);
      setConfig(null);
      setCountries([]);
    } finally {
      setLoading(false);
    }
  };

  const updateField = <K extends keyof GroupSecurityConfig>(
    key: K,
    value: GroupSecurityConfig[K]
  ) => {
    if (!config) return;
    setConfig({
      ...config,
      [key]: value,
    });
  };

  const handleAddCountry = () => {
    if (!config || !selectedCountry) return;
    if (config.blocked_countries.includes(selectedCountry)) return;

    setConfig({
      ...config,
      blocked_countries: [...config.blocked_countries, selectedCountry].sort(),
    });
    setSelectedCountry('');
  };

  const handleRemoveCountry = (country: string) => {
    if (!config) return;

    setConfig({
      ...config,
      blocked_countries: config.blocked_countries.filter((c) => c !== country),
    });
  };

  const handleSave = async () => {
    if (!config) return;

    try {
      setSaving(true);

      const payload: GroupSecurityUpdatePayload = {
        protect_bfban_known_cheaters: config.protect_bfban_known_cheaters,
        enable_global_ban: config.enable_global_ban,
        auto_kick_high_ping_enabled: config.auto_kick_high_ping_enabled,
        high_ping_limit: Number(config.high_ping_limit || 0),
        high_ping_min_players: Number(config.high_ping_min_players || 0),
        exclude_added_platoons_from_kick: config.exclude_added_platoons_from_kick,
        kick_by_rank_enabled: config.kick_by_rank_enabled,
        kick_if_rank_lower_than:
          config.kick_if_rank_lower_than === null || config.kick_if_rank_lower_than === undefined
            ? null
            : Number(config.kick_if_rank_lower_than),
        kick_if_rank_higher_than:
          config.kick_if_rank_higher_than === null || config.kick_if_rank_higher_than === undefined
            ? null
            : Number(config.kick_if_rank_higher_than),
        kick_by_country_enabled: config.kick_by_country_enabled,
        country_mode: config.country_mode,
        blocked_countries: config.blocked_countries,
      };

      const updated = await groupsAPI.updateSecurity(groupId, payload);
      setConfig(updated);
      alert('Configuração de security salva com sucesso.');
    } catch (error) {
      console.error('Failed to save security config:', error);
      alert('Falha ao salvar security.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-zinc-400">
        Não foi possível carregar a configuração de security.
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg text-white">Group Security</h2>
          <p className="text-zinc-400 text-sm">
            Regras automáticas de proteção para este grupo
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-white text-black rounded-lg hover:bg-zinc-100 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Security'}
        </button>
      </div>

      <div className="grid gap-6">
        <SecuritySwitch
          label="Protect BFban known cheaters"
          checked={config.protect_bfban_known_cheaters}
          onChange={(v) => updateField('protect_bfban_known_cheaters', v)}
        />

        <SecuritySwitch
          label="Enable global ban"
          checked={config.enable_global_ban}
          onChange={(v) => updateField('enable_global_ban', v)}
        />

        <SecuritySwitch
          label="Auto kick high ping"
          checked={config.auto_kick_high_ping_enabled}
          onChange={(v) => updateField('auto_kick_high_ping_enabled', v)}
        />

        <div className="grid md:grid-cols-2 gap-4">
          <SecurityNumberInput
            label="High ping limit"
            value={config.high_ping_limit}
            onChange={(v) => updateField('high_ping_limit', v)}
          />

          <SecurityNumberInput
            label="High ping min players"
            value={config.high_ping_min_players}
            onChange={(v) => updateField('high_ping_min_players', v)}
          />
        </div>

        <SecuritySwitch
          label="Exclude added platoons from kick"
          checked={config.exclude_added_platoons_from_kick}
          onChange={(v) => updateField('exclude_added_platoons_from_kick', v)}
        />

        <SecuritySwitch
          label="Kick by rank"
          checked={config.kick_by_rank_enabled}
          onChange={(v) => updateField('kick_by_rank_enabled', v)}
        />

        <div className="grid md:grid-cols-2 gap-4">
          <SecurityNullableNumberInput
            label="Kick if rank lower than"
            value={config.kick_if_rank_lower_than}
            onChange={(v) => updateField('kick_if_rank_lower_than', v)}
          />

          <SecurityNullableNumberInput
            label="Kick if rank higher than"
            value={config.kick_if_rank_higher_than}
            onChange={(v) => updateField('kick_if_rank_higher_than', v)}
          />
        </div>

        <SecuritySwitch
          label="Kick by country"
          checked={config.kick_by_country_enabled}
          onChange={(v) => updateField('kick_by_country_enabled', v)}
        />

        <div>
          <label className="block text-sm text-zinc-400 mb-2">Country mode</label>
          <select
            value={config.country_mode}
            onChange={(e) => updateField('country_mode', e.target.value as 'blocklist' | 'allowlist')}
            className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-zinc-600"
          >
            <option value="blocklist">blocklist</option>
            <option value="allowlist">allowlist</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-2">Blocked countries</label>

          <div className="flex gap-2 mb-3">
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="flex-1 bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-zinc-600"
            >
              <option value="">Selecione um país</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleAddCountry}
              className="px-4 py-2 border border-zinc-700 text-zinc-200 rounded-lg hover:bg-zinc-800"
            >
              Add
            </button>
          </div>

          {config.blocked_countries.length === 0 ? (
            <div className="text-zinc-500 text-sm">Nenhum país selecionado.</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {config.blocked_countries.map((country) => (
                <button
                  key={country}
                  type="button"
                  onClick={() => handleRemoveCountry(country)}
                  className="px-3 py-1 rounded-full border border-zinc-700 bg-zinc-950 text-white text-sm hover:bg-zinc-800"
                >
                  {country} ×
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SecuritySwitch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-lg border border-zinc-800 bg-zinc-950/40 px-4 py-3">
      <span className="text-white">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5"
      />
    </label>
  );
}

function SecurityNumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <label className="block text-sm text-zinc-400 mb-2">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value || 0))}
        className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-zinc-600"
      />
    </div>
  );
}

function SecurityNullableNumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
}) {
  return (
    <div>
      <label className="block text-sm text-zinc-400 mb-2">{label}</label>
      <input
        type="number"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-zinc-600"
      />
    </div>
  );
}

function CreateGroupModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      await groupsAPI.create({
        name: name.trim(),
        game: 'bfv',
      });

      await onCreated();
      onClose();
    } catch (error) {
      console.error('Failed to create group:', error);
      alert('Falha ao criar grupo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl text-white mb-4">Create Group</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Group Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-zinc-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Game</label>
            <input
              type="text"
              value="Battlefield V (bfv)"
              disabled
              className="w-full bg-zinc-800 border border-zinc-700 text-zinc-400 px-4 py-2 rounded-lg"
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
              {saving ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}