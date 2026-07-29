import { useMemo } from "react";
import { Users, Loader2, AlertCircle } from "lucide-react";
import { SectionCard } from "../SectionCard";
import { DataTable } from "../DataTable";

export const UsersTab = ({
  userParkingFrequency,
  usersData,
  loading,
  error,
  usersLoading,
  usersError,
  userFilterOptions,
}) => {
  return (
    <div className="space-y-6">
      {/* User Parking Frequency */}
      <SectionCard title="User Parking Frequency" icon={Users}>
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-(--app-violet)" />
            <span className="ml-3 text-slate-600">
              Loading user parking frequency...
            </span>
          </div>
        )}
        {error && !loading && (
          <div className="text-center py-8 text-rose-600">
            <AlertCircle className="h-6 w-6 mx-auto mb-2" />
            <p>{error}</p>
            <p className="text-sm text-slate-500 mt-1">Showing fallback data</p>
          </div>
        )}
        <DataTable
          columns={[
            {
              key: "name",
              header: "User",
              render: (row) => (
                <div>
                  <p className="font-medium text-slate-900">{row.name}</p>
                  <p className="text-xs text-slate-500">{row.email}</p>
                </div>
              ),
            },
            { key: "phone", header: "Phone" },
            {
              key: "total_sessions",
              header: "Total Sessions",
              align: "center",
            },
            {
              key: "total_duration_minutes",
              header: "Total Duration",
              align: "right",
              render: (row) => `${row.total_duration_minutes} min`,
            },
            {
              key: "total_spent",
              header: "Total Spent",
              align: "right",
              render: (row) =>
                row.total_spent != null
                  ? `₹${row.total_spent.toLocaleString()}`
                  : "—",
            },
            {
              key: "last_parked",
              header: "Last Parked",
              render: (row) =>
                row.last_parked
                  ? new Date(row.last_parked).toLocaleString()
                  : "—",
            },
          ]}
          data={userParkingFrequency}
          keyField="user_id"
          searchKey="name"
          filterOptions={userFilterOptions}
        />
      </SectionCard>

      {/* User Details Table */}
      <SectionCard title="All Users Detail" icon={Users}>
        {usersLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-(--app-violet)" />
            <span className="ml-3 text-slate-600">Loading users...</span>
          </div>
        )}
        {usersError && !usersLoading && (
          <div className="text-center py-8 text-rose-600">
            <AlertCircle className="h-6 w-6 mx-auto mb-2" />
            <p>{usersError}</p>
            <p className="text-sm text-slate-500 mt-1">Showing fallback data</p>
          </div>
        )}
        <DataTable
          columns={[
            { key: "user_id", header: "User ID" },
            { key: "name", header: "Name" },
            { key: "email", header: "Email" },
            { key: "phone", header: "Phone" },
            {
              key: "created_at",
              header: "Joined",
              render: (row) =>
                new Date(row.created_at).toLocaleDateString(),
            },
          ]}
          data={usersData}
          keyField="user_id"
          searchKey="name"
        />
      </SectionCard>
    </div>
  );
};