import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
  Star,
  MapPin,
  Zap,
  Clock,
  Shield,
  Car,
  AlertCircle,
  Calendar,
  ChevronUp,
  ChevronDown,
  Map,
  Loader2,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { parkingLocations as mockLocations } from "../../data/mockData";
import { locationsApi, parkingSlotsApi } from "../../api";

const ITEMS_PER_PAGE = 9;

function enrichLocation(apiLoc, slotCounts) {
  const locId = apiLoc.location_id || apiLoc.locationId;
  const locName = apiLoc.location_name || apiLoc.locationName;
  const locCity = apiLoc.city;
  const locStatus = apiLoc.status;

  const mock = mockLocations.find((m) => m.id === locId) || {};
  const counts = slotCounts[locId] || { total: 0, available: 0 };

  const totalSlots = counts.total || 0;
  const availableSlots = counts.available || 0;

  return {
    ...mock,
    id: locId,
    name: locName || mock.name || "Unknown Location",
    city: locCity || mock.address || "",
    address: mock.address || locCity || "",
    status: locStatus,
    totalSlots,
    availableSlots,
    hasParkingSlots: totalSlots > 0,
    isFullyOccupied: totalSlots > 0 && availableSlots === 0,
    pricePerHour: mock.pricePerHour || 5,
    rating: mock.rating || 4.5,
    totalReviews: mock.totalReviews || 0,
    features: mock.features || [],
    image: mock.image || null,
    hasEVCharging: mock.hasEVCharging || false,
    hasValet: mock.hasValet || false,
    isOpen24h: mock.isOpen24h || false,
  };
}

function SkeletonCard() {
  return (
    <div className="luxury-card animate-pulse">
      <div className="h-48 bg-surface-container" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-surface-container rounded w-3/4" />
        <div className="h-4 bg-surface-container rounded w-1/2" />
        <div className="flex gap-2 mt-4">
          <div className="h-8 bg-surface-container rounded-lg flex-1" />
          <div className="h-8 bg-surface-container rounded-lg flex-1" />
        </div>
      </div>
    </div>
  );
}

function TimeRangeCard({ 
  startTime, 
  endTime, 
  isSelected, 
  onSelect, 
  slotId,
  pricePerHour 
}) {
  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  const durationHours = (new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60);
  const estimatedCost = (durationHours * pricePerHour).toFixed(2);

  return (
    <button
      onClick={() => onSelect(slotId, startTime, endTime)}
      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
        isSelected
          ? 'bg-primary-light border-primary'
          : 'bg-surface-container border-outline-variant/50 hover:border-primary/50 hover:bg-surface-container-high'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
            <Car className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="font-semibold text-on-surface">
              {formatDate(startTime)} • {formatTime(startTime)} – {formatTime(endTime)}
            </div>
            <div className="text-xs text-on-surface-variant">
              {durationHours % 1 === 0 ? `${durationHours} hr` : `${durationHours.toFixed(1)} hrs`}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-semibold text-on-surface">${estimatedCost}</div>
          <div className="text-xs text-on-surface-variant">Estimated</div>
          {isSelected && (
            <CheckCircle className="w-5 h-5 text-success mx-auto mt-1" />
          )}
        </div>
      </div>
    </button>
  );
}

function SlotDisplay({ 
  location, 
  fromDate, 
  toDate, 
  availableSlots, 
  selectedSlotId, 
  selectedTiming,
  overlappingTimings, 
  isLoading, 
  onProceed,
  onTimingSelect
}) {
  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="luxury-card p-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-on-surface-variant">Checking availability...</span>
        </div>
      </div>
    );
  }

  const userStart = new Date(fromDate);
  const userEnd = new Date(toDate);

  const validTimeRanges = availableSlots.map((slot) => {
    const slotId = typeof slot === 'object' ? slot.slotId || slot.id : slot;
    const slotAvailableFrom = typeof slot === 'object' && slot.availableFrom 
      ? new Date(slot.availableFrom) 
      : userStart;
    const slotAvailableTo = typeof slot === 'object' && slot.availableTo 
      ? new Date(slot.availableTo) 
      : userEnd;
    
    const actualStart = slotAvailableFrom > userStart ? slotAvailableFrom : userStart;
    const actualEnd = slotAvailableTo < userEnd ? slotAvailableTo : userEnd;
    const durationMs = actualEnd - actualStart;
    const durationHours = durationMs / (1000 * 60 * 60);
    
    return {
      slotId,
      startTime: actualStart.toISOString(),
      endTime: actualEnd.toISOString(),
      durationHours,
      isValid: durationHours >= 0.5
    };
  }).filter(r => r.isValid);

  const hasValidSlots = validTimeRanges.length > 0;

  if (!hasValidSlots) {
    return (
      <div className="luxury-card p-8 text-center">
        <Car className="w-12 h-12 mx-auto mb-3 text-on-surface-variant/30" />
        <p className="text-on-surface-variant">No slots are available for the selected time period</p>
      </div>
    );
  }

  const isUserTimingOverlapping = () => {
    if (!overlappingTimings || overlappingTimings.length === 0) return false;
    return overlappingTimings.some(ot => {
      const otStart = new Date(ot.from);
      const otEnd = new Date(ot.to);
      return userStart < otEnd && userEnd > otStart;
    });
  };

  const userTimingOverlaps = isUserTimingOverlapping();

  return (
    <div className="luxury-card overflow-hidden">
      <div className="p-4 border-b border-outline-variant/50 bg-surface-container-low">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Map className="w-5 h-5 text-primary" />
            <h3 className="text-title-md font-semibold text-on-surface">Available Timings</h3>
          </div>
          <div className="flex items-center gap-4 text-sm text-on-surface-variant">
            <span>Entry: {formatDate(fromDate)} {formatTime(fromDate)}</span>
            <span>Exit: {formatDate(toDate)} {formatTime(toDate)}</span>
          </div>
        </div>
      </div>

      {/* Show "Overlapping" only when user's selected time period has no available slots */}
      {userTimingOverlaps && !hasValidSlots && (
        <div className="p-4 bg-warning-light border-b border-warning/30">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-warning shrink-0" />
            <span className="text-warning font-medium text-sm">Overlapping</span>
          </div>
        </div>
      )}

      <div className="p-4">
        <p className="text-sm text-on-surface-variant mb-3">
          Select an available timing for your parking session
        </p>
        
        <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
          {validTimeRanges.map((range) => {
            const isSelected = selectedSlotId === range.slotId;
            
            return (
              <TimeRangeCard
                key={range.slotId}
                startTime={range.startTime}
                endTime={range.endTime}
                isSelected={isSelected}
                onSelect={onTimingSelect}
                slotId={range.slotId}
                pricePerHour={location.pricePerHour}
              />
            );
          })}
        </div>

        <button
          onClick={onProceed}
          disabled={!selectedSlotId}
          className={`btn-luxury-primary w-full py-3 text-lg ${!selectedSlotId ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <ArrowRight className="w-5 h-5" />
          <span>
            {selectedSlotId 
              ? 'Proceed to Checkout' 
              : 'Select a timing to proceed'}
          </span>
        </button>
      </div>
    </div>
  );
}

function LocationCard({ location, onSelect }) {
  const [showSlotSelector, setShowSlotSelector] = useState(false);
  const [fromDate, setFromDate] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30); // Start from 30 mins from now
    return now.toISOString().slice(0, 16);
  });
  const [toDate, setToDate] = useState(() => {
    const now = new Date();
    now.setHours(now.getHours() + 2); // Default 2 hours
    return now.toISOString().slice(0, 16);
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [overlappingTimings, setOverlappingTimings] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [selectedTiming, setSelectedTiming] = useState(null); // { startTime, endTime }
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState(null);
  const [lastCheckedFromDate, setLastCheckedFromDate] = useState(null);
  const [lastCheckedToDate, setLastCheckedToDate] = useState(null);

  const hasParkingSlots = location.hasParkingSlots;
  const hasAvailability = location.availableSlots > 0;

  const haveDatesChanged = () => {
    return lastCheckedFromDate !== fromDate || lastCheckedToDate !== toDate;
  };

  const checkAvailability = async () => {
    if (!fromDate || !toDate) return;
    
    if (new Date(fromDate) >= new Date(toDate)) {
      setAvailabilityError("Exit time must be after entry time");
      return;
    }
    
    setIsCheckingAvailability(true);
    setAvailabilityError(null);
    setAvailableSlots([]);
    setOverlappingTimings([]);
    setSelectedSlotId(null);
    setSelectedTiming(null);

    try {
      const response = await parkingSlotsApi.checkAvailability(location.id, {
        fromDate,
        toDate,
      });
      
      if (response && response.availableSlotIds) {
        const slots = response.availableSlotIds;
        setAvailableSlots(slots);
        setOverlappingTimings(response.overlappingTimings || []);
      } else if (Array.isArray(response)) {
        setAvailableSlots(response);
      } else if (response && response.slots) {
        setAvailableSlots(response.slots);
        setOverlappingTimings(response.overlappingTimings || []);
      }
      
      setLastCheckedFromDate(fromDate);
      setLastCheckedToDate(toDate);
      
    } catch (err) {
      console.error("Failed to check availability:", err);
      setAvailabilityError("Could not check availability. Please try again.");
      const mockSlots = [
        { slotId: 101, availableFrom: fromDate, availableTo: toDate },
        { slotId: 102, availableFrom: fromDate, availableTo: toDate },
        { slotId: 105, availableFrom: fromDate, availableTo: toDate },
        { slotId: 108, availableFrom: fromDate, availableTo: toDate },
      ];
      setAvailableSlots(mockSlots);
      setOverlappingTimings([
        { from: "2026-08-11T10:30:00", to: "2026-08-11T11:30:00" },
        { from: "2026-08-11T12:00:00", to: "2026-08-11T13:30:00" },
      ]);
      setLastCheckedFromDate(fromDate);
      setLastCheckedToDate(toDate);
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const handleCheckClick = () => {
    if (!showSlotSelector) {
      setShowSlotSelector(true);
      setTimeout(checkAvailability, 100);
    } else {
      checkAvailability();
    }
  };

  const handleTimingSelect = (slotId, startTime, endTime) => {
    setSelectedSlotId(slotId);
    setSelectedTiming({ startTime, endTime });
  };

  const handleProceed = () => {
    if (!selectedSlotId || !selectedTiming) return;
    
    const params = new URLSearchParams({
      location: location.id,
      slotId: selectedSlotId,
      fromDate: selectedTiming.startTime,
      toDate: selectedTiming.endTime,
      rate: location.pricePerHour,
    });
    onSelect(`/checkout?${params.toString()}`);
  };

  useEffect(() => {
    if (showSlotSelector && haveDatesChanged()) {
      setSelectedSlotId(null);
      setSelectedTiming(null);
      setTimeout(checkAvailability, 300);
    }
  }, [fromDate, toDate, showSlotSelector]);

  return (
    <div
      className={`luxury-card group overflow-hidden flex flex-col ${
        hasAvailability
          ? "hover:luxury-card-hover hover:-translate-y-0.5"
          : "opacity-60"
      }`}
    >
      <div className="relative h-44 bg-surface-container overflow-hidden">
        {location.image ? (
          <img
            src={location.image}
            alt={location.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Car className="w-12 h-12 text-on-surface-variant/30" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          {location.hasEVCharging && (
            <span className="badge-luxury badge-luxury-tertiary">
              <Zap className="w-3 h-3" /> EV
            </span>
          )}
          {location.isOpen24h && (
            <span className="badge-luxury badge-luxury-primary">
              <Clock className="w-3 h-3" /> 24h
            </span>
          )}
        </div>
        {!hasAvailability && (
          <div className="absolute inset-0 bg-on-surface/70 flex items-center justify-center">
            <span className="bg-error text-on-error text-sm font-semibold px-4 py-2 rounded-full">
              {!hasParkingSlots
                ? "No Parking Slots"
                : "Full — All Slots Reserved"}
            </span>
          </div>
        )}
        <div className="absolute bottom-3 right-3 bg-on-surface/80 backdrop-blur text-on-background text-sm font-bold px-3 py-1 rounded-xl">
          ${location.pricePerHour}/hr
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1 gap-3">
        <div>
          <h3 className="text-on-surface font-semibold text-base leading-tight line-clamp-1">
            {location.name}
          </h3>
          <div className="flex items-center gap-1 text-on-surface-variant text-xs mt-1">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="line-clamp-1">
              {location.address || location.city}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-warning fill-warning" />
            <span className="text-on-surface text-xs font-medium">
              {location.rating}
            </span>
            {location.totalReviews > 0 && (
              <span className="text-on-surface-variant text-xs">
                ({location.totalReviews})
              </span>
            )}
          </div>
          <span className={`text-xs font-semibold ${hasAvailability ? "text-success" : "text-on-surface-variant/40"}`}>
            {hasAvailability
              ? `${location.availableSlots} slots free`
              : "No slots"}
          </span>
        </div>

        {location.features?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {location.features.slice(0, 3).map((f) => (
              <span
                key={f}
                className="badge-luxury badge-luxury-neutral"
              >
                {f}
              </span>
            ))}
          </div>
        )}

        {/* Date/Time picker and slot selection */}
        <div className="space-y-3 border-t border-outline-variant/50 pt-4 mt-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="input-luxury-label">Entry Date & Time</label>
              <input
                type="datetime-local"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="input-luxury"
              />
            </div>
            <div>
              <label className="input-luxury-label">Exit Date & Time</label>
              <input
                type="datetime-local"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                min={fromDate}
                className="input-luxury"
              />
            </div>
          </div>

          <button
            onClick={handleCheckClick}
            disabled={isCheckingAvailability}
            className="btn-luxury-primary w-full"
          >
            {isCheckingAvailability ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Checking Availability...</span>
              </>
            ) : showSlotSelector ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Re-check Availability</span>
              </>
            ) : (
              <>
                <Map className="w-4 h-4" />
                <span>Check Availability</span>
              </>
            )}
          </button>

          {availabilityError && (
            <p className="text-error text-sm text-center">{availabilityError}</p>
          )}

          {showSlotSelector && (
            <SlotDisplay
              location={location}
              fromDate={fromDate}
              toDate={toDate}
              availableSlots={availableSlots}
              selectedSlotId={selectedSlotId}
              selectedTiming={selectedTiming}
              overlappingTimings={overlappingTimings}
              isLoading={isCheckingAvailability}
              onProceed={handleProceed}
              onTimingSelect={handleTimingSelect}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function LocationListCard({ location, onSelect }) {
  const navigate = useNavigate();
  const hasAvailability = location.availableSlots > 0;

  return (
    <div
      className={`luxury-card transition-all duration-200 ${
        hasAvailability
          ? "hover:luxury-card-hover"
          : "opacity-60"
      }`}
    >
      <div className="w-20 h-20 rounded-xl bg-surface-container overflow-hidden shrink-0">
        {location.image ? (
          <img
            src={location.image}
            alt={location.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Car className="w-8 h-8 text-on-surface-variant/30" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-on-surface font-semibold text-sm truncate">
          {location.name}
        </h3>
        <p className="text-on-surface-variant text-xs mt-0.5 truncate">
          {location.address || location.city}
        </p>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-on-surface text-sm font-bold">
            ${location.pricePerHour}/hr
          </span>
          <span
            className={`text-xs font-medium ${hasAvailability ? "text-success" : "text-on-surface-variant/40"}`}
          >
            {hasAvailability ? `${location.availableSlots} available` : "Full"}
          </span>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-warning fill-warning" />
            <span className="text-on-surface-variant text-xs">{location.rating}</span>
          </div>
        </div>
      </div>
      <button
        onClick={() =>
          hasAvailability && onSelect(`/map?location=${location.id}`)
        }
        disabled={!hasAvailability}
        className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
          hasAvailability
            ? "btn-luxury-primary"
            : "bg-surface-container text-on-surface-variant cursor-not-allowed"
        }`}
      >
        {hasAvailability ? "View Map" : "Full"}
      </button>
    </div>
  );
}

export default function Explorer() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    evCharging: false,
    valet: false,
    covered: false,
    open24h: false,
  });
  const [sortBy, setSortBy] = useState("availability");
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleLocationSelect = useCallback(
    (path) => {
      navigate(path);
    },
    [navigate],
  );

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const [apiLocations, allSlots] = await Promise.all([
          locationsApi.getAll(),
          parkingSlotsApi.getAll().catch(() => []),
        ]);

        const slotCounts = (allSlots || []).reduce((acc, slot) => {
          const lid = slot.location_id || slot.locationId;
          if (!lid) return acc;
          if (!acc[lid]) acc[lid] = { total: 0, available: 0 };
          acc[lid].total++;
          const status = slot.current_status || slot.currentStatus || "";
          if (status.toUpperCase() === "AVAILABLE") acc[lid].available++;
          return acc;
        }, {});

        const enriched = (apiLocations || []).map((loc) =>
          enrichLocation(loc, slotCounts),
        );
        setLocations(
          enriched.length
            ? enriched
            : mockLocations.map((m) => ({
                ...m,
                availableSlots: m.availableSlots ?? 0,
              })),
        );
      } catch {
        setLocations(
          mockLocations.map((m) => ({
            ...m,
            availableSlots: m.availableSlots ?? 0,
          })),
        );
        setError("Could not reach server — showing demo data.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    let list = [...locations];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (l) =>
          l.name?.toLowerCase().includes(q) ||
          l.address?.toLowerCase().includes(q) ||
          l.city?.toLowerCase().includes(q),
      );
    }
    if (selectedFilters.evCharging) list = list.filter((l) => l.hasEVCharging);
    if (selectedFilters.valet) list = list.filter((l) => l.hasValet);
    if (selectedFilters.open24h) list = list.filter((l) => l.isOpen24h);

    if (sortBy === "availability")
      list.sort((a, b) => b.availableSlots - a.availableSlots);
    else if (sortBy === "price_asc")
      list.sort((a, b) => a.pricePerHour - b.pricePerHour);
    else if (sortBy === "price_desc")
      list.sort((a, b) => b.pricePerHour - a.pricePerHour);
    else if (sortBy === "rating") list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [locations, searchQuery, selectedFilters, sortBy]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const toggleFilter = (key) => {
    setSelectedFilters((prev) => ({ ...prev, [key]: !prev[key] }));
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-display-sm text-on-surface font-bold tracking-tight">
              Find Parking
            </h1>
            <p className="text-body-md text-on-surface-variant mt-1">
              {isLoading
                ? "Loading locations…"
                : `${filtered.length} location${filtered.length !== 1 ? "s" : ""} found`}
            </p>
          </div>
          <div className="tabs-luxury">
            {[
              { mode: "grid", Icon: Grid3X3 },
              { mode: "list", Icon: List },
            ].map(({ mode, Icon }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`tabs-luxury-trigger ${
                  viewMode === mode ? "data-[state=active]" : ""
                }`}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name or location…"
              className="input-luxury pl-10"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            className="input-luxury cursor-pointer bg-surface-container"
          >
            <option value="availability">Sort: Most Available</option>
            <option value="price_asc">Sort: Price ↑</option>
            <option value="price_desc">Sort: Price ↓</option>
            <option value="rating">Sort: Top Rated</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            {
              key: "evCharging",
              label: "EV Charging",
              icon: <Zap className="w-3 h-3" />,
            },
            {
              key: "valet",
              label: "Valet",
              icon: <Shield className="w-3 h-3" />,
            },
            {
              key: "open24h",
              label: "24h Open",
              icon: <Clock className="w-3 h-3" />,
            },
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => toggleFilter(key)}
              className={`badge-luxury ${selectedFilters[key] ? "badge-luxury-primary" : "badge-luxury-neutral"} transition-all`}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-warning-light border border-warning/30 rounded-2xl px-4 py-3 text-warning text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {isLoading ? (
          <div
            className={
              viewMode === "grid"
                ? "grid-luxury grid-luxury-3"
                : "space-y-3"
            }
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-20 text-on-surface-variant">
            <Car className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-headline-sm text-on-surface font-medium">No locations match your filters</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedFilters({
                  evCharging: false,
                  valet: false,
                  covered: false,
                  open24h: false,
                });
              }}
              className="btn-luxury-ghost mt-2"
            >
              Clear filters
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid-luxury grid-luxury-3">
            {paginated.map((loc) => (
              <LocationCard
                key={loc.id}
                location={loc}
                onSelect={handleLocationSelect}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {paginated.map((loc) => (
              <LocationListCard
                key={loc.id}
                location={loc}
                onSelect={handleLocationSelect}
              />
            ))}
          </div>
        )}

        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn-luxury-icon disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                  p === currentPage
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="btn-luxury-icon disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
