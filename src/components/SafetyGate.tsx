import { ShieldAlert, Car, Home, Ban } from 'lucide-react';
import { HoldToConfirmButton } from './HoldToConfirmButton';
import { useSafety } from '../state/SafetyContext';
import { useVehicleMotion } from '../state/useVehicleMotion';

/**
 * Pre-roll safety gate. Stronger than Sefirox's single-tap "I'm a passenger"
 * button: it requires a deliberate press-and-hold, states the rule plainly, and
 * surfaces live vehicle speed when the browser can read it.
 *
 * (The full in-motion guardrails — pause / audio-only above a speed threshold —
 * land in the next phase; this is the entry gate.)
 */
export function SafetyGate({ children }: { children: React.ReactNode }) {
  const { confirmed, confirmPassenger } = useSafety();
  const motion = useVehicleMotion();

  if (confirmed) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070a0f] px-6">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center shadow-2xl">
        <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-2xl bg-amber-500/15">
          <ShieldAlert className="h-10 w-10 text-amber-400" />
        </div>

        <h1 className="text-3xl font-bold text-white">Sürüş sırasında izlemeyin</h1>
        <p className="mx-auto mt-3 max-w-lg text-base leading-relaxed text-white/60">
          Video izlemek yalnızca yolcular içindir. Sürüş sırasında ekranı izlemek sizin ve
          çevrenizdekilerin güvenliğini tehlikeye atar. Lütfen yalnızca yolcu koltuğundayken devam
          edin.
        </p>

        <div className="mt-7 grid grid-cols-3 gap-3 text-left">
          <Tip icon={<Car className="h-5 w-5 text-cyan-400" />} text="Yolcu koltuğundan izleyin" />
          <Tip icon={<Home className="h-5 w-5 text-cyan-400" />} text="Park halindeyken izleyin" />
          <Tip icon={<Ban className="h-5 w-5 text-red-400" />} text="Asla sürerken izlemeyin" />
        </div>

        {motion.available && (
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm">
            <span className="text-white/50">Araç hızı:</span>
            <span className={motion.inMotion ? 'font-semibold text-red-400' : 'font-semibold text-emerald-400'}>
              {motion.speedKmh != null ? `${Math.round(motion.speedKmh)} km/s` : '—'}
            </span>
          </div>
        )}

        <div className="mt-8 flex flex-col items-center gap-3">
          <HoldToConfirmButton
            onConfirmed={confirmPassenger}
            label="Yolcuyum — başlamak için basılı tutun"
            holdingLabel="Devam edin…"
          />
          <p className="text-xs text-white/40">
            Onaylayarak yolcu olduğunuzu ve sürücü olmadığınızı kabul edersiniz.
          </p>
        </div>
      </div>
    </div>
  );
}

function Tip({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-center">
      {icon}
      <span className="text-sm text-white/70">{text}</span>
    </div>
  );
}
