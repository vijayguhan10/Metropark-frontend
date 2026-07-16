import { useState, useMemo } from "react";
import { PageHeader } from "../../components/ui/PageHeader";
import { useAdminData } from "../../context/AdminDataContext";
import {
  User,
  Car,
  Clock,
  CreditCard,
  Calendar,
  Loader2,
  Zap,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  UploadCloud,
  ChevronDown,
  ChevronUp,
  Code,
} from "lucide-react";
import {
  generateUsers,
  generateVehicles,
  generateSessions,
  generatePayments,
  generateReservations,
} from "../../data/clientsimulate";

// --- UI Components ---
const StatusBadge = ({ status }) => {
  const styles = {
    ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    GENERATED: "bg-blue-50 text-blue-700 border-blue-200",
    POSTED: "bg-violet-50 text-violet-700 border-violet-200",
  };
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase border ${styles[status] || "bg-slate-50 text-slate-700 border-slate-200"}`}
    >
      {status}
    </span>
  );
};

const InputField = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled,
  className = "",
}) => (
  <label className={`space-y-1.5 block ${className}`}>
    <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
      {label}
    </span>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-500 focus:bg-white focus:ring-2 focus:ring-(--app-violet)/20 focus:border-(--app-violet) shadow-sm"
    />
  </label>
);

const DataViewer = ({ data, isExpanded, onToggle }) => {
  if (!data || data.length === 0) return null;
  return (
    <div className="mt-6 pt-5 border-t border-slate-100">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
      >
        <Code size={16} />
        {isExpanded
          ? "Hide Data Payload"
          : `View Data Payload (${data.length} records)`}
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isExpanded && (
        <div className="mt-4 rounded-2xl bg-slate-950 p-4 overflow-hidden shadow-inner">
          <div className="overflow-y-auto max-h-60 custom-scrollbar">
            <pre className="text-[11px] leading-relaxed text-slate-300 font-mono">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export function ClientSimulation() {
  const { adminData } = useAdminData(); // Schema dependency

  // App States
  const [generating, setGenerating] = useState({});
  const [posting, setPosting] = useState({});
  const [posted, setPosted] = useState({});
  const [expandedView, setExpandedView] = useState({});

  // Client Data Store (Local to Simulation before Pushing)
  const [clientData, setClientData] = useState({
    users: [],
    vehicles: [],
    sessions: [],
    payments: [],
    reservations: [],
  });

  // Form Configurations
  const [userForm, setUserForm] = useState({ count: 15, vehiclesPerUser: 1 });
  const [sessionForm, setSessionForm] = useState({ count: 10 });
  const [reservationForm, setReservationForm] = useState({ count: 5 });

  // Admin Dependency Check
  const hasAdminData = useMemo(() => {
    return (
      adminData?.locations?.length > 0 &&
      adminData?.gates?.length > 0 &&
      adminData?.vehicleTypes?.length > 0 &&
      adminData?.parkingSlots?.length > 0
    );
  }, [adminData]);

  // Helpers
  const isDataPresent = (key) => clientData[key]?.length > 0;

  const getStatus = (key) => {
    if (posted[key]) return "POSTED";
    if (isDataPresent(key)) return "GENERATED";
    return "PENDING";
  };

  // Execution Wrapper
  const runSimulation = async (moduleKey, generatorFn) => {
    setGenerating((prev) => ({ ...prev, [moduleKey]: true }));
    setPosted((prev) => ({ ...prev, [moduleKey]: false }));

    await new Promise((resolve) => setTimeout(resolve, 600)); // UI delay

    try {
      const newData = generatorFn();
      setClientData((prev) => ({ ...prev, [moduleKey]: newData }));
      setExpandedView((prev) => ({ ...prev, [moduleKey]: true }));
    } catch (err) {
      alert(err.message);
    } finally {
      setGenerating((prev) => ({ ...prev, [moduleKey]: false }));
    }
  };

  // Logic: Post to DB (Mock API Call)
  const postModule = async (module) => {
    setPosting((prev) => ({ ...prev, [module]: true }));
    // Example: await fetch('/api/v1/client/' + module, { method: 'POST', body: JSON.stringify(clientData[module]) })
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setPosting((prev) => ({ ...prev, [module]: false }));
    setPosted((prev) => ({ ...prev, [module]: true }));
    setExpandedView((prev) => ({ ...prev, [module]: false }));
  };

  // Handlers mapping to external logic
  const handleGenerateUsers = () =>
    runSimulation("users", () => generateUsers(userForm.count));

  const handleGenerateVehicles = () =>
    runSimulation("vehicles", () =>
      generateVehicles(clientData.users, adminData, userForm.vehiclesPerUser),
    );

  const handleGenerateSessions = () =>
    runSimulation("sessions", () =>
      generateSessions(
        clientData.users,
        clientData.vehicles,
        adminData,
        sessionForm.count,
      ),
    );

  const handleGeneratePayments = () =>
    runSimulation("payments", () =>
      generatePayments(clientData.sessions, adminData),
    );

  const handleGenerateReservations = () =>
    runSimulation("reservations", () =>
      generateReservations(
        clientData.users,
        clientData.vehicles,
        adminData,
        reservationForm.count,
      ),
    );

  // Bulk Operations
  const generateAllClient = async () => {
    if (!hasAdminData)
      return alert(
        "Admin schema missing! Please build the admin pipeline first.",
      );
    setGenerating((prev) => ({ ...prev, all: true }));

    try {
      const users = generateUsers(userForm.count);
      const vehicles = generateVehicles(
        users,
        adminData,
        userForm.vehiclesPerUser,
      );
      const sessions = generateSessions(
        users,
        vehicles,
        adminData,
        sessionForm.count,
      );
      const payments = generatePayments(sessions, adminData);
      const reservations = generateReservations(
        users,
        vehicles,
        adminData,
        reservationForm.count,
      );

      setClientData({ users, vehicles, sessions, payments, reservations });

      // Auto expand first two for visual feedback
      setExpandedView({ users: true, vehicles: true });
    } catch (err) {
      alert(err.message);
    } finally {
      setGenerating((prev) => ({ ...prev, all: false }));
    }
  };

  const pushAllClient = async () => {
    setPosting((prev) => ({ ...prev, all: true }));
    try {
      const modules = [
        "users",
        "vehicles",
        "sessions",
        "payments",
        "reservations",
      ];
      for (const mod of modules) {
        if (isDataPresent(mod) && !posted[mod]) {
          await postModule(mod);
        }
      }
    } finally {
      setPosting((prev) => ({ ...prev, all: false }));
    }
  };

  const resetAll = () => {
    setClientData({
      users: [],
      vehicles: [],
      sessions: [],
      payments: [],
      reservations: [],
    });
    setPosted({});
    setExpandedView({});
  };

  // Reusable Component UI Card
  const DomainCard = ({
    title,
    icon: Icon,
    dataKey,
    onGenerate,
    disabled,
    disabledReason,
    generateFields,
    children,
  }) => (
    <div
      className={`rounded-3xl border border-slate-200 bg-white shadow-sm transition-all overflow-hidden flex flex-col ${disabled ? "opacity-70 grayscale-[20%]" : "hover:shadow-md"}`}
    >
      <div className="p-6 md:p-8 flex-1">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/10">
              <Icon size={24} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 mb-1">
                Transaction Module
              </p>
              <h3 className="text-xl font-semibold text-slate-900 tracking-tight">
                {title}
              </h3>
            </div>
          </div>
          <StatusBadge status={getStatus(dataKey)} />
        </div>

        <div className="space-y-6">
          {children}
          {generateFields && (
            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-100">
              {generateFields}
            </div>
          )}
          {disabled && (
            <p className="text-xs text-rose-500 font-medium bg-rose-50 p-3 rounded-xl border border-rose-100 flex items-center gap-2">
              <AlertCircle size={14} /> {disabledReason}
            </p>
          )}
        </div>

        <DataViewer
          data={clientData[dataKey]}
          isExpanded={expandedView[dataKey]}
          onToggle={() =>
            setExpandedView((prev) => ({ ...prev, [dataKey]: !prev[dataKey] }))
          }
        />
      </div>

      <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={onGenerate}
          disabled={generating[dataKey] || disabled}
          className="w-full sm:w-auto flex justify-center items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 shadow-sm"
        >
          {generating[dataKey] ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Zap className="h-4 w-4 text-emerald-500" />
          )}
          {isDataPresent(dataKey) ? "Regenerate" : "Generate"}
        </button>

        <button
          onClick={() => postModule(dataKey)}
          disabled={
            !isDataPresent(dataKey) || posting[dataKey] || posted[dataKey]
          }
          className={`w-full sm:w-auto flex justify-center items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all shadow-sm ${
            posted[dataKey]
              ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"
              : "bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:bg-slate-300 shadow-slate-900/20"
          }`}
        >
          {posting[dataKey] ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Pushing...
            </>
          ) : posted[dataKey] ? (
            <>
              <CheckCircle size={16} /> Posted
            </>
          ) : (
            <>
              <UploadCloud size={16} /> Push to DB
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <section className="space-y-8 max-w-7xl mx-auto pb-20">
  

      {/* Dependency Banner */}
      {!hasAdminData && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 flex items-start gap-4 shadow-sm">
          <div className="p-2 bg-rose-100 rounded-xl text-rose-600">
            <AlertCircle size={24} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-rose-900">
              Missing Admin Schema Dependencies
            </h4>
            <p className="text-sm text-rose-700 mt-1">
              Client data requires underlying infrastructure (Locations, Gates,
              Vehicle Types, Slots). Please run the Admin Simulator first.
            </p>
          </div>
        </div>
      )}

      {/* Global Action Bar */}
      <div className="rounded-3xl border border-slate-200 bg-white p-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shadow-sm sticky top-6 z-10">
        <div className="px-4 py-2">
          <p className="text-sm font-semibold text-slate-900">
            Bulk Client Operations
          </p>
          <p className="text-xs text-slate-500">
            Run the entire transactional pipeline
          </p>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-2">
          <button
            onClick={generateAllClient}
            disabled={generating.all || !hasAdminData}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 px-6 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition disabled:opacity-50"
          >
            {generating.all ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            Build Pipeline
          </button>
          <button
            onClick={pushAllClient}
            disabled={
              posting.all ||
              Object.values(clientData).every((arr) => arr.length === 0)
            }
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition disabled:opacity-50 shadow-lg shadow-slate-900/20"
          >
            {posting.all ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UploadCloud className="h-4 w-4" />
            )}
            Push All to DB
          </button>
          <button
            onClick={resetAll}
            className="flex-none p-3 rounded-2xl border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition"
            title="Reset Everything"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <DomainCard
          title="User Accounts"
          icon={User}
          dataKey="users"
          onGenerate={handleGenerateUsers}
          generateFields={
            <div className="grid gap-5 sm:grid-cols-2">
              <InputField
                label="Target User Count"
                type="number"
                value={userForm.count}
                onChange={(v) =>
                  setUserForm({ ...userForm, count: parseInt(v) || 10 })
                }
              />
            </div>
          }
        >
          <p className="text-sm leading-relaxed text-slate-600">
            Generates realistic customer identities with localized names,
            contact info, and usage metrics.
          </p>
        </DomainCard>

        <DomainCard
          title="Registered Vehicles"
          icon={Car}
          dataKey="vehicles"
          onGenerate={handleGenerateVehicles}
          disabled={!isDataPresent("users") || !hasAdminData}
          disabledReason="Requires Users and Admin Vehicle Types"
          generateFields={
            <div className="grid gap-5 sm:grid-cols-2">
              <InputField
                label="Vehicles Per User"
                type="number"
                value={userForm.vehiclesPerUser}
                onChange={(v) =>
                  setUserForm({
                    ...userForm,
                    vehiclesPerUser: parseInt(v) || 1,
                  })
                }
              />
            </div>
          }
        >
          <p className="text-sm leading-relaxed text-slate-600">
            Assigns realistic license plates, brands, models, and color
            distributions to generated users.
          </p>
        </DomainCard>

        <DomainCard
          title="Parking Sessions"
          icon={Clock}
          dataKey="sessions"
          onGenerate={handleGenerateSessions}
          disabled={!isDataPresent("vehicles") || !hasAdminData}
          disabledReason="Requires Vehicles and Admin Locations/Slots"
          generateFields={
            <div className="grid gap-5 sm:grid-cols-2">
              <InputField
                label="Number of Sessions"
                type="number"
                value={sessionForm.count}
                onChange={(v) => setSessionForm({ count: parseInt(v) || 10 })}
              />
            </div>
          }
        >
          <p className="text-sm leading-relaxed text-slate-600">
            Simulates dynamic entry/exit logs connecting Vehicles to specific
            Infrastructure Gates and Slots.
          </p>
        </DomainCard>

        <DomainCard
          title="Transactions (Payments)"
          icon={CreditCard}
          dataKey="payments"
          onGenerate={handleGeneratePayments}
          disabled={!isDataPresent("sessions")}
          disabledReason="Requires completed Parking Sessions"
        >
          <p className="text-sm leading-relaxed text-slate-600">
            Processes monetary transactions for completed or active parking
            sessions against available payment gateways.
          </p>
        </DomainCard>

        <DomainCard
          title="Future Reservations"
          icon={Calendar}
          dataKey="reservations"
          onGenerate={handleGenerateReservations}
          disabled={!isDataPresent("vehicles") || !hasAdminData}
          disabledReason="Requires Vehicles and Admin Locations/Classes"
          generateFields={
            <div className="grid gap-5 sm:grid-cols-2">
              <InputField
                label="Number of Reservations"
                type="number"
                value={reservationForm.count}
                onChange={(v) =>
                  setReservationForm({ count: parseInt(v) || 5 })
                }
              />
            </div>
          }
        >
          <p className="text-sm leading-relaxed text-slate-600">
            Books future time slots for specific users and vehicles using
            reservation classes.
          </p>
        </DomainCard>
      </div>
    </section>
  );
}
