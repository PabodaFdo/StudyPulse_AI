const colorMap = {
  purple: 'bg-brand-400',
  blue: 'bg-accent-400',
  green: 'bg-success-400',
  yellow: 'bg-warning-400',
  red: 'bg-danger-400',
};

const ProgressBar = ({ value = 0, max = 100, color = 'purple', label, showPercent = true, className = '' }) => {
  const pct = Math.min(Math.round((value / max) * 100), 100);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="text-slate-500 dark:text-slate-400 font-medium">{label}</span>}
          {showPercent && <span className="text-slate-600 dark:text-slate-300 font-bold">{pct}%</span>}
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${colorMap[color]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
