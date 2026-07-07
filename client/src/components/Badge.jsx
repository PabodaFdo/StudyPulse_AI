const colorMap = {
  purple: 'bg-lavender/20 text-purple border-lavender/30',
  blue: 'bg-blue/30 text-purple border-blue/40',
  green: 'bg-mint text-emerald-900 border-mint/70',
  yellow: 'bg-yellow text-amber-900 border-yellow/70',
  red: 'bg-pink/30 text-danger-500 border-pink/40',
  gray: 'bg-cream text-text-muted border-lavender/25',
};

const Badge = ({ children, color = 'purple', className = '' }) => {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[10px] sm:text-xs font-bold
        ${colorMap[color]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
