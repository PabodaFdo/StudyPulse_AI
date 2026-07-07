const PageHeader = ({ title, subtitle, action, icon: Icon }) => {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-left">
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/30 bg-white/20 backdrop-blur-md shadow-lg flex-shrink-0">
            <Icon className="h-6 w-6 text-white" />
          </div>
        )}
        <div>
          <h1 className="page-title text-2xl md:text-3xl lg:text-4xl">{title}</h1>
          {subtitle && <p className="page-subtitle mt-1 text-sm md:text-base">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex-shrink-0 text-xs">{action}</div>}
    </div>
  );
};

export default PageHeader;
