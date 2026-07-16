export function StatCard({ label, value, hint, tone = "default" }) {
  const toneClass = {
    default: "border-slate-200 bg-white",
    cyan: "border-violet-200 bg-violet-50",
    rose: "border-rose-200 bg-rose-50",
    amber: "border-amber-200 bg-amber-50",
  };

  return (
    <div className={`rounded-3xl border p-5 ${toneClass[tone]}`}>
      <p className="text-xs uppercase tracking-[0.2em] text-black">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-4">
        <p className="text-3xl font-semibold text-black">{value}</p>
        {hint ? <p className="text-xs text-black">{hint}</p> : null}
      </div>
    </div>
  );
}
