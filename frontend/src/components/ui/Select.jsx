import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Select = forwardRef(function Select({ label, error, children, className, ...props }, ref) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wider font-mono text-brut-black mb-1">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={cn(
          'brut-input appearance-none cursor-pointer bg-white',
          error && 'brut-input-error',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="mt-1 text-xs font-mono font-bold text-brut-pink">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
