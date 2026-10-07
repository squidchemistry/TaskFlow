import { cn } from '../../lib/utils';

export default function Badge({ children, className }) {
  return (
    <span className={cn('brut-badge', className)}>
      {children}
    </span>
  );
}
