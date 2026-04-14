import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl text-white mb-2">Choriper Manager</h1>
          <p className="text-zinc-400">Game server management platform</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
          <button
            onClick={login}
            className="w-full bg-white text-black px-6 py-3 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            Sign in with OAuth
          </button>
          <p className="text-sm text-zinc-500 text-center mt-4">
            You will be redirected to authenticate
          </p>
        </div>
      </div>
    </div>
  );
}
