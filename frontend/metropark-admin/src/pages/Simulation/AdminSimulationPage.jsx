import { AdminSimulation } from "./AdminSimulation";
import { PageHeader } from "../../components/ui/PageHeader";
import { AdminDataProvider } from "../../context/AdminDataContext";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </section>
    </AdminDataProvider>
  );
}