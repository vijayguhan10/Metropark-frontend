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
} from "lucide-react";
import { parkingLocations as mockLocations } from "../../data/mockData";
import { locationsApi, parkingSlotsApi } from "../../api";

const ITEMS_PER_PAGE = 9;

// Generate 24-hour time slots
const generateTimeSlots = () => {
  const slots = [];
  for (let h = 0; h < 24; h++) {
    const hour = h.toString().padStart(2, "0");
    slots.push(`${hour}:00`);
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

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

function TimeSlotGrid({ location, selectedDate, onSlotSelect }) {
  const [slotAvailability, setSlotAvailability] = useState({});
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Fetch slot availability for the selected date
  useEffect(() => {
    async function fetchSlotAvailability() {
      setIsLoadingSlots(true);
      try {
        const slotsData = await parkingSlotsApi.getByLocation(location.id);
        if (slotsData && slotsData.length > 0) {
          // Group by vehicle type and check availability for each hour
          const availability = {};
          slotsData.forEach((slot) => {
            const type = slot.vehicle_type_id || slot.vehicleTypeId || 1;
            if (!availability[type]) {
              availability[type] = { total: 0, available: 0 };
            }
            availability[type].total++;
            const status = (
              slot.current_status ||
              slot.currentStatus ||
              ""
            ).toUpperCase();
            if (status === "AVAILABLE") availability[type].available++;
          });
          setSlotAvailability(availability);
        }
      } catch (err) {
        console.error("Failed to fetch slot availability:", err);
      } finally {
        setIsLoadingSlots(false);
      }
    }
    fetchSlotAvailability();
  }, [location.id, selectedDate]);

  const vehicleTypes = [
    { id: 1, label: "Standard" },
    { id: 2, label: "Compact" },
    { id: 3, label: "EV" },
    { id: 4, label: "Oversize" },
  ];

  const getMonochromeStyle = (isAvailable) => {
    if (!isAvailable) {
      return "bg-surface-container border-outline-variant/50 text-on-surface-variant/40 cursor-not-allowed";
    }
    return "bg-surface-container border-outline-variant/50 text-on-surface hover:bg-surface-container-high hover:border-primary/30 hover:text-primary transition-all";
  };

  return (
    <div className="mt-4 space-y-4">
      <h4 className="text-sm font-semibold text-on-surface-variant">
        24-Hour Availability ({new Date(selectedDate).toLocaleDateString()})
      </h4>

      {isLoadingSlots ? (
        <div className="grid grid-cols-6 gap-2">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="h-20 bg-surface-container rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {vehicleTypes.map((type) => {
            const avail = slotAvailability[type.id] || {
              total: 0,
              available: 0,
            };
            const isAvailable = avail.available > 0;

            return (
              <div
                key={type.id}
                className={`p-3 rounded-xl border transition-all ${
                  isAvailable
                    ? "border-outline-variant/50 hover:border-primary/30 cursor-pointer"
                    : "border-outline-variant/30 opacity-50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-primary/20" />
                    <span className="text-on-surface font-medium">{type.label}</span>
                    <span
                      className={`text-xs font-semibold ${
                        isAvailable ? "text-success" : "text-on-surface-variant/40"
                      }`}
                    >
                      {isAvailable
                        ? `${avail.available}/${avail.total} free`
                        : "Full"}
                    </span>
                  </div>
                  <span className="text-on-surface font-bold text-sm">
                    ${location.pricePerHour}/hr
                  </span>
                </div>

                <div className="grid grid-cols-6 gap-1.5">
                  {TIME_SLOTS.map((time, idx) => (
                    <button
                      key={time}
                      onClick={() =>
                        isAvailable &&
                        onSlotSelect({
                          location,
                          vehicleType: type,
                          time,
                          date: selectedDate,
                        })
                      }
                      disabled={!isAvailable}
                      className={`h-10 rounded-lg text-xs font-medium ${getMonochromeStyle(
                        isAvailable
                      )}`}
                      title={`${type.label} - ${time}`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function LocationCard({ location, onSelect }) {
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const hasParkingSlots = location.hasParkingSlots;
  const hasAvailability = location.availableSlots > 0;

  const handleSlotSelect = (slotData) => {
    // Navigate to checkout with all necessary params
    const params = new URLSearchParams({
      location: slotData.location.id,
      vehicle_type: slotData.vehicleType.id,
      vehicle_type_label: slotData.vehicleType.label,
      date: slotData.date,
      time: slotData.time,
      rate: location.pricePerHour,
    });
    onSelect(`/checkout?${params.toString()}`);
  };

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

        {/* Date picker and time slots */}
        <div className="space-y-3 border-t border-outline-variant/50 pt-4 mt-auto">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-on-surface-variant" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="input-luxury flex-1"
            />
            <button
              onClick={() => setShowTimeSlots(!showTimeSlots)}
              className="btn-luxury-icon"
            >
              {showTimeSlots ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>

          {showTimeSlots && hasAvailability && (
            <TimeSlotGrid
              location={location}
              selectedDate={selectedDate}
              onSlotSelect={handleSlotSelect}
            />
          )}

          {showTimeSlots && !hasAvailability && (
            <p className="text-on-surface-variant text-sm text-center py-2">
              No slots available at this location
            </p>
          )}

          {!showTimeSlots && hasAvailability && (
            <button
              onClick={() => setShowTimeSlots(true)}
              className="btn-luxury-primary w-full"
            >
              View Available Slots
            </button>
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