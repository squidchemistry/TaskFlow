import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Input = forwardRef(function Input({ label, error, className, ...props }, ref) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wider font-mono text-brut-black mb-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={cn('brut-input', error && 'brut-input-error', className)}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs font-mono font-bold text-brut-pink">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
