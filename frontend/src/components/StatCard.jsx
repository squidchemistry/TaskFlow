import { cn } from '../lib/utils';

const ACCENT_MAP = {
  blue:   'bg-brut-blue   text-white',
  yellow: 'bg-brut-yellow text-brut-black',
  green:  'bg-brut-green  text-brut-black',
  pink:   'bg-brut-pink   text-white',
  cream:  'bg-white       text-brut-black',
};

export default function StatCard({ label, value, Icon, accent = 'cream' }) {
  const colors = ACCENT_MAP[accent] ?? ACCENT_MAP.cream;
  return (
    <div className={cn('brut-card p-5 flex items-center gap-4', colors)}>
      {Icon && (
        <div className="w-12 h-12 border-2 border-brut-black flex items-center justify-center shrink-0 bg-white bg-opacity-20">
          <Icon size={22} className="text-current" />
        </div>
      )}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest font-mono opacity-75">{label}</p>
        <p className="text-3xl font-bold font-mono leading-none mt-0.5">{value}</p>
      </div>
    </div>
  );
}
