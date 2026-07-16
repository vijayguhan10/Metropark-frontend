import { ClientSimulation } from "./ClientSimulation";
import { PageHeader } from "../../components/ui/PageHeader";
import { AdminDataProvider } from "../../context/AdminDataContext";
import { Users, Zap, Database, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";

export function SimulationPage() {
  return (
    <AdminDataProvider>
      <section className="space-y-6">
        <PageHeader
          eyebrow="Client operations simulation"
          title="Client Data Simulator"
          description="Generate realistic client-side data: users, vehicles, parking sessions, payments, and reservations. Depends on admin infrastructure data."
        />
        <ClientSimulation />
      </section>
    </AdminDataProvider>
  );
}
