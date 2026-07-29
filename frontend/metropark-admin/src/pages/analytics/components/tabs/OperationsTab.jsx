import { MapPin, Car, Loader2, AlertCircle } from "lucide-react";
import { SectionCard } from "../SectionCard";
import { DataTable } from "../DataTable";
import { StatusBadge } from "../StatusBadge";

export const OperationsTab = ({
  analyticsSummary,
  gatesData,
  vehiclesData,
  locationsData,
  usersData,
  gateFilterOptions,
  vehicleFilterOptions,
  getLocationName,
}) => {
  return (
    <div className="space-y-6">
      {/* Gate Utilization */}
      <SectionCard title="Gate Utilization" icon={MapPin}>
        <DataTable
          columns={[
            { key: "gate_name", header: "Gate" },
            {
              key: "gate_type",
              header: "Type",
              render: (row) => <StatusBadge status={row.gate_type} />,
            },
            { key: "entry_count", header: "Entries", align: "center" },
            { key: "exit_count", header: "Exits", align: "center" },
            {
              key: "total_count",
              header: "Total",
              align: "center",
              render: (row) => row.entry_count + row.exit_count,
            },
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
            {
              key: "gate_type",
              header: "Type",
              render: (row) => <StatusBadge status={row.gate_type} />,
            },
            {
              key: "status",
              header: "Status",
              render: (row) => <StatusBadge status={row.status} />,
            },
            {
              key: "location_id",
              header: "Location",
              render: (row) => getLocationName(row.location_id),
            },
          ]}
          data={gatesData}
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
            {
              key: "user_id",
              header: "User ID",
              render: (row) => {
                const user = usersData.find((u) => u.user_id === row.user_id);
                return user
                  ? `${user.name} (${user.user_id})`
                  : row.user_id;
              },
            },
            { key: "user_name", header: "User Name" },
            { key: "brand", header: "Brand" },
            { key: "model", header: "Model" },
            { key: "color", header: "Color" },
            {
              key: "vehicle_type_id",
              header: "Type ID",
              align: "center",
            },
            {
              key: "vehicle_type_name",
              header: "Type Name",
            },
            {
              key: "is_active",
              header: "Status",
              render: (row) => (
                <StatusBadge
                  status={row.is_active ? "ACTIVE" : "INACTIVE"}
                />
              ),
            },
            {
              key: "created_at",
              header: "Created At",
              render: (row) =>
                row.created_at
                  ? new Date(row.created_at).toLocaleString()
                  : "—",
            },
            {
              key: "updated_at",
              header: "Updated At",
              render: (row) =>
                row.updated_at
                  ? new Date(row.updated_at).toLocaleString()
                  : "—",
            },
          ]}
          data={vehiclesData}
          keyField="vehicle_id"
          searchKey="vehicle_number"
          filterOptions={vehicleFilterOptions}
        />
      </SectionCard>
      
      <SectionCard title="Locations" icon={MapPin}>
        <DataTable
          columns={[
            { key: "location_id", header: "Location ID" },
            { key: "location_name", header: "Name" },
            { key: "city", header: "City" },
            {
              key: "type_id",
              header: "Location Type",
              render: (row) => {
                const types = { 1: "Standard", 2: "Premium", 3: "Hub" };
                return types[row.type_id] || `Type ${row.type_id}`;
              },
            },
            {
              key: "status",
              header: "Status",
              render: (row) => <StatusBadge status={row.status} />,
            },
          ]}
          data={locationsData}
          keyField="location_id"
          searchKey="location_name"
        />
      </SectionCard>
    </div>
  );
};