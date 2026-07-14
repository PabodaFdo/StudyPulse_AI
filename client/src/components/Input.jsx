import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = forwardRef(({ label, error, icon: Icon, type = 'text', className = '', ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="flex flex-col gap-1.5 w-full text-left">
      {label && (
        <label className="text-xs font-bold text-slate-700 dark:text-slate-200 px-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
        )}
        <input
          ref={ref}
          type={inputType}
          className={`
            w-full liquid-input text-xs sm:text-sm transition-all duration-200
            text-slate-900 dark:text-white bg-white dark:bg-slate-800
            placeholder:text-slate-500 dark:placeholder:text-slate-400
            border border-slate-300 dark:border-slate-700
            focus:border-brand-500 dark:focus:border-brand-400
            focus:ring-brand-500/20 dark:focus:ring-brand-400/20
            ${Icon ? 'pl-11' : ''}
            ${isPassword ? 'pr-11' : ''}
            ${error ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20' : ''}
            ${className}
          `}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors focus:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-danger-500 px-2">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
