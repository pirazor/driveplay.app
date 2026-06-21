import { Server, Info } from 'lucide-react';
import { proxyEnabled } from '../player/proxyClient';

export function SettingsScreen() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <h1 className="pt-6 text-5xl font-semibold tracking-tight">Settings</h1>

      <Row
        icon={<Server className="h-7 w-7 text-white/70" strokeWidth={1.5} />}
        title="Media backend"
        desc="Proxy that routes Live TV and YouTube streams to bypass CORS / geo-blocking."
      >
        <span className={`text-lg font-medium ${proxyEnabled ? 'text-emerald-400' : 'text-white/40'}`}>
          {proxyEnabled ? 'Connected' : 'Not configured'}
        </span>
      </Row>

      <div className="flex items-start gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-7 text-lg leading-relaxed text-white/45">
        <Info className="mt-1 h-6 w-6 shrink-0" strokeWidth={1.5} />
        <p>
          This app shows only free, publicly-broadcast television and content played through licensed
          third-party libraries. Watching video while driving is dangerous and may be illegal.
        </p>
      </div>
    </div>
  );
}

function Row({
  icon,
  title,
  desc,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-6 rounded-3xl border border-white/10 bg-white/[0.04] p-7">
      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/5">{icon}</div>
      <div className="min-w-0 flex-1">
        <h3 className="text-2xl font-medium text-white">{title}</h3>
        <p className="mt-1 text-lg text-white/45">{desc}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
