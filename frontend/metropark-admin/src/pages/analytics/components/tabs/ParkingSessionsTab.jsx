import { Calendar, Loader2, AlertCircle } from "lucide-react";
import { SectionCard } from "../SectionCard";
import { ParkingSessionsGrid } from "../ParkingSessionCard";

export const ParkingSessionsTab = ({
  parkingSessionsData,
  usersData,
  vehiclesData,
  locationsData,
  gatesData,
  paymentsData,
  parkingSessionsLoading,
  parkingSessionsError,
}) => {
  return (
    <div className="">
      <SectionCard title="All Parking Sessions" icon={Calendar}>
        <ParkingSessionsGrid
          sessions={parkingSessionsData}
          usersData={usersData}
          vehiclesData={vehiclesData}
          locationsData={locationsData}
          gatesData={gatesData}
          paymentsData={paymentsData}
          loading={parkingSessionsLoading}
          error={parkingSessionsError}
          emptyMessage="No parking sessions found"
          onSessionClick={(session) => console.log("Session clicked:", session)}
          searchKey="session_id"
          filterOptions={{
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
                { value: "PENDING", label: "Pending" },
                { value: "PAID", label: "Paid" },
                { value: "REFUNDED", label: "Refunded" },
                { value: "FAILED", label: "Failed" },
              ],
            },
          }}
        />
      </SectionCard>
    </div>
  );
};
