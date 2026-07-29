import { useState, useMemo, useEffect, useCallback } from "react";
import { PageHeader } from "../../components/ui/PageHeader";
import { analyticsApiService } from "../../services/analyticsApi";
import {
  Users,
  Car,
  CreditCard,
  Clock,
  DollarSign,
  BarChart2,
  MapPin,
  Calendar,
  Tag,
} from "lucide-react";
import { StatCardWithIcon } from "./components/StatCardWithIcon";
import { DataTable } from "./components/DataTable";
import { SectionCard } from "./components/SectionCard";
import { StatusBadge } from "./components/StatusBadge";
import { OverviewTab } from "./components/tabs/OverviewTab";
import { UsersTab } from "./components/tabs/UsersTab";
import { PaymentsTab } from "./components/tabs/PaymentsTab";
import { OperationsTab } from "./components/tabs/OperationsTab";
import { ParkingSessionsTab } from "./components/tabs/ParkingSessionsTab";
import { PricingRatesTab } from "./components/tabs/PricingRatesTab";
// import { ParkingSessionsGrid } from "../../components/analytics/ParkingSessionCard";

export function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [userParkingFrequency, setUserParkingFrequency] = useState([]);
  const [userParkingSessions, setUserParkingSessions] = useState([]);
  const [parkingSessionsData, setParkingSessionsData] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [gatesData, setGatesData] = useState([]);
  const [vehiclesData, setVehiclesData] = useState([]);
  const [locationsData, setLocationsData] = useState([]);
  const [paymentsData, setPaymentsData] = useState([]);
  const [paymentMethodsData, setPaymentMethodsData] = useState([]);
  const [pricingRatesData, setPricingRatesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [gatesLoading, setGatesLoading] = useState(false);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [pricingRatesLoading, setPricingRatesLoading] = useState(false);
  const [parkingSessionsLoading, setParkingSessionsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [usersError, setUsersError] = useState(null);
  const [gatesError, setGatesError] = useState(null);
  const [vehiclesError, setVehiclesError] = useState(null);
  const [locationsError, setLocationsError] = useState(null);
  const [pricingRatesError, setPricingRatesError] = useState(null);
  const [sessionsError, setSessionsError] = useState(null);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [parkingSessionsError, setParkingSessionsError] = useState(null);

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart2 },
    { id: "users", label: "Users & Sessions", icon: Users },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "operations", label: "Operations", icon: Car },
    { id: "parking-sessions", label: "Parking Sessions", icon: Calendar },
    { id: "pricing-rates", label: "Pricing Rates", icon: Tag },
  ];

  // Helper to get location name from locationId
  const getLocationName = useCallback(
    (locationId) => {
      const location = locationsData.find(
        (loc) => loc.location_id === locationId,
      );
      return location ? location.location_name : locationId;
    },
    [locationsData],
  );

  // Helper to get vehicle type name from vehicleTypeId
  const getVehicleTypeName = useCallback((vehicleTypeId) => {
    const types = { 1: "Car", 2: "Bike", 3: "Delivery", 4: "Truck" };
    return types[vehicleTypeId] || `Type ${vehicleTypeId}`;
  }, []);

  // Fetch all data from API
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [
        gatesRes,
        vehiclesRes,
        locationsRes,
        paymentsRes,
        paymentMethodsRes,
        pricingRatesRes,
        userParkingFreqRes,
        userParkingSessionsRes,
        usersRes,
        parkingSessionsRes,
      ] = await Promise.allSettled([
        analyticsApiService.getGates(),
        analyticsApiService.getVehicles(),
        analyticsApiService.getLocations(),
        analyticsApiService.getPayments(),
        analyticsApiService.getPaymentMethods(),
        analyticsApiService.getPricingRates(),
        analyticsApiService.getUserParkingFrequency(),
        analyticsApiService.getUserParkingFrequencySessions(),
        analyticsApiService.getUsers(),
        analyticsApiService.getParkingSessions(),
      ]);

      // Helper to safely extract arrays whether they are wrapped in `.data` or not
      const extractData = (res) => res.value?.data ?? res.value;

      if (gatesRes.status === "fulfilled") setGatesData(extractData(gatesRes));
      else setGatesError(gatesRes.reason?.message || "Failed to load gates");

      if (vehiclesRes.status === "fulfilled")
        setVehiclesData(extractData(vehiclesRes));
      else
        setVehiclesError(
          vehiclesRes.reason?.message || "Failed to load vehicles",
        );

      if (locationsRes.status === "fulfilled")
        setLocationsData(extractData(locationsRes));
      else
        setLocationsError(
          locationsRes.reason?.message || "Failed to load locations",
        );

      if (paymentsRes.status === "fulfilled")
        setPaymentsData(extractData(paymentsRes));
      else
        setPaymentsError(
          paymentsRes.reason?.message || "Failed to load payments",
        );

      if (paymentMethodsRes.status === "fulfilled")
        setPaymentMethodsData(extractData(paymentMethodsRes));
      else
        setPaymentMethodsError(
          paymentMethodsRes.reason?.message || "Failed to load payment methods",
        );

      if (pricingRatesRes.status === "fulfilled")
        setPricingRatesData(extractData(pricingRatesRes));
      else
        setPricingRatesError(
          pricingRatesRes.reason?.message || "Failed to load pricing rates",
        );

      if (userParkingFreqRes.status === "fulfilled")
        setUserParkingFrequency(extractData(userParkingFreqRes));
      else
        setError(
          userParkingFreqRes.reason?.message ||
            "Failed to load user parking frequency",
        );

      if (userParkingSessionsRes.status === "fulfilled")
        setUserParkingSessions(extractData(userParkingSessionsRes));
      else
        setSessionsError(
          userParkingSessionsRes.reason?.message ||
            "Failed to load user parking sessions",
        );

      if (usersRes.status === "fulfilled") setUsersData(extractData(usersRes));
      else setUsersError(usersRes.reason?.message || "Failed to load users");

      if (parkingSessionsRes.status === "fulfilled")
        setParkingSessionsData(extractData(parkingSessionsRes));
      else
        setParkingSessionsError(
          parkingSessionsRes.reason?.message ||
            "Failed to load parking sessions",
        );
    } catch (err) {
      console.error("Failed to fetch analytics data:", err);
      setError("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data on mount
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Computed analytics summary from fetched data
  const analyticsSummary = useMemo(() => {
    const userParkingFreqArray = Array.isArray(userParkingFrequency)
      ? userParkingFrequency
      : [];
    const paymentsArray = Array.isArray(paymentsData) ? paymentsData : [];
    const paymentMethodsArray = Array.isArray(paymentMethodsData)
      ? paymentMethodsData
      : [];
    const vehiclesArray = Array.isArray(vehiclesData) ? vehiclesData : [];
    const gatesArray = Array.isArray(gatesData) ? gatesData : [];
    const usersArray = Array.isArray(usersData) ? usersData : [];

    const totalUsers = usersArray.length;
    const totalSessions = userParkingFreqArray.reduce(
      (sum, u) => sum + (u.total_sessions || 0),
      0,
    );
    const activeSessions = userParkingFreqArray.filter(
      (u) =>
        u.last_parked &&
        new Date(u.last_parked) > new Date(Date.now() - 24 * 60 * 60 * 1000),
    ).length;
    const completedSessions = userParkingFreqArray.filter(
      (u) => u.total_sessions > 0,
    ).length;
    const cancelledSessions = 0;
    const totalRevenue = paymentsArray
      .filter(
        (p) =>
          p.payment_status === "COMPLETED" || p.payment_status === "SUCCESS",
      )
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    const pendingRevenue = paymentsArray
      .filter((p) => p.payment_status === "PENDING")
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    const refundedAmount = paymentsArray
      .filter((p) => p.payment_status === "REFUNDED")
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    const averageSessionDuration =
      userParkingFreqArray.length > 0
        ? userParkingFreqArray.reduce(
            (sum, u) => sum + (u.total_duration_minutes || 0),
            0,
          ) / userParkingFreqArray.length
        : 0;
    const totalVehicles = vehiclesArray.filter((v) => v.is_active).length;
    const activeGates = gatesArray.filter((g) => g.status === "ACTIVE").length;

    const paymentMethodDistribution = paymentMethodsArray.map((pm) => ({
      method: pm.method_name,
      count: paymentsArray.filter((p) => p.method_id === pm.method_id).length,
      totalAmount: paymentsArray
        .filter(
          (p) =>
            p.method_id === pm.method_id &&
            (p.payment_status === "COMPLETED" || p.payment_status === "SUCCESS"),
        )
        .reduce((sum, p) => sum + (p.amount || 0), 0),
    }));

    const sessionStatusDistribution = [
      { status: "ACTIVE", count: activeSessions },
      { status: "EXITED", count: completedSessions },
      { status: "CANCELLED", count: cancelledSessions },
    ];

    const paymentStatusDistribution = [
      {
        status: "SUCCESS",
        count: paymentsArray.filter(
          (p) =>
            p.payment_status === "SUCCESS" || p.payment_status === "COMPLETED",
        ).length,
      },
      {
        status: "PENDING",
        count: paymentsArray.filter((p) => p.payment_status === "PENDING")
          .length,
      },
      {
        status: "REFUNDED",
        count: paymentsArray.filter((p) => p.payment_status === "REFUNDED")
          .length,
      },
      {
        status: "FAILED",
        count: paymentsArray.filter((p) => p.payment_status === "FAILED")
          .length,
      },
    ];

    const gateUtilization = gatesArray
      .filter((g) => g.status === "ACTIVE")
      .map((g) => ({
        gate_id: g.gate_id,
        gate_name: g.gate_name,
        gate_type: g.gate_type,
        entry_count: 0,
        exit_count: 0,
      }));

    const vehicleTypeDistribution = [
      {
        type: "Car",
        count: vehiclesArray.filter((v) => v.vehicle_type_id === 1).length,
      },
      {
        type: "Bike",
        count: vehiclesArray.filter((v) => v.vehicle_type_id === 2).length,
      },
      {
        type: "Delivery",
        count: vehiclesArray.filter((v) => v.vehicle_type_id === 3).length,
      },
    ];

    return {
      totalUsers,
      totalSessions,
      activeSessions,
      completedSessions,
      cancelledSessions,
      totalRevenue,
      pendingRevenue,
      refundedAmount,
      averageSessionDuration,
      totalVehicles,
      activeGates,
      paymentMethodDistribution,
      userParkingFrequency: userParkingFreqArray
        .map((u) => ({
          user_id: u.user_id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          total_sessions: u.total_sessions,
          total_duration_minutes: u.total_duration_minutes,
          total_spent: u.total_spent,
          last_parked: u.last_parked,
        }))
        .sort((a, b) => b.total_sessions - a.total_sessions),
      sessionStatusDistribution,
      paymentStatusDistribution,
      gateUtilization,
      vehicleTypeDistribution,
    };
  }, [
    usersData,
    userParkingFrequency,
    paymentsData,
    paymentMethodsData,
    vehiclesData,
    gatesData,
  ]);

  // Filter options for each table
  const sessionFilterOptions = {
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
        { value: "PAID", label: "Paid" },
        { value: "PENDING", label: "Pending" },
        { value: "REFUNDED", label: "Refunded" },
        { value: "FAILED", label: "Failed" },
      ],
    },
  };

  const userFilterOptions = {
    total_sessions: {
      type: "select",
      placeholder: "Sessions",
      options: [
        { value: "1", label: "1 session" },
        { value: "2", label: "2 sessions" },
        { value: "3+", label: "3+ sessions" },
      ],
    },
  };

  const paymentFilterOptions = {
    payment_status: {
      type: "multi",
      placeholder: "Status",
      options: [
        { value: "SUCCESS", label: "Success" },
        { value: "PENDING", label: "Pending" },
        { value: "REFUNDED", label: "Refunded" },
        { value: "FAILED", label: "Failed" },
      ],
    },
    method_id: {
      type: "multi",
      placeholder: "Method",
      options: paymentMethodsData.map((m) => ({
        value: m.method_id,
        label: m.method_name.replace("_", " "),
      })),
    },
  };

  const gateFilterOptions = {
    gate_type: {
      type: "multi",
      placeholder: "Type",
      options: [
        { value: "ENTRY", label: "Entry" },
        { value: "EXIT", label: "Exit" },
        { value: "BOTH", label: "Both" },
      ],
    },
    status: {
      type: "multi",
      placeholder: "Status",
      options: [
        { value: "ACTIVE", label: "Active" },
        { value: "INACTIVE", label: "Inactive" },
      ],
    },
    location_id: {
      type: "multi",
      placeholder: "Location",
      options: locationsData.map((loc) => ({
        value: loc.location_id,
        label: loc.location_name,
      })),
    },
  };

  const vehicleFilterOptions = {
    vehicle_type_id: {
      type: "multi",
      placeholder: "Type",
      options: [
        { value: 1, label: "Car" },
        { value: 2, label: "Bike" },
        { value: 3, label: "Delivery" },
      ],
    },
    is_active: {
      type: "select",
      placeholder: "Status",
      options: [
        { value: "true", label: "Active" },
        { value: "false", label: "Inactive" },
      ],
    },
  };

  const pricingRatesFilterOptions = {
    locationId: {
      type: "multi",
      placeholder: "Location",
      options: locationsData.map((loc) => ({
        value: loc.location_id,
        label: loc.location_name,
      })),
    },
    vehicleTypeId: {
      type: "multi",
      placeholder: "Vehicle Type",
      options: [
        { value: 1, label: "Car" },
        { value: 2, label: "Bike" },
        { value: 3, label: "Delivery" },
        { value: 4, label: "Truck" },
      ],
    },
    currency: {
      type: "multi",
      placeholder: "Currency",
      options: [
        { value: "INR", label: "INR" },
        { value: "USD", label: "USD" },
      ],
    },
  };

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Performance intelligence"
        title="Analytics Dashboard"
        description="Comprehensive insights into parking operations, user behavior, revenue, and system performance."
      />

      {/* Key Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCardWithIcon
          icon={DollarSign}
          label="Total Revenue"
          value={`₹${analyticsSummary.totalRevenue.toLocaleString()}`}
          hint={`${analyticsSummary.completedSessions} completed sessions`}
          tone="emerald"
          trend={{ positive: true, value: "+12.4%", period: "vs last month" }}
        />
        <StatCardWithIcon
          icon={Users}
          label="Active Users"
          value={analyticsSummary.totalUsers}
          hint={`${analyticsSummary.totalVehicles} registered vehicles`}
          tone="cyan"
          trend={{ positive: true, value: "+8.2%", period: "vs last month" }}
        />
        <StatCardWithIcon
          icon={Car}
          label="Active Sessions"
          value={analyticsSummary.activeSessions}
          hint={`${analyticsSummary.totalSessions} total this month`}
          tone="violet"
          trend={{ positive: false, value: "-2.1%", period: "vs last week" }}
        />
        <StatCardWithIcon
          icon={Clock}
          label="Avg. Duration"
          value={`${Math.round(analyticsSummary.averageSessionDuration)} min`}
          hint="per parking session"
          tone="amber"
          trend={{ positive: true, value: "+5 min", period: "vs last month" }}
        />
      </div>

      {/* Tab Navigation */}
      <div className="rounded-2xl border border-slate-200 bg-white p-1">
        <nav className="flex gap-1" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-(--app-violet)/10 text-(--app-violet-strong) shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Panels */}
      <div className="mt-4">
        {activeTab === "overview" && (
          <OverviewTab
            analyticsSummary={analyticsSummary}
            userParkingSessions={userParkingSessions}
            usersData={usersData}
            vehiclesData={vehiclesData}
            paymentsData={paymentsData}
            sessionsLoading={sessionsLoading}
            sessionsError={sessionsError}
            sessionFilterOptions={sessionFilterOptions}
          />
        )}

        {activeTab === "users" && (
          <UsersTab
            userParkingFrequency={userParkingFrequency}
            usersData={usersData}
            loading={loading}
            error={error}
            usersLoading={usersLoading}
            usersError={usersError}
            userFilterOptions={userFilterOptions}
          />
        )}

        {activeTab === "payments" && (
          <PaymentsTab
            analyticsSummary={analyticsSummary}
            paymentsData={paymentsData}
            paymentMethodsData={paymentMethodsData}
            paymentFilterOptions={paymentFilterOptions}
          />
        )}

        {activeTab === "operations" && (
          <OperationsTab
            analyticsSummary={analyticsSummary}
            gatesData={gatesData}
            vehiclesData={vehiclesData}
            locationsData={locationsData}
            usersData={usersData}
            gateFilterOptions={gateFilterOptions}
            vehicleFilterOptions={vehicleFilterOptions}
            getLocationName={getLocationName}
          />
        )}

        {activeTab === "parking-sessions" && (
          <ParkingSessionsTab
            parkingSessionsData={parkingSessionsData}
            usersData={usersData}
            vehiclesData={vehiclesData}
            locationsData={locationsData}
            gatesData={gatesData}
            paymentsData={paymentsData}
            parkingSessionsLoading={parkingSessionsLoading}
            parkingSessionsError={parkingSessionsError}
          />
        )}

        {activeTab === "pricing-rates" && (
          <PricingRatesTab
            pricingRatesData={pricingRatesData}
            locationsData={locationsData}
            loading={loading}
            pricingRatesError={pricingRatesError}
            pricingRatesFilterOptions={pricingRatesFilterOptions}
            getLocationName={getLocationName}
            getVehicleTypeName={getVehicleTypeName}
          />
        )}
      </div>
    </section>
  );
}