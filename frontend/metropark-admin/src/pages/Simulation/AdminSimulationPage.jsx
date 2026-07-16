import { AdminSimulation } from "./AdminSimulation";
import { PageHeader } from "../../components/ui/PageHeader";
import { AdminDataProvider } from "../../context/AdminDataContext";
import { Database, Zap, RefreshCw, Download } from "lucide-react";

export function AdminSimulationPage() {
  return (
    <AdminDataProvider>
      <section className="space-y-6">
        <PageHeader
          eyebrow="Infrastructure provisioning"
          title="Admin Data Simulator"
          description="Generate foundational admin data: locations, gates, vehicle types, pricing rules, and payment methods. This data serves as the backbone for client simulations."
        />
        <AdminSimulation />
      </section>
    </AdminDataProvider>
  );
}