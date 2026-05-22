import { KeyRound, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

interface AdminLoginProps {
  readonly error: string | null;
  readonly isLoading: boolean;
  readonly onLogin: (password: string) => void;
}

export function AdminLogin({ error, isLoading, onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState('');

  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f6f1] p-6 text-stone-950">
      <section className="grid w-full max-w-[460px] gap-4 rounded-lg border border-stone-900/10 bg-white/90 p-5 shadow-[0_18px_48px_rgba(23,25,24,0.12)]">
        <ShieldCheck size={32} className="text-[#184a34]" />
        <div>
          <span className="mb-1 block text-xs font-bold tracking-[0.08em] text-[#184a34] uppercase">
            Acesso restrito
          </span>
          <h1 className="text-lg leading-tight font-bold tracking-normal">Ledger administrativo</h1>
        </div>
        <form
          className="grid gap-3.5"
          onSubmit={(event) => {
            event.preventDefault();
            onLogin(password);
          }}
        >
          <label className="grid gap-1.5 text-sm font-bold text-stone-500">
            <span>Senha</span>
            <div className="grid min-h-11 grid-cols-[18px_1fr] items-center gap-2 rounded-lg border border-stone-900/10 bg-white px-2.5">
              <KeyRound size={18} />
              <input
                className="min-h-10 border-0 p-0 text-stone-950 outline-0"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
            </div>
          </label>
          <button
            type="submit"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#2f6f4e] px-3.5 font-bold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            disabled={isLoading}
          >
            Entrar
          </button>
        </form>
        {error ? (
          <div className="rounded-lg border border-red-700/25 bg-red-700/10 px-4 py-3 font-bold text-red-800">
            {error}
          </div>
        ) : null}
      </section>
    </main>
  );
}
