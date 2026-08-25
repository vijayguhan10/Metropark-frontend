import { Activity, AlertTriangle, ArrowRightLeft, BarChart3, Database } from "lucide-react";
import { LiveMonitorPage } from "../pages/live-monitor/LiveMonitorPage";
import { AnalyticsPage } from "../pages/analytics/AnalyticsPage";
import { AlertsPage } from "../pages/alerts/AlertsPage";
import { SimulationPage } from "../pages/Simulation/Simulation";
import { AdminSimulationPage } from "../pages/Simulation/AdminSimulationPage";
import { VehicleFlowPage } from "../pages/vehicle-flow/VehicleFlowPage";

export const routes = [
  {
    path: "/",
    label: "Live Monitor",
    icon: Activity,
    component: LiveMonitorPage,
  },
  {
    path: "/analytics",
    label: "Analytics",
    icon: BarChart3,
    component: AnalyticsPage,
  },
  {
    path: "/entry-exit-monitor",
    label: "Entry / Exit Monitor",
    icon: ArrowRightLeft,
    component: VehicleFlowPage,
  },
  {
    path: "/alerts",
    label: "System Alerts",
    icon: AlertTriangle,
    component: AlertsPage,
  },
  {
    path: "/simulation/admin",
    label: "Admin Data Simulator",
    icon: Database,
    component: AdminSimulationPage,
  },
  
 
];

export const routeMap = Object.fromEntries(
  routes.map((route) => [route.path, route]),
);
