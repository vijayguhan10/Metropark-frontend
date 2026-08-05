import { useState, useMemo, useEffect } from "react";
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
} from "lucide-react";
import { parkingLocations as mockLocations } from "../../data/mockData";
import { locationsApi, parkingSlotsApi } from "../../api";

const ITEMS_PER_PAGE = 9;

function enrichLocation(apiLoc, slotCounts) {
  // API may return camelCase or snake_case field names
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
    <div className=" border border-slate-700/50 rounded-2xl overflow-hidden animate-pulse">
      <div className="h-48 bg-white-700/60" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-white-700 rounded w-3/4" />
        <div className="h-4 bg-white-700/60 rounded w-1/2" />
        <div className="flex gap-2 mt-4">
          <div className="h-8 bg-white-700/60 rounded-lg flex-1" />
          <div className="h-8 bg-white-700/60 rounded-lg flex-1" />
        </div>
      </div>
    </div>
  );
}

function LocationCard({ location }) {
  const navigate = useNavigate();
  const hasParkingSlots = location.hasParkingSlots;
  const hasAvailability = location.availableSlots > 0;
  const isFullyOccupied = location.isFullyOccupied;
  const availabilityPct = location.totalSlots
    ? (location.availableSlots / location.totalSlots) * 100
    : 0;

  const availabilityColor =
    availabilityPct > 50
      ? "text-emerald-400"
      : availabilityPct > 20
        ? "text-amber-400"
        : "text-red-400";

  return (
    <div
      className={`group  border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col ${
        hasAvailability
          ? "border-slate-700/50 hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/10 hover:-translate-y-0.5 cursor-pointer"
          : "border-slate-700/30 opacity-60 cursor-not-allowed"
      }`}
    >
      <div className="relative h-44 bg-white-700/40 overflow-hidden">
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
            <Car className="w-12 h-12 text-slate-600" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          {location.hasEVCharging && (
            <span className="flex items-center gap-1 bg-emerald-500/90 backdrop-blur text-white text-xs font-semibold px-2 py-1 rounded-full">
              <Zap className="w-3 h-3" /> EV
            </span>
          )}
          {location.isOpen24h && (
            <span className="flex items-center gap-1 bg-violet-500/90 backdrop-blur text-white text-xs font-semibold px-2 py-1 rounded-full">
              <Clock className="w-3 h-3" /> 24h
            </span>
          )}
        </div>
        {!hasAvailability && (
          <div className="absolute inset-0 bg-white-900/70 flex items-center justify-center">
            <span className="bg-red-500/90 text-white text-sm font-semibold px-4 py-2 rounded-full">
              {!hasParkingSlots
                ? "No Parking Slots Configured"
                : "Full — All Slots Reserved"}
            </span>
          </div>
        )}
        <div className="absolute bottom-3 right-3 bg-white-900/80 backdrop-blur text-white text-sm font-bold px-3 py-1 rounded-xl">
          ${location.pricePerHour}/hr
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1 gap-3">
        <div>
          <h3 className="text-white font-semibold text-base leading-tight line-clamp-1">
            {location.name}
          </h3>
          <div className="flex items-center gap-1 text-slate-400 text-xs mt-1">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="line-clamp-1">
              {location.address || location.city}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-white text-xs font-medium">
              {location.rating}
            </span>
            {location.totalReviews > 0 && (
              <span className="text-slate-500 text-xs">
                ({location.totalReviews})
              </span>
            )}
          </div>
          <span className={`text-xs font-semibold ${availabilityColor}`}>
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
                className="text-xs text-slate-400 bg-white-700/50 px-2 py-0.5 rounded-full"
              >
                {f}
              </span>
            ))}
          </div>
        )}

        <button
          onClick={() =>
            hasAvailability && navigate(`/map?location=${location.id}`)
          }
          disabled={!hasAvailability}
          className={`mt-auto w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            hasAvailability
              ? "bg-violet-600 hover:bg-violet-500 text-white shadow-sm shadow-violet-500/20"
              : "bg-white-700/50 text-slate-500 cursor-not-allowed"
          }`}
        >
          {hasAvailability ? "View & Book" : "Unavailable"}
        </button>
      </div>
    </div>
  );
}

function LocationListCard({ location }) {
  const navigate = useNavigate();
  const hasAvailability = location.availableSlots > 0;

  return (
    <div
      className={`flex items-center gap-5  border rounded-2xl p-4 transition-all duration-200 ${
        hasAvailability
          ? "border-slate-700/50 hover:border-violet-500/40 hover:shadow-md hover:shadow-violet-500/10"
          : "border-slate-700/30 opacity-60"
      }`}
    >
      <div className="w-20 h-20 rounded-xl bg-white-700/50 overflow-hidden shrink-0">
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
            <Car className="w-8 h-8 text-slate-600" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-semibold text-sm truncate">
          {location.name}
        </h3>
        <p className="text-slate-400 text-xs mt-0.5 truncate">
          {location.address || location.city}
        </p>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-violet-400 text-sm font-bold">
            ${location.pricePerHour}/hr
          </span>
          <span
            className={`text-xs font-medium ${hasAvailability ? "text-emerald-400" : "text-red-400"}`}
          >
            {hasAvailability ? `${location.availableSlots} available` : "Full"}
          </span>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-slate-300 text-xs">{location.rating}</span>
          </div>
        </div>
      </div>
      <button
        onClick={() =>
          hasAvailability && navigate(`/map?location=${location.id}`)
        }
        disabled={!hasAvailability}
        className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
          hasAvailability
            ? "bg-violet-600 hover:bg-violet-500 text-white"
            : "bg-white-700/50 text-slate-500 cursor-not-allowed"
        }`}
      >
        {hasAvailability ? "Book" : "Full"}
      </button>
    </div>
  );
}

export default function Explorer() {
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
    <div className="min-h-screen text-black p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Find Parking</h1>
            <p className="text-slate-400 text-sm mt-1">
              {isLoading
                ? "Loading locations…"
                : `${filtered.length} location${filtered.length !== 1 ? "s" : ""} found`}
            </p>
          </div>
          <div className="flex items-center gap-2  border border-slate-700/50 rounded-xl p-1">
            {[
              { mode: "grid", Icon: Grid3X3 },
              { mode: "list", Icon: List },
            ].map(({ mode, Icon }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`p-2 rounded-lg transition-all ${viewMode === mode ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"}`}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name or location…"
              className="w-full  border border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            className=" border border-slate-700/50 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-violet-500 cursor-pointer"
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
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                selectedFilters[key]
                  ? "bg-violet-600 border-violet-500 text-white"
                  : " border-slate-700/50 text-slate-400 hover:border-violet-500/50 hover:text-white"
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 text-amber-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {isLoading ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                : "space-y-3"
            }
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <Car className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No locations match your filters</p>
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
              className="text-violet-400 text-sm mt-2 hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginated.map((loc) => (
              <LocationCard key={loc.id} location={loc} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {paginated.map((loc) => (
              <LocationListCard key={loc.id} location={loc} />
            ))}
          </div>
        )}

        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg  border border-slate-700/50 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                  p === currentPage
                    ? "bg-violet-600 text-white"
                    : " border border-slate-700/50 text-slate-400 hover:text-white"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg  border border-slate-700/50 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
