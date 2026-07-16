import { useState } from "react";
import { PageHeader } from "../../components/ui/PageHeader";
import {
  Building2,
  MapPin,
  Settings,
  Loader2,
  RefreshCw,
  Zap,
  LayoutGrid,
  UploadCloud,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Code,
} from "lucide-react";
import { useAdminData } from "../../context/AdminDataContext";
import {
  generateMasterData,
  generateLocations,
  generateGates,
  generateParkingSlots,
} from "../../data/AdminSimulation";

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

const SelectField = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  className = "",
}) => (
  <label className={`space-y-1.5 block ${className}`}>
    <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
      {label}
    </span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-sm text-slate-900 outline-none transition-all disabled:bg-slate-50 focus:bg-white focus:ring-2 focus:ring-(--app-violet)/20 focus:border-(--app-violet) shadow-sm"
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
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

// --- Main Page Component ---

export function AdminSimulation() {
  const { adminData, updateAdminData, clearAllAdminData } = useAdminData();

  // App States
  const [generating, setGenerating] = useState({});
  const [posting, setPosting] = useState({});
  const [posted, setPosted] = useState({});
  const [expandedView, setExpandedView] = useState({});

  // Form States
  const [locationForm, setLocationForm] = useState({
    location_name: "Central Hub Parking",
    address: "100 Tech Park Drive, CityCenter",
    status: "ACTIVE",
  });
  const [slotForm, setSlotForm] = useState({ count: 20 });

  // Helpers
  const isDataPresent = (key) => adminData[key]?.length > 0;

  const getStatus = (key) => {
    if (posted[key]) return "POSTED";
    if (isDataPresent(key)) return "GENERATED";
    return "PENDING";
  };

  // Execution Wrapper
  const runSimulation = async (moduleKeys, generatorFn) => {
    const keys = Array.isArray(moduleKeys) ? moduleKeys : [moduleKeys];

    // UI State Prep
    setGenerating((prev) =>
      keys.reduce((acc, k) => ({ ...acc, [k]: true }), prev),
    );
    setPosted((prev) =>
      keys.reduce((acc, k) => ({ ...acc, [k]: false }), prev),
    );

    await new Promise((resolve) => setTimeout(resolve, 600)); // Simulating processing delay

    try {
      const generatedData = generatorFn();

      // Batch updates
      Object.entries(generatedData).forEach(([key, data]) => {
        updateAdminData(key, data);
        setExpandedView((prev) => ({ ...prev, [key]: true }));
      });
    } catch (err) {
      alert(err.message);
    } finally {
      setGenerating((prev) =>
        keys.reduce((acc, k) => ({ ...acc, [k]: false }), prev),
      );
    }
  };

  // Logic: Post to DB (Mock API Call)
  const postModule = async (module) => {
    setPosting((prev) => ({ ...prev, [module]: true }));
    // Example DB Call: await fetch('/api/v1/' + module, { method: 'POST', body: JSON.stringify(adminData[module]) })
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setPosting((prev) => ({ ...prev, [module]: false }));
    setPosted((prev) => ({ ...prev, [module]: true }));
    setExpandedView((prev) => ({ ...prev, [module]: false }));
  };

  // Handlers mappings to external functions
  const handleGenerateMasterData = () =>
    runSimulation(
      ["locationTypes", "vehicleTypes", "reservationClasses"],
      generateMasterData,
    );
  const handleGenerateLocations = () =>
    runSimulation(["locations", "eventMetadata"], () =>
      generateLocations(locationForm, adminData),
    );
  const handleGenerateGates = () =>
    runSimulation("gates", () => generateGates(adminData));
  const handleGenerateSlots = () =>
    runSimulation("parkingSlots", () =>
      generateParkingSlots(slotForm.count, adminData),
    );

  // Bulk Operations
  const generateAll = async () => {
    setGenerating((prev) => ({ ...prev, all: true }));
    try {
      await handleGenerateMasterData();
      await handleGenerateLocations();
      await handleGenerateGates();
      await handleGenerateSlots();
    } finally {
      setGenerating((prev) => ({ ...prev, all: false }));
    }
  };

  const pushAll = async () => {
    setPosting((prev) => ({ ...prev, all: true }));
    try {
      const modules = [
        "locationTypes",
        "vehicleTypes",
        "reservationClasses",
        "locations",
        "gates",
        "parkingSlots",
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

  // Reusable Component UI Card
  const DomainCard = ({
    title,
    icon: Icon,
    dataKey,
    onGenerate,
    generateFields,
    children,
  }) => (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md overflow-hidden flex flex-col">
      <div className="p-6 md:p-8 flex-1">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-(--app-violet)/5 text-(--app-violet) ring-1 ring-(--app-violet)/10">
              <Icon size={24} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 mb-1">
                Domain Module
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
        </div>

        <DataViewer
          data={adminData[dataKey]}
          isExpanded={expandedView[dataKey]}
          onToggle={() =>
            setExpandedView((prev) => ({ ...prev, [dataKey]: !prev[dataKey] }))
          }
        />
      </div>

      <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={onGenerate}
          disabled={generating[dataKey]}
          className="w-full sm:w-auto flex justify-center items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 shadow-sm"
        >
          {generating[dataKey] ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Zap className="h-4 w-4 text-amber-500" />
          )}
          {isDataPresent(dataKey) ? "Regenerate Data" : "Generate Data"}
        </button>

        <button
          onClick={() => postModule(dataKey)}
          disabled={
            !isDataPresent(dataKey) || posting[dataKey] || posted[dataKey]
          }
          className={`w-full sm:w-auto flex justify-center items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all shadow-sm ${
            posted[dataKey]
              ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"
              : "bg-(--app-violet) hover:bg-(--app-violet-strong) disabled:opacity-50 disabled:bg-slate-300 shadow-(--app-violet)/20"
          }`}
        >
          {posting[dataKey] ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Pushing...
            </>
          ) : posted[dataKey] ? (
            <>
              <CheckCircle2 className="h-4 w-4" /> Posted
            </>
          ) : (
            <>
              <UploadCloud className="h-4 w-4" /> Push DB
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <section className="space-y-8 max-w-7xl mx-auto pb-20">
    

      {/* Global Action Bar */}
      <div className="rounded-3xl border border-slate-200 bg-white p-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shadow-sm sticky top-6 z-10">
        <div className="px-4 py-2">
          <p className="text-sm font-semibold text-slate-900">
            Bulk Operations
          </p>
          <p className="text-xs text-slate-500">
            Manage the entire schema pipeline
          </p>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-2">
          <button
            onClick={generateAll}
            disabled={generating.all}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition disabled:opacity-50"
          >
            {generating.all ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            Build Pipeline
          </button>
          <button
            onClick={pushAll}
            disabled={posting.all}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-2xl bg-(--app-violet) px-6 py-3 text-sm font-semibold text-white hover:bg-(--app-violet-strong) transition disabled:opacity-50 shadow-lg shadow-(--app-violet)/20"
          >
            {posting.all ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UploadCloud className="h-4 w-4" />
            )}
            Push All to DB
          </button>
          <button
            onClick={() => {
              clearAllAdminData();
              setPosted({});
              setExpandedView({});
            }}
            className="flex-none p-3 rounded-2xl border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition"
            title="Reset Everything"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* 2x2 Grid for the remaining 4 domains */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <DomainCard
          title="Master Data"
          icon={Settings}
          dataKey="locationTypes"
          onGenerate={handleGenerateMasterData}
        >
          <p className="text-sm leading-relaxed text-slate-600">
            Generates static configuration tables: <br />•{" "}
            <strong>Location Types:</strong> PERMANENT_RETAIL, TEMPORARY_EVENT{" "}
            <br />• <strong>Vehicle Types:</strong> Car, Bike, Delivery <br />•{" "}
            <strong>Reservation Classes:</strong> General, VIP
          </p>
        </DomainCard>

        <DomainCard
          title="Locations & Events"
          icon={Building2}
          dataKey="locations"
          onGenerate={handleGenerateLocations}
          generateFields={
            <div className="grid gap-5 sm:grid-cols-2">
              <InputField
                label="Location Name"
                value={locationForm.location_name}
                onChange={(v) =>
                  setLocationForm({ ...locationForm, location_name: v })
                }
              />
              <SelectField
                label="Status"
                value={locationForm.status}
                onChange={(v) =>
                  setLocationForm({ ...locationForm, status: v })
                }
                options={[
                  { value: "ACTIVE", label: "Active" },
                  { value: "INACTIVE", label: "Inactive" },
                ]}
              />
              <InputField
                label="Address"
                value={locationForm.address}
                onChange={(v) =>
                  setLocationForm({ ...locationForm, address: v })
                }
                className="sm:col-span-2"
              />
            </div>
          }
        >
          <p className="text-sm leading-relaxed text-slate-600">
            Creates a Location record linked to the Master Data. If applicable,
            sets up Event Metadata (start/end times).
          </p>
        </DomainCard>

        <DomainCard
          title="Gates Infrastructure"
          icon={MapPin}
          dataKey="gates"
          onGenerate={handleGenerateGates}
        >
          <p className="text-sm leading-relaxed text-slate-600">
            Automatically provisions <strong>Entry</strong> and{" "}
            <strong>Exit</strong> gates and links them to the active Location
            domain.
          </p>
        </DomainCard>

        <DomainCard
          title="Parking Inventory"
          icon={LayoutGrid}
          dataKey="parkingSlots"
          onGenerate={handleGenerateSlots}
          generateFields={
            <InputField
              label="Number of Slots to Generate"
              type="number"
              value={slotForm.count}
              onChange={(v) => setSlotForm({ count: parseInt(v) || 0 })}
            />
          }
        >
          <p className="text-sm leading-relaxed text-slate-600">
            Generates parking slots distributed evenly across available vehicle
            types and reservation classes. Associates mock sensor IDs.
          </p>
        </DomainCard>
      </div>
    </section>
  );
}
