import { cn } from '../../lib/utils';

const SIZE_MAP = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-10 h-10 border-[3px]',
};

export default function Spinner({ size = 'md', className }) {
  return (
    <div
      className={cn(
        'inline-block animate-spin border-brut-black border-t-transparent',
        SIZE_MAP[size],
        className,
      )}
      role="status"
      aria-label="Loading"
    />
  );
}
