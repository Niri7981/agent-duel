import { ReactNode } from "react";

export function RoundShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-8">
        <header className="space-y-2 border-b border-neutral-800 pb-6">
          <p className="text-xs uppercase tracking-[0.24em] text-neutral-500">
            Agent Arena
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Live Round</h1>
        </header>
        {children}
      </div>
    </main>
  );
}
