import { Link, useLocation } from 'react-router-dom';
import { Users, Server, Shield, UserCircle, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Sidebar() {
  const location = useLocation();
  const { logout } = useAuth();

  const links = [
    { to: '/', label: 'Groups', icon: Users },
    { to: '/servers', label: 'Servers', icon: Server },
    { to: '/bans', label: 'Bans', icon: Shield },
    { to: '/ea-accounts', label: 'EA Accounts', icon: UserCircle },
  ];

  return (
    <aside className="w-full md:w-64 md:min-h-screen shrink-0 bg-zinc-900 border-b md:border-b-0 md:border-r border-zinc-800 flex flex-col">
      <div className="p-6 border-b border-zinc-800">
        <h1 className="text-xl text-white">Choriper Manager</h1>
      </div>

      <nav className="flex-1 p-4">
        <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-1 md:pb-0">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;

            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:bg-zinc-800/50 hover:text-white transition-colors w-full"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}