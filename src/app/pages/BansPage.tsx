import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { bansAPI } from '../services/api';

interface Ban {
  ea_id: string;
  player_name: string;
  reason: string;
  banned_at: string;
  group_id: string;
}

export function BansPage() {
  const [bans, setBans] = useState<Ban[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadBans();
  }, []);

  const loadBans = async () => {
    try {
      // Mock data
      setBans([
        {
          ea_id: 'ea_12345',
          player_name: 'CheatPlayer123',
          reason: 'Aimbot detected',
          banned_at: '2026-04-10T14:30:00Z',
          group_id: '1',
        },
        {
          ea_id: 'ea_67890',
          player_name: 'ToxicUser',
          reason: 'Harassment',
          banned_at: '2026-04-09T18:15:00Z',
          group_id: '1',
        },
      ]);
    } catch (error) {
      console.error('Failed to load bans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnban = async (eaId: string, groupId: string) => {
    if (!confirm('Remove this ban?')) return;

    try {
      await bansAPI.remove(groupId, eaId);
      setBans(bans.filter(b => b.ea_id !== eaId));
    } catch (error) {
      console.error('Failed to remove ban:', error);
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
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl text-white mb-1">Bans</h1>
          <p className="text-zinc-400">Manage banned players across groups</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg hover:bg-zinc-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Ban
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left text-zinc-400 text-sm px-6 py-4">Player</th>
              <th className="text-left text-zinc-400 text-sm px-6 py-4">EA ID</th>
              <th className="text-left text-zinc-400 text-sm px-6 py-4">Reason</th>
              <th className="text-left text-zinc-400 text-sm px-6 py-4">Banned At</th>
              <th className="text-right text-zinc-400 text-sm px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bans.map((ban) => (
              <tr key={ban.ea_id} className="border-b border-zinc-800 last:border-0">
                <td className="px-6 py-4 text-white">{ban.player_name}</td>
                <td className="px-6 py-4 text-zinc-400 font-mono text-sm">{ban.ea_id}</td>
                <td className="px-6 py-4 text-zinc-400">{ban.reason}</td>
                <td className="px-6 py-4 text-zinc-400">
                  {new Date(ban.banned_at).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleUnban(ban.ea_id, ban.group_id)}
                    className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <AddBanModal onClose={() => setShowAddModal(false)} onAdded={loadBans} />
      )}
    </div>
  );
}

function AddBanModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [eaId, setEaId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await bansAPI.add('1', { ea_id: eaId, player_name: playerName, reason });
      onAdded();
      onClose();
    } catch (error) {
      console.error('Failed to add ban:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl text-white mb-4">Add Ban</h2>

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
            <label className="block text-sm text-zinc-400 mb-2">Player Name</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-zinc-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-zinc-600 resize-none"
              rows={3}
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-zinc-700 text-zinc-400 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-white text-black rounded-lg hover:bg-zinc-100 transition-colors"
            >
              Add Ban
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
