export const SectionCard = ({
  title,
  icon: Icon,
  children,
  className = "",
  actions,
}) => (
  <div className={`rounded-3xl border border-slate-200 bg-white ${className}`}>
    <div className="border-b border-slate-200 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-(--app-violet)" />
        <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
    <div className="p-5">{children}</div>
  </div>
);