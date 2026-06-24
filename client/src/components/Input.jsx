import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, icon: Icon, className = '', ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1.5 w-full text-left">
      {label && (
        <label className="text-xs font-bold text-slate-700 dark:text-slate-200 px-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted/60 dark:text-slate-500" />
        )}
        <input
          ref={ref}
          className={`
            w-full liquid-input text-xs sm:text-sm transition-all duration-200
            text-slate-900 dark:text-white bg-white dark:bg-slate-800
            placeholder:text-slate-400 dark:placeholder:text-slate-500
            border border-slate-300 dark:border-slate-700
            focus:border-brand-500 dark:focus:border-brand-400
            focus:ring-brand-500/20 dark:focus:ring-brand-400/20
            ${Icon ? 'pl-11' : ''}
            ${error ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-danger-500 px-2">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
