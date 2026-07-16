import { Activity, AlertTriangle, BarChart3, Settings2, Database, Users } from "lucide-react";
import { LiveMonitorPage } from "../pages/live-monitor/LiveMonitorPage";
import { AnalyticsPage } from "../pages/analytics/AnalyticsPage";
import { AlertsPage } from "../pages/alerts/AlertsPage";
import { SimulationPage } from "../pages/Simulation/Simulation";
import { AdminSimulationPage } from "../pages/Simulation/AdminSimulationPage";

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
  {
    path: "/simulation/client",
    label: "Client Data Simulator",
    icon: Users,
    component: SimulationPage,
  },
];

export const routeMap = Object.fromEntries(
  routes.map((route) => [route.path, route]),
);
