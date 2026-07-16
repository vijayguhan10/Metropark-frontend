import { useState, useMemo } from "react";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatCard } from "../../components/ui/StatCard";
import {
  analyticsStats,
  zoneMetrics,
  analyticsSummary,
  parkingSessions,
  users,
  vehicles,
  gates,
  payments,
  paymentMethods,
} from "../../data/analyticsData";
import {
  Users,
  Car,
  CreditCard,
  Clock,
  TrendingUp,
  DollarSign,
  BarChart2,
  MapPin,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Search,
  Filter,
  X,
  ChevronDown,
  Calendar,
} from "lucide-react";

const StatusBadge = ({ status, children }) => {
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
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || "bg-slate-100 text-slate-800"}`}>
      {children || status}
    </span>
  );
};

const StatCardWithIcon = ({ icon: Icon, label, value, hint, trend, tone = "default" }) => {
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
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
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
          <span className={trend.positive ? "text-emerald-600" : "text-rose-600"}>
            {trend.value}
          </span>
          <span className="text-slate-400">{trend.period}</span>
        </div>
      )}
    </div>
  );
};

const SearchInput = ({ value, onChange, placeholder, onClear }) => (
  <div className="relative">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full pl-10 pr-10 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-(--app-violet)/20 focus:border-(--app-violet) placeholder:text-slate-400"
    />
    {value && (
      <button
        onClick={onClear}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
      >
        <X className="h-4 w-4" />
      </button>
    )}
  </div>
);

const SelectFilter = ({ value, onChange, options, placeholder, className = "" }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={`px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-(--app-violet)/20 focus:border-(--app-violet) ${className}`}
  >
    <option value="">{placeholder}</option>
    {options.map((opt) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
);

const MultiSelectFilter = ({ value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = (val) => {
    const newValue = value.includes(val)
      ? value.filter((v) => v !== val)
      : [...value, val];
    onChange(newValue);
  };
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-(--app-violet)/20 focus:border-(--app-violet) text-left flex items-center justify-between"
      >
        <span className={value.length ? "text-slate-900" : "text-slate-400"}>
          {value.length ? `${value.length} selected` : placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full max-h-48 overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg">
          {options.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={value.includes(opt.value)}
                onChange={() => toggle(opt.value)}
                className="h-4 w-4 rounded border-slate-300 text-(--app-violet) focus:ring-(--app-violet)"
              />
              <span className="text-sm text-slate-700">{opt.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

const DataTable = ({
  columns,
  data,
  keyField,
  emptyMessage = "No data available",
  searchKey,
  filters = {},
  onFiltersChange,
  filterOptions = {},
  showSearch = true,
  showFilters = true,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [localFilters, setLocalFilters] = useState(filters);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      // Search filter
      if (searchTerm && searchKey) {
        const searchValue = String(row[searchKey] || "").toLowerCase();
        if (!searchValue.includes(searchTerm.toLowerCase())) return false;
      }

      // Column filters
      for (const [filterKey, filterValue] of Object.entries(localFilters)) {
        if (!filterValue || (Array.isArray(filterValue) && filterValue.length === 0)) continue;
        
        const rowValue = row[filterKey];
        if (Array.isArray(filterValue)) {
          if (!filterValue.includes(rowValue)) return false;
        } else if (rowValue !== filterValue) {
          return false;
        }
      }
      return true;
    });
  }, [data, searchTerm, searchKey, localFilters]);

  const hasActiveFilters = Object.values(localFilters).some(
    (v) => v && (Array.isArray(v) ? v.length > 0 : true)
  );

  const clearAllFilters = () => {
    setSearchTerm("");
    setLocalFilters({});
    onFiltersChange?.({});
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      {(showSearch || showFilters) && (
        <div className="border-b border-slate-200 p-4 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {showSearch && (
              <div className="w-full sm:w-72">
                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Search..."
                  onClear={() => setSearchTerm("")}
                />
              </div>
            )}
            {showFilters && (
              <div className="flex flex-wrap gap-3">
                {Object.entries(filterOptions).map(([key, options]) => (
                  <div key={key} className="w-48">
                    {options.type === "multi" ? (
                      <MultiSelectFilter
                        value={localFilters[key] || []}
                        onChange={(v) => handleFilterChange(key, v)}
                        options={options.options}
                        placeholder={options.placeholder}
                      />
                    ) : (
                      <SelectFilter
                        value={localFilters[key] || ""}
                        onChange={(v) => handleFilterChange(key, v)}
                        options={options.options}
                        placeholder={options.placeholder}
                      />
                    )}
                  </div>
                ))}
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1"
                  >
                    <X className="h-4 w-4" />
                    Clear
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left font-medium text-slate-600 uppercase tracking-[0.1em] ${col.align ? `text-${col.align}` : ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              filteredData.map((row) => (
                <tr key={row[keyField]} className="hover:bg-slate-50/50 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3 text-slate-700 ${col.align ? `text-${col.align}` : ""}`}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {filteredData.length > 0 && (
        <div className="border-t border-slate-200 px-4 py-3 text-sm text-slate-500">
          Showing {filteredData.length} of {data.length} records
        </div>
      )}
    </div>
  );
};

const SectionCard = ({ title, icon: Icon, children, className = "", actions }) => (
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

export function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart2 },
    { id: "users", label: "Users & Sessions", icon: Users },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "operations", label: "Operations", icon: Car },
  ];

  // Filter options for each table
  const sessionFilterOptions = {
    session_status: {
      type: "multi",
      placeholder: "Status",
      options: [
        { value: "ACTIVE", label: "Active" },
        { value: "EXITED", label: "Exited" },
        { value: "CANCELLED", label: "Cancelled" },
      ],
    },
    payment_status: {
      type: "multi",
      placeholder: "Payment",
      options: [
        { value: "PAID", label: "Paid" },
        { value: "PENDING", label: "Pending" },
        { value: "REFUNDED", label: "Refunded" },
        { value: "FAILED", label: "Failed" },
      ],
    },
  };

  const userFilterOptions = {
    total_sessions: {
      type: "select",
      placeholder: "Sessions",
      options: [
        { value: "1", label: "1 session" },
        { value: "2", label: "2 sessions" },
        { value: "3+", label: "3+ sessions" },
      ],
    },
  };

  const paymentFilterOptions = {
    payment_status: {
      type: "multi",
      placeholder: "Status",
      options: [
        { value: "SUCCESS", label: "Success" },
        { value: "PENDING", label: "Pending" },
        { value: "REFUNDED", label: "Refunded" },
        { value: "FAILED", label: "Failed" },
      ],
    },
    method_id: {
      type: "multi",
      placeholder: "Method",
      options: paymentMethods.map((m) => ({
        value: m.method_id,
        label: m.method_name.replace("_", " "),
      })),
    },
  };

  const gateFilterOptions = {
    gate_type: {
      type: "multi",
      placeholder: "Type",
      options: [
        { value: "ENTRY", label: "Entry" },
        { value: "EXIT", label: "Exit" },
        { value: "BOTH", label: "Both" },
      ],
    },
    status: {
      type: "multi",
      placeholder: "Status",
      options: [
        { value: "ACTIVE", label: "Active" },
        { value: "INACTIVE", label: "Inactive" },
      ],
    },
  };

  const vehicleFilterOptions = {
    vehicle_type_id: {
      type: "multi",
      placeholder: "Type",
      options: [
        { value: 1, label: "SUV/Luxury" },
        { value: 2, label: "Sedan" },
        { value: 3, label: "SUV/Standard" },
      ],
    },
    is_active: {
      type: "select",
      placeholder: "Status",
      options: [
        { value: "true", label: "Active" },
        { value: "false", label: "Inactive" },
      ],
    },
  };

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Performance intelligence"
        title="Analytics Dashboard"
        description="Comprehensive insights into parking operations, user behavior, revenue, and system performance."
      />

      {/* Key Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCardWithIcon
          icon={DollarSign}
          label="Total Revenue"
          value={`₹${analyticsSummary.totalRevenue.toLocaleString()}`}
          hint={`${analyticsSummary.completedSessions} completed sessions`}
          tone="emerald"
          trend={{ positive: true, value: "+12.4%", period: "vs last month" }}
        />
        <StatCardWithIcon
          icon={Users}
          label="Active Users"
          value={analyticsSummary.totalUsers}
          hint={`${analyticsSummary.totalVehicles} registered vehicles`}
          tone="cyan"
          trend={{ positive: true, value: "+8.2%", period: "vs last month" }}
        />
        <StatCardWithIcon
          icon={Car}
          label="Active Sessions"
          value={analyticsSummary.activeSessions}
          hint={`${analyticsSummary.totalSessions} total this month`}
          tone="violet"
          trend={{ positive: false, value: "-2.1%", period: "vs last week" }}
        />
        <StatCardWithIcon
          icon={Clock}
          label="Avg. Duration"
          value={`${Math.round(analyticsSummary.averageSessionDuration)} min`}
          hint="per parking session"
          tone="amber"
          trend={{ positive: true, value: "+5 min", period: "vs last month" }}
        />
      </div>

      {/* Tab Navigation */}
      <div className="rounded-2xl border border-slate-200 bg-white p-1">
        <nav className="flex gap-1" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-(--app-violet)/10 text-(--app-violet-strong) shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Panels */}
      <div className="mt-4">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Zone Occupancy & Session Status */}
            <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
              <SectionCard title="Zone Occupancy Matrix" icon={MapPin}>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {zoneMetrics.map((zone) => (
                    <div
                      key={zone.zone}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        Zone {zone.zone}
                      </p>
                      <p className="mt-3 text-3xl font-semibold text-slate-950">
                        {zone.occupancy}%
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {zone.traffic} traffic
                      </p>
                      <div className="mt-4 h-2 rounded-full bg-slate-200">
                        <div
                          className="h-2 rounded-full bg-(--app-violet)"
                          style={{ width: `${zone.occupancy}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="Session Status Distribution" icon={BarChart2}>
                <div className="space-y-3">
                  {analyticsSummary.sessionStatusDistribution.map((item) => (
                    <div key={item.status} className="flex items-center gap-3">
                      <StatusBadge status={item.status} />
                      <div className="flex-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-slate-700">{item.status}</span>
                          <span className="text-slate-500">{item.count}</span>
                        </div>
                        <div className="mt-1 h-1.5 rounded-full bg-slate-200">
                          <div
                            className="h-1.5 rounded-full bg-(--app-violet)"
                            style={{
                              width: `${(item.count / analyticsSummary.totalSessions) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>

            {/* Payment Status & Vehicle Types */}
            <div className="grid gap-6 lg:grid-cols-2">
              <SectionCard title="Payment Status" icon={CreditCard}>
                <div className="space-y-3">
                  {analyticsSummary.paymentStatusDistribution.map((item) => (
                    <div key={item.status} className="flex items-center gap-3">
                      <StatusBadge status={item.status} />
                      <div className="flex-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-slate-700">{item.status}</span>
                          <span className="text-slate-500">{item.count}</span>
                        </div>
                        <div className="mt-1 h-1.5 rounded-full bg-slate-200">
                          <div
                            className="h-1.5 rounded-full bg-emerald-500"
                            style={{
                              width: `${(item.count / payments.length) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="Vehicle Type Distribution" icon={Car}>
                <div className="space-y-3">
                  {analyticsSummary.vehicleTypeDistribution.map((item) => (
                    <div key={item.type} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-slate-700">{item.type}</span>
                          <span className="text-slate-500">{item.count}</span>
                        </div>
                        <div className="mt-1 h-1.5 rounded-full bg-slate-200">
                          <div
                            className="h-1.5 rounded-full bg-cyan-500"
                            style={{
                              width: `${(item.count / analyticsSummary.totalVehicles) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>

            {/* Recent Sessions */}
            <SectionCard title="Recent Parking Sessions" icon={Clock}>
              <DataTable
                columns={[
                  { key: "session_id", header: "Session ID" },
                  { key: "user_id", header: "User", render: (row) => {
                    const user = users.find(u => u.user_id === row.user_id);
                    return user ? `${user.name} (${user.user_id})` : row.user_id;
                  }},
                  { key: "vehicle_id", header: "Vehicle", render: (row) => {
                    const vehicle = vehicles.find(v => v.vehicle_id === row.vehicle_id);
                    return vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.vehicle_number})` : row.vehicle_id;
                  }},
                  { key: "session_status", header: "Status", render: (row) => <StatusBadge status={row.session_status} /> },
                  { key: "duration_minutes", header: "Duration", align: "right", render: (row) => row.duration_minutes ? `${row.duration_minutes} min` : "—" },
                  { key: "payment_status", header: "Payment", render: (row) => <StatusBadge status={row.payment_status} /> },
                  { key: "actual_entry_time", header: "Entry Time", render: (row) => new Date(row.actual_entry_time).toLocaleString() },
                ]}
                data={parkingSessions}
                keyField="session_id"
                searchKey="session_id"
                filterOptions={sessionFilterOptions}
              />
            </SectionCard>
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-6">
            {/* User Parking Frequency */}
            <SectionCard title="User Parking Frequency" icon={Users}>
              <DataTable
                columns={[
                  { key: "name", header: "User", render: (row) => (
                    <div>
                      <p className="font-medium text-slate-900">{row.name}</p>
                      <p className="text-xs text-slate-500">{row.email}</p>
                    </div>
                  )},
                  { key: "phone", header: "Phone" },
                  { key: "total_sessions", header: "Total Sessions", align: "center" },
                  { key: "total_duration_minutes", header: "Total Duration", align: "right", render: (row) => `${row.total_duration_minutes} min` },
                  { key: "total_spent", header: "Total Spent", align: "right", render: (row) => `₹${row.total_spent.toLocaleString()}` },
                  { key: "last_parked", header: "Last Parked", render: (row) => new Date(row.last_parked).toLocaleString() },
                ]}
                data={analyticsSummary.userParkingFrequency}
                keyField="user_id"
                searchKey="name"
                filterOptions={userFilterOptions}
              />
            </SectionCard>

            {/* User Details Table */}
            <SectionCard title="All Users Detail" icon={Users}>
              <DataTable
                columns={[
                  { key: "user_id", header: "User ID" },
                  { key: "name", header: "Name" },
                  { key: "email", header: "Email" },
                  { key: "phone", header: "Phone" },
                  { key: "created_at", header: "Joined", render: (row) => new Date(row.created_at).toLocaleDateString() },
                ]}
                data={users}
                keyField="user_id"
                searchKey="name"
              />
            </SectionCard>
          </div>
        )}

        {activeTab === "payments" && (
          <div className="space-y-6">
            {/* Payment Method Distribution */}
            <SectionCard title="Payment Method Distribution" icon={CreditCard}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {analyticsSummary.paymentMethodDistribution.map((item) => (
                  <div
                    key={item.method}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      {item.method.replace("_", " ")}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">{item.count}</p>
                    <p className="mt-1 text-sm text-slate-600">Transactions</p>
                    <p className="mt-1 text-sm font-medium text-emerald-600">
                      ₹{item.totalAmount.toLocaleString()} collected
                    </p>
                    <div className="mt-4 h-2 rounded-full bg-slate-200">
                      <div
                        className="h-2 rounded-full bg-(--app-violet)"
                        style={{
                          width: `${(item.count / payments.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* All Payments Table */}
            <SectionCard title="All Payments" icon={CreditCard}>
              <DataTable
                columns={[
                  { key: "payment_id", header: "Payment ID" },
                  { key: "transaction_reference", header: "Transaction Ref" },
                  { key: "session_id", header: "Session" },
                  { key: "method_id", header: "Method", render: (row) => {
                    const method = paymentMethods.find(m => m.method_id === row.method_id);
                    return method ? method.method_name.replace("_", " ") : row.method_id;
                  }},
                  { key: "amount", header: "Amount", align: "right", render: (row) => `₹${row.amount.toLocaleString()}` },
                  { key: "payment_status", header: "Status", render: (row) => <StatusBadge status={row.payment_status} /> },
                  { key: "processed_at", header: "Processed", render: (row) => row.processed_at ? new Date(row.processed_at).toLocaleString() : "—" },
                ]}
                data={payments}
                keyField="payment_id"
                searchKey="transaction_reference"
                filterOptions={paymentFilterOptions}
              />
            </SectionCard>
          </div>
        )}

        {activeTab === "operations" && (
          <div className="space-y-6">
            {/* Gate Utilization */}
            <SectionCard title="Gate Utilization" icon={MapPin}>
              <DataTable
                columns={[
                  { key: "gate_name", header: "Gate" },
                  { key: "gate_type", header: "Type", render: (row) => <StatusBadge status={row.gate_type} /> },
                  { key: "entry_count", header: "Entries", align: "center" },
                  { key: "exit_count", header: "Exits", align: "center" },
                  { key: "gate_type", header: "Total", align: "center", render: (row) => row.entry_count + row.exit_count },
                ]}
                data={analyticsSummary.gateUtilization}
                keyField="gate_id"
                searchKey="gate_name"
              />
            </SectionCard>

            {/* Gates Detail */}
            <SectionCard title="All Gates" icon={MapPin}>
              <DataTable
                columns={[
                  { key: "gate_id", header: "Gate ID" },
                  { key: "gate_name", header: "Name" },
                  { key: "gate_type", header: "Type", render: (row) => <StatusBadge status={row.gate_type} /> },
                  { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
                  { key: "location_id", header: "Location" },
                ]}
                data={gates}
                keyField="gate_id"
                searchKey="gate_name"
                filterOptions={gateFilterOptions}
              />
            </SectionCard>

            {/* Vehicles */}
            <SectionCard title="Registered Vehicles" icon={Car}>
              <DataTable
                columns={[
                  { key: "vehicle_id", header: "Vehicle ID" },
                  { key: "vehicle_number", header: "Registration" },
                  { key: "brand", header: "Brand" },
                  { key: "model", header: "Model" },
                  { key: "color", header: "Color" },
                  { key: "vehicle_type_id", header: "Type", render: (row) => {
                    const types = { 1: "SUV/Luxury", 2: "Sedan", 3: "SUV/Standard" };
                    return types[row.vehicle_type_id] || row.vehicle_type_id;
                  }},
                  { key: "is_active", header: "Status", render: (row) => (
                    <StatusBadge status={row.is_active ? "ACTIVE" : "INACTIVE"} />
                  )},
                ]}
                data={vehicles}
                keyField="vehicle_id"
                searchKey="vehicle_number"
                filterOptions={vehicleFilterOptions}
              />
            </SectionCard>
          </div>
        )}
      </div>
    </section>
  );
}