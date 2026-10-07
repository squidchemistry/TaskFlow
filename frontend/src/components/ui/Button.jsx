import { cn } from '../../lib/utils';

const VARIANT_MAP = {
  primary: 'brut-btn-primary',
  blue:    'brut-btn-blue',
  pink:    'brut-btn-pink',
  green:   'brut-btn-green',
  ghost:   'brut-btn-ghost',
  danger:  'brut-btn bg-brut-pink text-white',
};

const SIZE_MAP = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2   text-sm',
  lg: 'px-6 py-3   text-base',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  loading = false,
  ...props
}) {
  return (
    <button
      className={cn(VARIANT_MAP[variant] ?? VARIANT_MAP.primary, SIZE_MAP[size], className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent animate-spin" />
      )}
      {children}
    </button>
  );
}
