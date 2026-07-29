import { useMemo } from "react";
import { MapPin, BarChart2, CreditCard, Car, Clock } from "lucide-react";
import { SectionCard } from "../SectionCard";
import { DataTable } from "../DataTable";
import { StatusBadge } from "../StatusBadge";

export const OverviewTab = ({
  analyticsSummary,
  userParkingSessions,
  usersData,
  vehiclesData,
  paymentsData,
  sessionsLoading,
  sessionsError,
  sessionFilterOptions,
}) => {
  const zoneData = useMemo(() => [
    { zone: "A-01", occupancy: 85, traffic: "Stable" },
    { zone: "B-04", occupancy: 42, traffic: "Light" },
    { zone: "C-02", occupancy: 94, traffic: "High" },
    { zone: "D-09", occupancy: 68, traffic: "Rising" },
  ], []);

  return (
    <div className="space-y-6">
      {/* Zone Occupancy & Session Status */}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <SectionCard title="Zone Occupancy Matrix" icon={MapPin}>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {zoneData.map((zone) => (
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
                    <span className="font-medium text-slate-700">
                      {item.status}
                    </span>
                    <span className="text-slate-500">{item.count}</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-slate-200">
                    <div
                      className="h-1.5 rounded-full bg-(--app-violet)"
                      style={{
                        width: `${
                          analyticsSummary.totalSessions > 0
                            ? (item.count / analyticsSummary.totalSessions) * 100
                            : 0
                        }%`,
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
                    <span className="font-medium text-slate-700">
                      {item.status}
                    </span>
                    <span className="text-slate-500">{item.count}</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-slate-200">
                    <div
                      className="h-1.5 rounded-full bg-emerald-500"
                      style={{
                        width: `${
                          paymentsData.length > 0
                            ? (item.count / paymentsData.length) * 100
                            : 0
                        }%`,
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
                    <span className="font-medium text-slate-700">
                      {item.type}
                    </span>
                    <span className="text-slate-500">{item.count}</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-slate-200">
                    <div
                      className="h-1.5 rounded-full bg-cyan-500"
                      style={{
                        width: `${
                          analyticsSummary.totalVehicles > 0
                            ? (item.count / analyticsSummary.totalVehicles) * 100
                            : 0
                        }%`,
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
        {sessionsLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin text-(--app-violet) border-4 border-t-transparent rounded-full" />
            <span className="ml-3 text-slate-600">Loading parking sessions...</span>
          </div>
        )}
        {sessionsError && !sessionsLoading && (
          <div className="text-center py-8 text-rose-600">
            <div className="h-6 w-6 mx-auto mb-2 text-current" />
            <p>{sessionsError}</p>
            <p className="text-sm text-slate-500 mt-1">Showing fallback data</p>
          </div>
        )}
        <DataTable
          columns={[
            { key: "session_id", header: "Session ID" },
            {
              key: "user_id",
              header: "User",
              render: (row) => {
                const user = usersData.find((u) => u.user_id === row.user_id);
                return user
                  ? `${user.name} (${user.user_id})`
                  : row.user_id;
              },
            },
            {
              key: "vehicle_id",
              header: "Vehicle",
              render: (row) => {
                const vehicle = vehiclesData.find(
                  (v) => v.vehicle_id === row.vehicle_id,
                );
                return vehicle
                  ? `${vehicle.brand} ${vehicle.model} (${vehicle.vehicle_number})`
                  : row.vehicle_id;
              },
            },
            {
              key: "session_status",
              header: "Status",
              render: (row) => <StatusBadge status={row.session_status} />,
            },
            {
              key: "duration_minutes",
              header: "Duration",
              align: "right",
              render: (row) =>
                row.duration_minutes ? `${row.duration_minutes} min` : "—",
            },
            {
              key: "payment_status",
              header: "Payment",
              render: (row) => <StatusBadge status={row.payment_status} />,
            },
            {
              key: "actual_entry_time",
              header: "Entry Time",
              render: (row) =>
                row.actual_entry_time
                  ? new Date(row.actual_entry_time).toLocaleString()
                  : "—",
            },
          ]}
          data={userParkingSessions}
          keyField="session_id"
          searchKey="session_id"
          filterOptions={sessionFilterOptions}
        />
      </SectionCard>
    </div>
  );
};