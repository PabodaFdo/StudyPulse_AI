const ChartCard = ({ title, subtitle, children, action, className = '' }) => {
  return (
    <div className={`app-panel p-6 ${className}`}>
      <div className="liquid-card-content">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="font-extrabold card-title text-sm sm:text-base">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs card-muted">{subtitle}</p>}
          </div>
          {action && <div className="text-xs">{action}</div>}
        </div>
        <div className="min-h-[200px] flex items-center justify-center relative z-10">{children}</div>
      </div>
    </div>
  );
};

export default ChartCard;
