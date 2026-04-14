import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/LoginPage';
import { Sidebar } from './components/Sidebar';
import { GroupsPage } from './pages/GroupsPage';
import { ServersPage } from './pages/ServersPage';
import { BansPage } from './pages/BansPage';
import { EAAccountsPage } from './pages/EAAccountsPage';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-zinc-950 text-white">
      <Sidebar />
      <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-zinc-950">
        <Routes>
          <Route path="/" element={<GroupsPage />} />
          <Route path="/servers" element={<ServersPage />} />
          <Route path="/bans" element={<BansPage />} />
          <Route path="/ea-accounts" element={<EAAccountsPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}