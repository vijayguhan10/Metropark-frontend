export const StatusBadge = ({ status, children }) => {
  const styles = {
    ACTIVE: "bg-emerald-100 text-emerald-800",
    EXITED: "bg-violet-100 text-violet-800",
    CANCELLED: "bg-rose-100 text-rose-800",
    PENDING: "bg-amber-100 text-amber-800",
    PAID: "bg-emerald-100 text-emerald-800",
    FAILED: "bg-rose-100 text-rose-800",
    REFUNDED: "bg-slate-100 text-slate-800",
    SUCCESS: "bg-emerald-100 text-emerald-800",
    PROCESSING: "bg-blue-100 text-blue-800",
    INACTIVE: "bg-slate-100 text-slate-800",
    ENTRY: "bg-blue-100 text-blue-800",
    EXIT: "bg-orange-100 text-orange-800",
    BOTH: "bg-purple-100 text-purple-800",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || "bg-slate-100 text-slate-800"}`}
    >
      {children || status}
    </span>
  );
};