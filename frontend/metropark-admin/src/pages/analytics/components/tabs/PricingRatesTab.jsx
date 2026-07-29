import { Tag, Loader2, AlertCircle } from "lucide-react";
import { SectionCard } from "../SectionCard";
import { DataTable } from "../DataTable";
import { StatusBadge } from "../StatusBadge";

export const PricingRatesTab = ({
  pricingRatesData,
  locationsData,
  loading,
  pricingRatesError,
  pricingRatesFilterOptions,
  getLocationName,
  getVehicleTypeName,
}) => {
  return (
    <div className="space-y-6">
      <SectionCard title="Pricing Rates" icon={Tag}>
        {/* Assuming 'loading' is your global loading state from fetchAllData. 
          Change to 'pricingRatesLoading' if you track it separately. */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--app-violet,#8b5cf6)]" />
            <span className="ml-3 text-slate-600">
              Loading pricing rates...
            </span>
          </div>
        )}

        {pricingRatesError && !loading && (
          <div className="text-center py-8 text-rose-600">
            <AlertCircle className="h-6 w-6 mx-auto mb-2" />
            <p>{pricingRatesError}</p>
          </div>
        )}

        {!loading && !pricingRatesError && (
          <DataTable
            columns={[
              {
                key: "rate_id",
                header: "Rate ID",
                render: (row) => row.rate_id ?? row.rateId,
              },
              {
                key: "location_id",
                header: "Location",
                render: (row) => {
                  const locId = row.location_id ?? row.locationId;
                  // Safely call getLocationName if it exists, otherwise show ID
                  return typeof getLocationName === "function"
                    ? getLocationName(locId)
                    : locId;
                },
              },
              {
                key: "vehicle_type",
                header: "Vehicle Type",
                render: (row) => {
                  const vType =
                    row.vehicle_type ?? row.vehicleType ?? row.vehicleTypeId;
                  // Safely call getVehicleTypeName if it exists, otherwise show raw type/ID
                  return typeof getVehicleTypeName === "function"
                    ? getVehicleTypeName(vType)
                    : String(vType).replace(/_/g, " ");
                },
              },
              {
                key: "base_rate",
                header: "Base Rate",
                align: "right",
                render: (row) => {
                  const rate = row.base_rate ?? row.baseRate;
                  const currency = row.currency || "INR";
                  return rate != null
                    ? `${currency} ${Number(rate).toLocaleString()}`
                    : "—";
                },
              },
              {
                key: "effective_from",
                header: "Effective From",
                render: (row) => {
                  const date = row.effective_from ?? row.effectiveFrom;
                  return date ? new Date(date).toLocaleDateString() : "—";
                },
              },
              {
                key: "effective_to",
                header: "Effective To",
                render: (row) => {
                  const date = row.effective_to ?? row.effectiveTo;
                  return date ? new Date(date).toLocaleDateString() : "—";
                },
              },
              {
                key: "is_active",
                header: "Status",
                align: "center",
                render: (row) => {
                  const isActive = row.is_active ?? row.isActive;
                  return (
                    <StatusBadge status={isActive ? "ACTIVE" : "INACTIVE"} />
                  );
                },
              },
              {
                key: "created_at",
                header: "Created At",
                render: (row) => {
                  const date = row.created_at ?? row.createdAt;
                  return date ? new Date(date).toLocaleString() : "—";
                },
              },
            ]}
            data={pricingRatesData || []}
            // Using a function or checking both cases for the primary key
            keyField={(row) => row.rate_id ?? row.rateId}
            searchKey="locationId" // or "location_id" depending on how your DataTable handles search
            filterOptions={pricingRatesFilterOptions}
          />
        )}
      </SectionCard>
    </div>
  );
};
