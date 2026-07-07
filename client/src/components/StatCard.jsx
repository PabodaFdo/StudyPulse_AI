const StatCard = ({ icon: Icon, label, value, badgeText, change, changeType = 'positive', onClick, color }) => {
  const isClickable = !!onClick;
  
  let cardBgClass = "app-card";
  if (color === 'purple') cardBgClass = "pastel-purple-card";
  else if (color === 'pink' || color === 'red') cardBgClass = "pastel-pink-card";
  else if (color === 'blue') cardBgClass = "pastel-blue-card";
  else if (color === 'green' || color === 'mint') cardBgClass = "pastel-mint-card";
  else if (color === 'yellow' || color === 'amber') cardBgClass = "pastel-yellow-card";

  const CardWrapper = isClickable ? 'button' : 'div';
  const clickableProps = isClickable 
    ? { 
        onClick, 
        className: `${cardBgClass} p-6 w-full text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] focus:outline-none focus:ring-2 focus:ring-purple cursor-pointer`,
        "aria-label": `Navigate to ${label}`
      } 
    : { className: `${cardBgClass} p-6 w-full text-left` };

  return (
    <CardWrapper {...clickableProps}>
      <div className="relative z-10 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/50 dark:bg-slate-900/50 shadow-sm">
            <Icon className="h-5 w-5 text-slate-700 dark:text-slate-300" />
          </div>
          {(badgeText || change !== undefined) && (
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                changeType === 'positive'
                  ? 'bg-mint text-text-main border border-mint/50 dark:bg-mint/15 dark:text-mint dark:border-mint/30'
                  : changeType === 'negative'
                  ? 'bg-pink/40 text-danger-500 border border-pink/50 dark:bg-pink/15 dark:text-pink dark:border-pink/30'
                  : 'bg-lavender/30 text-text-muted border border-lavender/50 dark:bg-lavender/10 dark:text-slate-400 dark:border-lavender/30'
              }`}
            >
              {badgeText ? badgeText : `${changeType === 'positive' ? '+' : changeType === 'negative' ? '' : ''}${change}%`}
            </span>
          )}
        </div>
        <div>
          <p className="text-2xl sm:text-3xl font-extrabold card-title tracking-tight">{value}</p>
          <p className="mt-1 text-xs sm:text-sm font-bold card-muted">{label}</p>
        </div>
      </div>
    </CardWrapper>
  );
};

export default StatCard;
