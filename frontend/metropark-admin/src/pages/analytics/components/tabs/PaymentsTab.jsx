import { CreditCard, Loader2, AlertCircle } from "lucide-react";
import { SectionCard } from "../SectionCard";
import { DataTable } from "../DataTable";
import { StatusBadge } from "../StatusBadge";

export const PaymentsTab = ({
  analyticsSummary,
  paymentsData,
  paymentMethodsData,
  paymentFilterOptions,
}) => {
  return (
    <div className="space-y-6">
      {/* Payment Method Distribution Cards */}
      <SectionCard title="Payment Method Distribution" icon={CreditCard}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {analyticsSummary.paymentMethodDistribution.map((item) => (
            <div
              key={item.method}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                {item.method?.replace(/_/g, " ") || "Unknown"}
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {item.count}
              </p>
              <p className="mt-1 text-sm text-slate-600">Transactions</p>
              <p className="mt-1 text-sm font-medium text-emerald-600">
                ₹{item.totalAmount?.toLocaleString() || "0"} collected
              </p>
              <div className="mt-4 h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[var(--app-violet,#8b5cf6)]"
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
          ))}
        </div>
      </SectionCard>

      {/* All Payments Table */}
      <SectionCard title="All Payments" icon={CreditCard}>
        <DataTable
          columns={[
            { key: "payment_id", header: "Payment ID" },
            { key: "transaction_reference", header: "Transaction Ref" },
            { key: "session_id", header: "Session ID" },
            {
              key: "method_id",
              header: "Method",
              render: (row) => {
                const method = paymentMethodsData.find(
                  (m) => m.method_id === row.method_id,
                );
                return method
                  ? method.method_name.replace(/_/g, " ")
                  : row.method_id;
              },
            },
            {
              key: "amount",
              header: "Amount",
              align: "right",
              render: (row) =>
                row.amount ? `₹${row.amount.toLocaleString()}` : "—",
            },
            {
              key: "payment_status",
              header: "Status",
              render: (row) => <StatusBadge status={row.payment_status} />,
            },
            {
              key: "processed_at",
              header: "Processed",
              render: (row) =>
                row.processed_at
                  ? new Date(row.processed_at).toLocaleString()
                  : "—",
            },
          ]}
          data={paymentsData}
          keyField="payment_id"
          searchKey="transaction_reference"
          filterOptions={{
            payment_status: {
              type: "multi",
              placeholder: "Status",
              options: [
                { value: "SUCCESS", label: "Success" },
                { value: "COMPLETED", label: "Completed" },
                { value: "PENDING", label: "Pending" },
                { value: "REFUNDED", label: "Refunded" },
              ],
            },
          }}
        />
      </SectionCard>
    </div>
  );
};