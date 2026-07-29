import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export const StatCardWithIcon = ({
  icon: Icon,
  label,
  value,
  hint,
  trend,
  tone = "default",
}) => {
  const toneStyles = {
    default: "bg-slate-50 border-slate-200",
    violet: "bg-violet-50 border-violet-100",
    emerald: "bg-emerald-50 border-emerald-100",
    cyan: "bg-cyan-50 border-cyan-100",
    amber: "bg-amber-50 border-amber-100",
    rose: "bg-rose-50 border-rose-100",
  };
  const iconTones = {
    default: "text-slate-600",
    violet: "text-violet-600",
    emerald: "text-emerald-600",
    cyan: "text-cyan-600",
    amber: "text-amber-600",
    rose: "text-rose-600",
  };
  return (
    <div className={`rounded-3xl border p-5 ${toneStyles[tone]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
          <p className="mt-1 text-sm text-slate-600">{hint}</p>
        </div>
        <div className={`p-3 rounded-2xl ${iconTones[tone]} bg-white/50`}>
          <Icon size={24} />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          {trend.positive ? (
            <ArrowUpRight className="h-4 w-4 text-emerald-600" />
          ) : (
            <ArrowDownRight className="h-4 w-4 text-rose-600" />
          )}
          <span
            className={trend.positive ? "text-emerald-600" : "text-rose-600"}
          >
            {trend.value}
          </span>
          <span className="text-slate-400">{trend.period}</span>
        </div>
      )}
    </div>
  );
};