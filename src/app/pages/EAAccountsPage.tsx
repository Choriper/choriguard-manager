import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { eaAccountsAPI } from '../services/api';

interface EAAccount {
  ea_pd: string;
  ea_id: string;
  ea_name: string | null;
  avatar_url: string | null;
  email: string | null;
  country: string | null;
  subscription_level: string | null;
  created_by_user_id: number;
  created_at: string;
  updated_at: string;
  sid?: string;
  remid?: string;
}

export function EAAccountsPage() {
  const [accounts, setAccounts] = useState<EAAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const data = await eaAccountsAPI.list();

      if (Array.isArray(data)) {
        setAccounts(data);
      } else {
        console.error('Formato inesperado em /ea-accounts:', data);
        setAccounts([]);
      }
    } catch (error) {
      console.error('Failed to load EA accounts:', error);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eaPd: string) => {
    if (!confirm('Remove this EA account?')) return;

    try {
      await eaAccountsAPI.remove(eaPd);
      setAccounts((prev) => prev.filter((a) => a.ea_pd !== eaPd));
    } catch (error) {
      console.error('Failed to remove account:', error);
      alert('Falha ao remover conta.');
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
          <h1 className="text-2xl text-white mb-1">EA Accounts</h1>
          <p className="text-zinc-400">Manage linked EA accounts</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg hover:bg-zinc-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Account
        </button>
      </div>

      {accounts.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-zinc-400">
          Nenhuma conta EA cadastrada.
        </div>
      ) : (
        <div className="grid gap-4">
          {accounts.map((account) => (
            <div
              key={account.ea_pd}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  {account.avatar_url ? (
                    <img
                      src={account.avatar_url}
                      alt={account.ea_name || account.ea_pd}
                      className="w-16 h-16 rounded-lg object-cover border border-zinc-800"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-zinc-800 border border-zinc-700" />
                  )}

                  <div className="flex-1">
                    <h3 className="text-lg text-white mb-1">
                      {account.ea_name || 'Sem nome'}
                    </h3>

                    <p className="text-zinc-400 text-sm mb-4">
                      {account.email || 'Sem e-mail'}
                    </p>

                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-zinc-500">EA PD:</span>
                        <span className="text-white ml-2 font-mono">{account.ea_pd}</span>
                      </div>

                      <div>
                        <span className="text-zinc-500">EA ID:</span>
                        <span className="text-white ml-2 font-mono">{account.ea_id}</span>
                      </div>

                      <div>
                        <span className="text-zinc-500">Country:</span>
                        <span className="text-white ml-2">{account.country || '-'}</span>
                      </div>

                      <div>
                        <span className="text-zinc-500">Subscription:</span>
                        <span className="text-white ml-2">
                          {account.subscription_level || '-'}
                        </span>
                      </div>

                      <div>
                        <span className="text-zinc-500">Created by user:</span>
                        <span className="text-white ml-2">{account.created_by_user_id}</span>
                      </div>

                      <div>
                        <span className="text-zinc-500">Created at:</span>
                        <span className="text-white ml-2">
                          {new Date(account.created_at).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(account.ea_pd)}
                  className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
                  title="Remover conta"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <AddAccountModal
          onClose={() => setShowAddModal(false)}
          onAdded={async () => {
            await loadAccounts();
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}

function AddAccountModal({
  onClose,
  onAdded,
}: {
  onClose: () => void;
  onAdded: () => void | Promise<void>;
}) {
  const [sid, setSid] = useState('');
  const [remid, setRemid] = useState('');
  const [locale, setLocale] = useState('en');
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setErrorMessage('');

      await eaAccountsAPI.save({
        sid: sid.trim(),
        remid: remid.trim(),
        locale: locale.trim() || 'en',
      });

      await onAdded();
    } catch (error: any) {
      console.error('Failed to save EA account:', error);
      setErrorMessage(
        error?.message?.replace('API Error: ', '') || 'Falha ao adicionar conta EA.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-xl">
        <h2 className="text-xl text-white mb-4">Add EA Account</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-2">SID</label>
            <textarea
              value={sid}
              onChange={(e) => setSid(e.target.value)}
              rows={3}
              className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-zinc-600 resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">REMID</label>
            <textarea
              value={remid}
              onChange={(e) => setRemid(e.target.value)}
              rows={3}
              className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-zinc-600 resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Locale</label>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-zinc-600"
            >
              <option value="en">en</option>
              <option value="pt-br">pt-br</option>
            </select>
          </div>

          {errorMessage && (
            <div className="rounded-lg border border-red-800 bg-red-950/40 px-4 py-3 text-red-300 text-sm">
              {errorMessage}
            </div>
          )}

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
              {saving ? 'Saving...' : 'Add Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}