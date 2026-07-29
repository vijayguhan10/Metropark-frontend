import React, { useState, useCallback } from "react";
import { PageHeader } from "../../components/ui/PageHeader";
import {
  Building2,
  MapPin,
  Settings,
  Loader2,
  RefreshCw,
  Zap,
  LayoutGrid,
  UploadCloud,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Code,
  Database,
  Eye,
  XCircle,
  Save,
  Trash2,
  Plus,
  Edit2,
  AlertCircle,
} from "lucide-react";
import { useAdminData } from "../../context/AdminDataContext";
import {
  generateMasterData,
  generateLocations,
  generateGates,
  generateParkingSlots,
  generatePricingRates,
  generateAllMockData,
  getAllPayloads,
} from "../../data/AdminSimulation";
import { apiService, postAllModules } from "../../services/api";
import { toast } from "react-toastify";
import EditableDataTable from "../../components/ui/EditableDataTable";

// --- UI Components (moved outside to prevent re-creation on render) ---

const StatusBadge = ({ status }) => {
  const styles = {
    ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    GENERATED: "bg-blue-50 text-blue-700 border-blue-200",
    POSTED: "bg-violet-50 text-violet-700 border-violet-200",
  };
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase border ${styles[status] || "bg-slate-50 text-slate-700 border-slate-200"}`}
    >
      {status}
    </span>
  );
};

const InputField = React.memo(({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled,
  className = "",
}) => (
  <label className={`space-y-1.5 block ${className}`}>
    <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
      {label}
    </span>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-500 focus:bg-white focus:ring-2 focus:ring-(--app-violet)/20 focus:border-(--app-violet) shadow-sm"
    />
  </label>
));

const SelectField = React.memo(({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  className = "",
}) => (
  <label className={`space-y-1.5 block ${className}`}>
    <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
      {label}
    </span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-sm text-slate-900 outline-none transition-all disabled:bg-slate-50 focus:bg-white focus:ring-2 focus:ring-(--app-violet)/20 focus:border-(--app-violet) shadow-sm"
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </label>
));

const DataViewer = ({ data, isExpanded, onToggle, title = "Data Payload" }) => {
  if (!data || data.length === 0) return null;
  return (
    <div className="mt-6 pt-5 border-t border-slate-100">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
      >
        <Code size={16} />
        {isExpanded
          ? "Hide Data Payload"
          : `View Data Payload (${data.length} records)`}
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isExpanded && (
        <div className="mt-4 rounded-2xl bg-slate-950 p-4 overflow-hidden shadow-inner">
          <div className="overflow-y-auto max-h-60 custom-scrollbar">
            <pre className="text-[11px] leading-relaxed text-slate-300 font-mono">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

const PayloadModal = ({ isOpen, onClose, title, data, onCopy }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-4xl max-h-[80vh] rounded-3xl bg-white shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCopy}
              className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
            >
              Copy JSON
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
            >
              <XCircle size={20} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4 bg-slate-950">
          <pre className="text-[11px] leading-relaxed text-slate-300 font-mono max-h-[60vh] overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

// Loading state component for master data
const MasterDataLoading = () => (
  <div className="flex items-center justify-center p-8">
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-(--app-violet)" />
      <p className="text-sm text-slate-600">Loading master data from backend...</p>
    </div>
  </div>
);

const MasterDataError = ({ error, onRetry }) => (
  <div className="flex items-center justify-center p-8">
    <div className="flex flex-col items-center gap-3 text-center">
      <AlertCircle className="h-8 w-8 text-rose-500" />
      <p className="text-sm text-slate-600">Failed to load master data</p>
      <p className="text-xs text-slate-500 max-w-xs">{error}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 text-sm font-medium text-white bg-(--app-violet) rounded-lg hover:bg-(--app-violet-strong) transition"
      >
        Retry
      </button>
    </div>
  </div>
);

// --- Main Page Component ---

export function AdminSimulation() {
  const { 
    adminData, 
    updateAdminData, 
    replaceAdminData, 
    clearAllAdminData,
    masterData,
    masterDataLoading,
    masterDataError,
    fetchMasterData,
  } = useAdminData();

  // App States
  const [generating, setGenerating] = useState({});
  const [posting, setPosting] = useState({});
  const [posted, setPosted] = useState({});
  const [expandedView, setExpandedView] = useState({});
  const [payloadModal, setPayloadModal] = useState({ open: false, title: "", data: null });

  // Form States
  const [locationForm, setLocationForm] = useState({
    locationId: "LOC-HUB-01",
    typeId: 1,
    locationName: "Central Hub Parking",
    city: "CityCenter",
    status: "ACTIVE",
  });
  const [slotForm, setSlotForm] = useState({ locationId: "", vehicleTypeId: "", reservationClassId: "" });
  const [gateForm, setGateForm] = useState({ locationId: "" });
  const [pricingForm, setPricingForm] = useState({ locationId: "", vehicleTypeId: "", reservationClassId: "" });

  // Helpers
  const isDataPresent = (key) => adminData[key]?.length > 0;

  const getStatus = (key) => {
    if (posted[key]) return "POSTED";
    if (isDataPresent(key)) return "GENERATED";
    return "PENDING";
  };

  // Show toast helper
  const showToast = (type, message) => {
    toast[type](message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  // Build dropdown options from fetched master data
  const locationOptions = masterData.locations.map((loc) => ({
    value: loc.locationId,
    label: `${loc.locationName} (${loc.locationId})`,
  }));

  const vehicleTypeOptions = masterData.vehicleTypes.map((vt) => ({
    value: vt.vehicleTypeId,
    label: `${vt.typeDisplayName} (${vt.vehicleTypeId})`,
  }));

  const reservationClassOptions = masterData.reservationClasses.map((rc) => ({
    value: rc.classId,
    label: `${rc.className} (${rc.classId})`,
  }));

  // Check if master data is available for parking slots generation
  const canGenerateSlots = masterData.locations.length > 0 && 
                           masterData.vehicleTypes.length > 0 && 
                           masterData.reservationClasses.length > 0;

  // Execution Wrapper
  const runSimulation = async (moduleKeys, generatorFn, successMessage) => {
    const keys = Array.isArray(moduleKeys) ? moduleKeys : [moduleKeys];

    // UI State Prep
    setGenerating((prev) =>
      keys.reduce((acc, k) => ({ ...acc, [k]: true }), prev),
    );
    setPosted((prev) =>
      keys.reduce((acc, k) => ({ ...acc, [k]: false }), prev),
    );

    await new Promise((resolve) => setTimeout(resolve, 600)); // Simulating processing delay

    try {
      const generatedData = generatorFn();

      // Batch updates - use replaceAdminData to avoid duplicates
      Object.entries(generatedData).forEach(([key, data]) => {
        replaceAdminData(key, data);
        setExpandedView((prev) => ({ ...prev, [key]: true }));
      });

      if (successMessage) {
        showToast("success", successMessage);
      }
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setGenerating((prev) =>
        keys.reduce((acc, k) => ({ ...acc, [k]: false }), prev),
      );
    }
  };

  // Logic: Post to DB (Real API Call)
  const postModule = async (module) => {
    setPosting((prev) => ({ ...prev, [module]: true }));
    
    try {
      const data = adminData[module];
      if (!data || data.length === 0) {
        throw new Error(`No data to post for ${module}`);
      }

      let response;
      switch (module) {
        case "locationTypes":
          for (const item of data) {
            response = await apiService.locationTypes.create(item);
          }
          break;
        case "vehicleTypes":
          for (const item of data) {
            response = await apiService.vehicleTypes.create(item);
          }
          break;
        case "reservationClasses":
          for (const item of data) {
            response = await apiService.reservationClasses.create(item);
          }
          break;
        case "paymentMethods":
          for (const item of data) {
            response = await apiService.paymentMethods.create(item);
          }
          break;
        case "locations":
          for (const item of data) {
            response = await apiService.locations.create(item);
          }
          break;
        case "gates":
          for (const item of data) {
            response = await apiService.gates.create(item);
          }
          break;
        case "parkingSlots":
          // Backend expects an array of parking slots
          response = await apiService.parkingSlots.create(data);
          break;
        case "pricingRates":
          // Backend expects locationId and vehicleTypeId from master data (backend-generated IDs)
          // Map client-side IDs to backend IDs using masterData
          for (const item of data) {
            let payload = { ...item };
            // Map locationId using masterData.locations (match by client locationId)
            if (item.locationId) {
              const matchedLocation = masterData.locations.find(loc => loc.locationId === item.locationId);
              if (matchedLocation) {
                payload.locationId = matchedLocation.locationId;
              }
            }
            // Map vehicleTypeId using masterData.vehicleTypes (match by client vehicleTypeId)
            if (item.vehicleTypeId) {
              const matchedVehicleType = masterData.vehicleTypes.find(vt => vt.vehicleTypeId === item.vehicleTypeId);
              if (matchedVehicleType) {
                payload.vehicleTypeId = matchedVehicleType.vehicleTypeId;
              }
            }
            // Don't send rateId - backend generates it
            delete payload.rateId;
            response = await apiService.pricingRates.create(payload);
          }
          break;
        case "eventMetadata":
          // Event metadata might not have a separate API endpoint
          showToast("info", "Event metadata is stored with locations");
          break;
        default:
          throw new Error(`Unknown module: ${module}`);
      }
      
      setPosting((prev) => ({ ...prev, [module]: false }));
      setPosted((prev) => ({ ...prev, [module]: true }));
      setExpandedView((prev) => ({ ...prev, [module]: false }));
      showToast("success", `${module} posted successfully to database`);
    } catch (error) {
      setPosting((prev) => ({ ...prev, [module]: false }));
      showToast("error", `Failed to post ${module}: ${error.message}`);
    }
  };

  // Handlers mappings to external functions
  const handleGenerateMasterData = () =>
    runSimulation(
      ["locationTypes", "vehicleTypes", "reservationClasses", "paymentMethods"],
      generateMasterData,
      "Master data generated successfully"
    );

  const handleGenerateLocations = () =>
    runSimulation(
      ["locations", "eventMetadata"],
      () => generateLocations(locationForm, adminData),
      "Locations generated successfully"
    );

  const handleGenerateGates = () => {
    if (!masterData.locations.length) {
      showToast("error", "Please wait for master data to load from backend");
      return;
    }
    if (!gateForm.locationId) {
      showToast("error", "Please select a Location");
      return;
    }
    runSimulation(
      "gates",
      () => generateGates(adminData, masterData, { locationId: gateForm.locationId }),
      "Gates generated successfully"
    );
  };

  const handleGenerateSlots = () => {
    if (!canGenerateSlots) {
      showToast("error", "Please wait for master data to load from backend");
      return;
    }
    if (!slotForm.locationId || !slotForm.vehicleTypeId || !slotForm.reservationClassId) {
      showToast("error", "Please select Location, Vehicle Type, and Reservation Class");
      return;
    }
    runSimulation(
      "parkingSlots",
      () => generateParkingSlots(1, adminData, masterData, {
        locationId: slotForm.locationId,
        vehicleTypeId: slotForm.vehicleTypeId,
        reservationClassId: slotForm.reservationClassId,
      }),
      "1 parking slot generated successfully"
    );
  };

  const handleGeneratePricing = () => {
    if (!masterData.locations.length || !masterData.vehicleTypes.length || !masterData.reservationClasses.length) {
      showToast("error", "Please wait for master data to load from backend");
      return;
    }
    if (!pricingForm.locationId || !pricingForm.vehicleTypeId || !pricingForm.reservationClassId) {
      showToast("error", "Please select Location, Vehicle Type, and Reservation Class");
      return;
    }
    runSimulation(
      "pricingRates",
      () => generatePricingRates(adminData, masterData, {
        locationId: pricingForm.locationId,
        vehicleTypeId: pricingForm.vehicleTypeId,
        reservationClassId: pricingForm.reservationClassId,
      }),
      "Pricing rate generated successfully"
    );
  };

  // Generate ALL mock data at once
  const handleGenerateAllMockData = () => {
    setGenerating((prev) => ({ ...prev, all: true }));
    
    try {
      const allData = generateAllMockData(locationForm, adminData, masterData);
      
      Object.entries(allData).forEach(([key, data]) => {
        replaceAdminData(key, data);
        setExpandedView((prev) => ({ ...prev, [key]: true }));
      });
      
      showToast("success", "All mock data generated successfully!");
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setGenerating((prev) => ({ ...prev, all: false }));
    }
  };

  // Push ALL to DB in dependency order using sequential API execution
  const handlePushAllToDB = async () => {
    setPosting((prev) => ({ ...prev, all: true }));
    
    // Get all modules that have data and aren't posted yet
    const modules = [
      "locationTypes",
      "vehicleTypes",
      "reservationClasses",
      "paymentMethods",
      "locations",
      "gates",
      "parkingSlots",
      "pricingRates",
    ].filter(mod => isDataPresent(mod) && !posted[mod]);

    try {
      // Use the new sequential API execution with dependency order
      await postAllModules(modules, adminData, (module, status) => {
        if (status === 'success') {
          setPosted(prev => ({ ...prev, [module]: true }));
          setPosting(prev => ({ ...prev, [module]: false }));
        } else if (status === 'posting') {
          setPosting(prev => ({ ...prev, [module]: true }));
        } else if (status === 'error') {
          setPosting(prev => ({ ...prev, [module]: false }));
        }
      });
      
      showToast("success", "All data pushed to database successfully!");
    } catch (error) {
      showToast("error", `Failed to push all data: ${error.message}`);
    } finally {
      setPosting((prev) => ({ ...prev, all: false }));
    }
  };

  // View all payloads modal
  const handleViewAllPayloads = () => {
    const payloads = getAllPayloads(locationForm, adminData, masterData);
    setPayloadModal({
      open: true,
      title: "Complete Data Payload (All Modules)",
      data: payloads,
    });
  };

  // Copy to clipboard
  const handleCopyPayload = () => {
    if (payloadModal.data) {
      navigator.clipboard.writeText(JSON.stringify(payloadModal.data, null, 2));
      showToast("success", "Payload copied to clipboard!");
    }
  };

  // Column definitions for each data type
  const getColumnsForDataKey = (dataKey) => {
    switch (dataKey) {
      case 'locationTypes':
        return [
          { field: 'typeName', header: 'Type Name', type: 'text', width: '200px' },
        ];
      case 'vehicleTypes':
        return [
          { field: 'vehicleTypeId', header: 'Vehicle Type ID', type: 'text', width: '180px' },
          { field: 'typeDisplayName', header: 'Display Name', type: 'text', width: '150px' },
        ];
      case 'reservationClasses':
        return [
          { field: 'classId', header: 'Class ID', type: 'text', width: '180px' },
          { field: 'className', header: 'Class Name', type: 'text', width: '150px' },
        ];
      case 'paymentMethods':
        return [
          { field: 'methodId', header: 'Method ID', type: 'text', width: '180px' },
          { field: 'methodName', header: 'Method Name', type: 'text', width: '150px' },
          { field: 'isActive', header: 'Active', type: 'boolean', width: '80px' },
        ];
      case 'locations':
        return [
          { field: 'locationId', header: 'Location ID', type: 'text', width: '150px' },
          { field: 'typeId', header: 'Type ID', type: 'number', width: '80px' },
          { field: 'locationName', header: 'Location Name', type: 'text', width: '200px' },
          { field: 'city', header: 'City', type: 'text', width: '120px' },
          { field: 'status', header: 'Status', type: 'select', width: '120px', options: [
            { value: 'ACTIVE', label: 'Active' },
            { value: 'INACTIVE', label: 'Inactive' },
            { value: 'MAINTENANCE', label: 'Maintenance' },
          ]},
        ];
      case 'gates':
        return [
          { field: 'locationId', header: 'Location ID', type: 'text', width: '150px' },
          { field: 'gateName', header: 'Gate Name', type: 'text', width: '200px' },
          { field: 'gateType', header: 'Gate Type', type: 'select', width: '120px', options: [
            { value: 'ENTRY', label: 'Entry' },
            { value: 'EXIT', label: 'Exit' },
            { value: 'BOTH', label: 'Both' },
          ]},
          { field: 'status', header: 'Status', type: 'select', width: '100px', options: [
            { value: 'ACTIVE', label: 'Active' },
            { value: 'INACTIVE', label: 'Inactive' },
          ]},
        ];
      case 'parkingSlots':
        return [
          { field: 'slotId', header: 'Slot ID', type: 'text', width: '180px' },
          { field: 'locationId', header: 'Location ID', type: 'text', width: '150px' },
          { field: 'displayCode', header: 'Display Code', type: 'text', width: '120px' },
          { field: 'vehicleTypeId', header: 'Vehicle Type ID', type: 'text', width: '150px' },
          { field: 'reservationClassId', header: 'Reservation Class ID', type: 'text', width: '150px' },
          { field: 'sensorId', header: 'Sensor ID', type: 'text', width: '150px' },
          { field: 'currentStatus', header: 'Status', type: 'select', width: '120px', options: [
            { value: 'AVAILABLE', label: 'Available' },
            { value: 'OCCUPIED', label: 'Occupied' },
            { value: 'RESERVED', label: 'Reserved' },
            { value: 'MAINTENANCE', label: 'Maintenance' },
          ]},
        ];
      case 'pricingRates':
        return [
          { 
            field: 'locationId', 
            header: 'Location ID', 
            type: 'select', 
            width: '180px',
            options: masterData.locations.map(loc => ({
              value: loc.locationId,
              label: `${loc.locationName} (${loc.locationId})`
            }))
          },
          { 
            field: 'vehicleTypeId', 
            header: 'Vehicle Type ID', 
            type: 'select', 
            width: '180px',
            options: masterData.vehicleTypes.map(vt => ({
              value: vt.vehicleTypeId,
              label: `${vt.typeDisplayName} (${vt.vehicleTypeId})`
            }))
          },
          { field: 'baseRate', header: 'Base Rate', type: 'number', width: '100px', step: '0.01' },
          { 
            field: 'currency', 
            header: 'Currency', 
            type: 'select', 
            width: '100px',
            options: [
              { value: 'INR', label: 'INR' },
              { value: 'EUR', label: 'EUR' },
              { value: 'USD', label: 'USD' },
              { value: 'GBP', label: 'GBP' },
            ]
          },
          { field: 'effectiveFrom', header: 'Effective From', type: 'text', width: '180px' },
          { field: 'effectiveTo', header: 'Effective To', type: 'text', width: '180px' },
          { field: 'isActive', header: 'Active', type: 'boolean', width: '80px' },
        ];
      case 'eventMetadata':
        return [
          { field: 'eventId', header: 'Event ID', type: 'text', width: '180px' },
          { field: 'locationId', header: 'Location ID', type: 'text', width: '150px' },
          { field: 'startTime', header: 'Start Time', type: 'text', width: '180px' },
          { field: 'endTime', header: 'End Time', type: 'text', width: '180px' },
        ];
      default:
        return [];
    }
  };

  // Get key field for each data type - returns array of field names for composite keys
  const getKeyFieldsForDataKey = (dataKey) => {
    switch (dataKey) {
      case 'locationTypes': return ['typeName'];
      case 'vehicleTypes': return ['vehicleTypeId'];
      case 'reservationClasses': return ['classId'];
      case 'paymentMethods': return ['methodId'];
      case 'locations': return ['locationId'];
      case 'gates': return ['locationId', 'gateName']; // Composite key: locationId + gateName
      case 'parkingSlots': return ['locationId', 'displayCode']; // Composite key: locationId + displayCode
      case 'pricingRates': return ['locationId', 'vehicleTypeId']; // Composite key: locationId + vehicleTypeId
      case 'eventMetadata': return ['eventId'];
      default: return ['id'];
    }
  };

  // Get a unique key string for a record based on its key fields
  const getRecordKey = (record, dataKey) => {
    const keyFields = getKeyFieldsForDataKey(dataKey);
    return keyFields.map(field => record[field]).join('|');
  };

  // Check if a record matches a key
  const recordMatchesKey = (record, key, dataKey) => {
    const keyFields = getKeyFieldsForDataKey(dataKey);
    const keyParts = key.split('|');
    return keyFields.every((field, index) => record[field] === keyParts[index]);
  };

  // Reusable Component UI Card
  const DomainCard = ({
    title,
    icon: Icon,
    dataKey,
    onGenerate,
    generateFields,
    children,
    payloadData,
  }) => {
    const data = adminData[dataKey] || [];
    const columns = getColumnsForDataKey(dataKey);
    const keyFields = getKeyFieldsForDataKey(dataKey);
    const keyField = keyFields[0]; // Keep for backward compatibility

    const handleSave = (key, updatedData) => {
      const updatedArray = data.map(item => 
        recordMatchesKey(item, key, dataKey) ? { ...item, ...updatedData } : item
      );
      replaceAdminData(dataKey, updatedArray);
      showToast("success", `${title} updated successfully`);
    };

    const handleDelete = (key) => {
      const updatedArray = data.filter(item => !recordMatchesKey(item, key, dataKey));
      replaceAdminData(dataKey, updatedArray);
      showToast("success", `${title} record deleted`);
    };

    const handleAdd = (newData) => {
      // Generate ID for new record if needed
      const newRecord = { ...newData };
      // For composite keys, ensure all key fields are present
      keyFields.forEach(field => {
        if (!newRecord[field]) {
          const prefix = dataKey.substring(0, 4).toUpperCase();
          newRecord[field] = `${prefix}-${Date.now().toString(36).toUpperCase()}`;
        }
      });
      const updatedArray = [...data, newRecord];
      replaceAdminData(dataKey, updatedArray);
      showToast("success", `${title} record added`);
    };

    return (
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md overflow-hidden flex flex-col">
        <div className="p-6 md:p-8 flex-1">
          <div className="flex items-start justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-(--app-violet)/5 text-(--app-violet) ring-1 ring-(--app-violet)/10">
                <Icon size={24} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 mb-1">
                  Domain Module
                </p>
                <h3 className="text-xl font-semibold text-slate-900 tracking-tight">
                  {title}
                </h3>
              </div>
            </div>
            <StatusBadge status={getStatus(dataKey)} />
          </div>

          <div className="space-y-6">
            {children}
            {generateFields && (
              <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-100">
                {generateFields}
              </div>
            )}
          </div>

          {/* Editable Data Table */}
          {data.length > 0 && columns.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-100">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Edit Data</h4>
              <EditableDataTable
                data={data}
                columns={columns}
                onSave={handleSave}
                onDelete={handleDelete}
                onAdd={handleAdd}
                title={title}
                keyField={keyField}
                keyFields={keyFields}
                editable={!posted[dataKey]} // Disable editing if already posted to DB
                deletable={!posted[dataKey]}
                addable={!posted[dataKey]}
              />
            </div>
          )}

          <DataViewer
            data={adminData[dataKey]}
            isExpanded={expandedView[dataKey]}
            onToggle={() =>
              setExpandedView((prev) => ({ ...prev, [dataKey]: !prev[dataKey] }))
            }
          />

          {/* View Payload Button */}
          {payloadData && adminData[dataKey]?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <button
                onClick={() => setPayloadModal({ open: true, title: `${title} Payload`, data: payloadData })}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-(--app-violet) transition-colors"
              >
                <Eye size={16} />
                View API Payload
              </button>
            </div>
          )}
        </div>

        <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={onGenerate}
            disabled={generating[dataKey] || generating.all}
            className="w-full sm:w-auto flex justify-center items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 shadow-sm"
          >
            {generating[dataKey] || generating.all ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 text-amber-500" />
            )}
            {isDataPresent(dataKey) ? "Regenerate Data" : "Generate Data"}
          </button>

          <button
            type="button"
            onClick={() => postModule(dataKey)}
            disabled={
              !isDataPresent(dataKey) || posting[dataKey] || posted[dataKey] || posting.all
            }
            className={`w-full sm:w-auto flex justify-center items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all shadow-sm ${
              posted[dataKey]
                ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"
                : "bg-(--app-violet) hover:bg-(--app-violet-strong) disabled:opacity-50 disabled:bg-slate-300 shadow-(--app-violet)/20"
            }`}
          >
            {posting[dataKey] ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Pushing...
              </>
            ) : posted[dataKey] ? (
              <>
                <CheckCircle2 className="h-4 w-4" /> Posted
              </>
            ) : (
              <>
                <UploadCloud className="h-4 w-4" /> Push DB
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  // Show loading state while fetching master data
  if (masterDataLoading) {
    return (
      <section className="space-y-8 max-w-7xl mx-auto pb-20">
        <MasterDataLoading />
      </section>
    );
  }

  // Show error state if master data fetch failed
  if (masterDataError) {
    return (
      <section className="space-y-8 max-w-7xl mx-auto pb-20">
        <MasterDataError error={masterDataError} onRetry={fetchMasterData} />
      </section>
    );
  }

  return (
    <section className="space-y-8 max-w-7xl mx-auto pb-20">
      {/* Global Action Bar */}
      <div className="rounded-3xl border border-slate-200 bg-white p-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shadow-sm sticky top-6 z-10">
        <div className="px-4 py-2">
          <p className="text-sm font-semibold text-slate-900">
            Bulk Operations
          </p>
          <p className="text-xs text-slate-500">
            Manage the entire schema pipeline
          </p>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-2">
          <button
            type="button"
            onClick={handleGenerateAllMockData}
            disabled={generating.all}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition disabled:opacity-50"
          >
            {generating.all ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            Generate Mock Data
          </button>
          <button
            type="button"
            onClick={handlePushAllToDB}
            disabled={posting.all}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-2xl bg-(--app-violet) px-6 py-3 text-sm font-semibold text-white hover:bg-(--app-violet-strong) transition disabled:opacity-50 shadow-lg shadow-(--app-violet)/20"
          >
            {posting.all ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Database className="h-4 w-4" />
            )}
            Push All to DB
          </button>
          <button
            type="button"
            onClick={handleViewAllPayloads}
            className="flex-none p-3 rounded-2xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300 transition"
            title="View Complete Payload"
          >
            <Code className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => {
              clearAllAdminData();
              setPosted({});
              setExpandedView({});
              showToast("info", "All data cleared");
            }}
            className="flex-none p-3 rounded-2xl border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition"
            title="Reset Everything"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* 2x2 Grid for the remaining 4 domains + Pricing Rates */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <DomainCard
          title="Master Data"
          icon={Settings}
          dataKey="locationTypes"
          onGenerate={handleGenerateMasterData}
          payloadData={adminData.locationTypes}
        >
          <p className="text-sm leading-relaxed text-slate-600">
            Generates static configuration tables: <br />•{" "}
            <strong>Location Types:</strong> PERMANENT_RETAIL, TEMPORARY_EVENT, AIRPORT_PARKING, MALL_PARKING{" "}
            <br />• <strong>Vehicle Types:</strong> Car, Bike, Delivery <br />•{" "}
            <strong>Reservation Classes:</strong> General, VIP <br />•{" "}
            <strong>Payment Methods:</strong> CASH, CREDIT_CARD, UPI, WALLET
          </p>
        </DomainCard>

        <DomainCard
          title="Locations & Events"
          icon={Building2}
          dataKey="locations"
          onGenerate={handleGenerateLocations}
          generateFields={
            <div className="grid gap-5 sm:grid-cols-2">
              <InputField
                label="Location ID"
                value={locationForm.locationId}
                onChange={(v) =>
                  setLocationForm({ ...locationForm, locationId: v })
                }
              />
              <SelectField
                label="Type ID (1-4)"
                value={locationForm.typeId}
                onChange={(v) =>
                  setLocationForm({ ...locationForm, typeId: parseInt(v) || 1 })
                }
                options={[
                  { value: "1", label: "1 - PERMANENT_RETAIL" },
                  { value: "2", label: "2 - TEMPORARY_EVENT" },
                  { value: "3", label: "3 - AIRPORT_PARKING" },
                  { value: "4", label: "4 - MALL_PARKING" },
                ]}
              />
              <InputField
                label="Location Name"
                value={locationForm.locationName}
                onChange={(v) =>
                  setLocationForm({ ...locationForm, locationName: v })
                }
              />
              <InputField
                label="City"
                value={locationForm.city}
                onChange={(v) =>
                  setLocationForm({ ...locationForm, city: v })
                }
              />
              <SelectField
                label="Status"
                value={locationForm.status}
                onChange={(v) =>
                  setLocationForm({ ...locationForm, status: v })
                }
                options={[
                  { value: "ACTIVE", label: "Active" },
                  { value: "INACTIVE", label: "Inactive" },
                  { value: "MAINTENANCE", label: "Maintenance" },
                ]}
              />
            </div>
          }
          payloadData={adminData.locations}
        >
          <p className="text-sm leading-relaxed text-slate-600">
            Creates Location records linked to the Master Data. Sets up Event
            Metadata (start/end times).
          </p>
        </DomainCard>

        <DomainCard
          title="Gates Infrastructure"
          icon={MapPin}
          dataKey="gates"
          onGenerate={handleGenerateGates}
          generateFields={
            <div className="grid gap-5 sm:grid-cols-2">
              <SelectField
                label="Location"
                value={gateForm.locationId || ""}
                onChange={(v) => setGateForm({ ...gateForm, locationId: v })}
                options={locationOptions}
                placeholder="Select location"
                disabled={locationOptions.length === 0}
              />
            </div>
          }
          payloadData={adminData.gates}
        >
          <p className="text-sm leading-relaxed text-slate-600">
            Automatically provisions <strong>Entry</strong> and{" "}
            <strong>Exit</strong> gates and links them to the selected Location
            domain.
          </p>
          {!masterData.locations.length && (
            <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-xs text-amber-800 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Waiting for master data to load from backend...
              </p>
            </div>
          )}
        </DomainCard>

        <DomainCard
          title="Parking Inventory"
          icon={LayoutGrid}
          dataKey="parkingSlots"
          onGenerate={handleGenerateSlots}
          generateFields={
            <div className="grid gap-5 sm:grid-cols-3">
              <SelectField
                label="Location"
                value={slotForm.locationId || ""}
                onChange={(v) => setSlotForm({ ...slotForm, locationId: v })}
                options={locationOptions}
                placeholder="Select location"
                disabled={locationOptions.length === 0}
              />
              <SelectField
                label="Vehicle Type"
                value={slotForm.vehicleTypeId || ""}
                onChange={(v) => setSlotForm({ ...slotForm, vehicleTypeId: v })}
                options={vehicleTypeOptions}
                placeholder="Select vehicle type"
                disabled={vehicleTypeOptions.length === 0}
              />
              <SelectField
                label="Reservation Class"
                value={slotForm.reservationClassId || ""}
                onChange={(v) => setSlotForm({ ...slotForm, reservationClassId: v })}
                options={reservationClassOptions}
                placeholder="Select reservation class"
                disabled={reservationClassOptions.length === 0}
              />
            </div>
          }
          payloadData={adminData.parkingSlots}
        >
          <p className="text-sm leading-relaxed text-slate-600">
            Generates parking slots distributed evenly across available vehicle
            types and reservation classes. Associates mock sensor IDs.
          </p>
          {!canGenerateSlots && (
            <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-xs text-amber-800 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Waiting for master data to load from backend...
              </p>
            </div>
          )}
        </DomainCard>

        <DomainCard
          title="Pricing Rules"
          icon={Settings}
          dataKey="pricingRates"
          onGenerate={handleGeneratePricing}
          generateFields={
            <div className="grid gap-5 sm:grid-cols-3">
              <SelectField
                label="Location"
                value={pricingForm.locationId || ""}
                onChange={(v) => setPricingForm({ ...pricingForm, locationId: v })}
                options={locationOptions}
                placeholder="Select location"
                disabled={locationOptions.length === 0}
              />
              <SelectField
                label="Vehicle Type"
                value={pricingForm.vehicleTypeId || ""}
                onChange={(v) => setPricingForm({ ...pricingForm, vehicleTypeId: v })}
                options={vehicleTypeOptions}
                placeholder="Select vehicle type"
                disabled={vehicleTypeOptions.length === 0}
              />
              <SelectField
                label="Reservation Class"
                value={pricingForm.reservationClassId || ""}
                onChange={(v) => setPricingForm({ ...pricingForm, reservationClassId: v })}
                options={reservationClassOptions}
                placeholder="Select reservation class"
                disabled={reservationClassOptions.length === 0}
              />
            </div>
          }
          payloadData={adminData.pricingRates}
        >
          <p className="text-sm leading-relaxed text-slate-600">
            Creates pricing rates per vehicle type per location. Supports
            time-based rates with effective dates and currency configuration.
          </p>
          {!masterData.locations.length && (
            <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-xs text-amber-800 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Waiting for master data to load from backend...
              </p>
            </div>
          )}
        </DomainCard>
      </div>

      {/* Payload Modal */}
      <PayloadModal
        isOpen={payloadModal.open}
        onClose={() => setPayloadModal({ open: false, title: "", data: null })}
        title={payloadModal.title}
        data={payloadModal.data}
        onCopy={handleCopyPayload}
      />
    </section>
  );
}