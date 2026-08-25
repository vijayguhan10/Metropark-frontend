import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Car, Zap, AlertCircle, RefreshCw } from 'lucide-react';
import { parkingLocations as mockLocations, floorPlans as mockFloorPlans } from '../../data/mockData';
import { parkingSlotsApi, locationsApi } from '../../api';

const VEHICLE_TYPE_MAP = {
  1: { label: 'Standard', color: 'violet', rate: 5 },
  2: { label: 'Compact', color: 'blue', rate: 4 },
  3: { label: 'EV', color: 'emerald', rate: 7 },
  4: { label: 'Oversize', color: 'amber', rate: 8 },
};

const TYPE_COLORS = {
  violet: {
    available: 'bg-violet-600/20 border-violet-500/50 text-violet-300 hover:bg-violet-600/40 hover:border-violet-400 cursor-pointer',
    occupied: '/30 border-slate-600/30 text-slate-600 cursor-not-allowed',
  },
  blue: {
    available: 'bg-blue-600/20 border-blue-500/50 text-blue-300 hover:bg-blue-600/40 hover:border-blue-400 cursor-pointer',
    occupied: '/30 border-slate-600/30 text-slate-600 cursor-not-allowed',
  },
  emerald: {
    available: 'bg-emerald-600/20 border-emerald-500/50 text-emerald-300 hover:bg-emerald-600/40 hover:border-emerald-400 cursor-pointer',
    occupied: '/30 border-slate-600/30 text-slate-600 cursor-not-allowed',
  },
  amber: {
    available: 'bg-amber-600/20 border-amber-500/50 text-amber-300 hover:bg-amber-600/40 hover:border-amber-400 cursor-pointer',
    occupied: '/30 border-slate-600/30 text-slate-600 cursor-not-allowed',
  },
};

function SlotCard({ slot, onClick }) {
  const typeInfo = VEHICLE_TYPE_MAP[slot.vehicle_type_id] || VEHICLE_TYPE_MAP[1];
  const isAvailable = slot.current_status === 'AVAILABLE';
  const colors = TYPE_COLORS[typeInfo.color];

  return (
    <button
      onClick={() => isAvailable && onClick(slot)}
      disabled={!isAvailable}
      title={isAvailable ? `${slot.display_code} — ${typeInfo.label} — $${typeInfo.rate}/hr` : `${slot.display_code} — Occupied`}
      className={`relative w-full aspect-3/2 min-h-13 rounded-xl border-2 flex flex-col items-center justify-center gap-0.5 transition-all duration-150 text-center px-1 ${
        isAvailable ? colors.available : colors.occupied
      }`}
    >
      {slot.vehicle_type_id === 3 && isAvailable && (
        <Zap className="absolute top-1 right-1 w-3 h-3 text-emerald-400" />
      )}
      <span className="text-xs font-bold leading-none">{slot.display_code}</span>
      {!isAvailable && (
        <Car className="w-3.5 h-3.5 opacity-50" />
      )}
    </button>
  );
}

function SectionRow({ label, slots, onSlotClick }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-semibold  uppercase tracking-widest">{label}</span>
        <div className="flex-1 h-px /50" />
        <span className="text-xs text-slate-500">
          {slots.filter((s) => s.current_status === 'AVAILABLE').length}/{slots.length} free
        </span>
      </div>
      <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))' }}>
        {slots.map((slot) => (
          <SlotCard key={slot.slot_id} slot={slot} onClick={onSlotClick} />
        ))}
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap gap-4 text-xs ">
      {[
        { label: 'Standard', cls: 'bg-violet-600/20 border-violet-500/50' },
        { label: 'Compact', cls: 'bg-blue-600/20 border-blue-500/50' },
        { label: 'EV', cls: 'bg-emerald-600/20 border-emerald-500/50' },
        { label: 'Oversize', cls: 'bg-amber-600/20 border-amber-500/50' },
        { label: 'Occupied', cls: '/30 border-slate-600/30' },
      ].map(({ label, cls }) => (
        <div key={label} className="flex items-center gap-1.5">
          <div className={`w-4 h-3 rounded border ${cls}`} />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

function normalizeSlot(raw, fallbackLocationId) {
  const status = (raw.current_status ?? raw.currentStatus ?? 'AVAILABLE').toString().toUpperCase();
  return {
    slot_id: raw.slot_id ?? raw.slotId,
    display_code: raw.display_code ?? raw.displayCode ?? String(raw.slot_id ?? raw.slotId ?? ''),
    vehicle_type_id: raw.vehicle_type_id ?? raw.vehicleTypeId ?? 1,
    reservation_class_id: raw.reservation_class_id ?? raw.reservationClassId ?? null,
    sensor_id: raw.sensor_id ?? raw.sensorId ?? null,
    current_status: status,
    location_id: raw.location_id ?? raw.locationId ?? fallbackLocationId,
    _section: raw._section,
    _floor: raw._floor,
  };
}

export default function SlotMap() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const locationId = searchParams.get('location') || 'loc_001';

  const [slots, setSlots] = useState([]);
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const [slotsData, locData] = await Promise.all([
          parkingSlotsApi.getByLocation(locationId),
          locationsApi.getById(locationId).catch(() => null),
        ]);
        setSlots((slotsData || []).map((s) => normalizeSlot(s, locationId)));

        const mockLoc = mockLocations.find((l) => l.id === locationId);
        setLocation(
          locData
            ? {
                id: locData.location_id ?? locData.locationId ?? locationId,
                name: locData.location_name ?? locData.locationName ?? 'Parking Location',
                address: mockLoc?.address || locData.city || '',
                pricePerHour: mockLoc?.pricePerHour || 5,
              }
            : mockLoc || { id: locationId, name: 'Parking Location', address: '', pricePerHour: 5 }
        );
      } catch {
        const mockLoc = mockLocations.find((l) => l.id === locationId) || mockLocations[0];
        setLocation(mockLoc);
        const plan = mockFloorPlans[mockLoc.id] || mockFloorPlans[mockLocations[0].id];
        const mockSlots = plan?.floors?.flatMap((floor) =>
          floor.sections?.flatMap((section) =>
            (section.slots || []).map((s) => ({
              slot_id: s.id,
              display_code: s.id,
              vehicle_type_id: s.type === 'ev' ? 3 : s.type === 'compact' ? 2 : s.type === 'oversize' ? 4 : 1,
              current_status: s.status === 'available' ? 'AVAILABLE' : 'OCCUPIED',
              location_id: locationId,
              _section: section.name,
              _floor: floor.name,
            }))
          )
        ) || [];
        setSlots(mockSlots);
        setError('Using demo data — live slot status unavailable.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [locationId]);

  const handleSlotClick = (slot) => {
    const typeInfo = VEHICLE_TYPE_MAP[slot.vehicle_type_id] || VEHICLE_TYPE_MAP[1];
    const rate = location?.pricePerHour || typeInfo.rate;
    navigate(
      `/checkout?location=${locationId}&slot_id=${slot.slot_id}&slot_code=${encodeURIComponent(slot.display_code)}&type=${typeInfo.label.toLowerCase()}&vehicle_type_id=${slot.vehicle_type_id}&rate=${rate}&floor=${encodeURIComponent(slot._section || slot._floor || 'Main')}`
    );
  };

  const sections = slots.reduce((acc, slot) => {
    const prefix = slot._section || slot.display_code?.split('-')[0] || 'Main';
    if (!acc[prefix]) acc[prefix] = [];
    acc[prefix].push(slot);
    return acc;
  }, {});

  const availableCount = slots.filter((s) => s.current_status === 'AVAILABLE').length;
  const totalCount = slots.length;

  return (
    <div className="min-h-screen  p-4 md:p-6 lg:p-8 text-black">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl  border border-slate-700/50  hover:text-white hover:border-violet-500/50 transition-all mt-0.5"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">
              {isLoading ? 'Loading…' : (location?.name || 'Parking Location')}
            </h1>
            {location?.address && (
              <div className="flex items-center gap-1  text-sm mt-1">
                <MapPin className="w-3.5 h-3.5" />
                {location.address}
              </div>
            )}
          </div>
          {!isLoading && (
            <div className="text-right">
              <div className="text-xl font-bold text-violet-400">{availableCount}</div>
              <div className="text-xs text-slate-500">of {totalCount} free</div>
            </div>
          )}
        </div>

        {/* Rate card */}
        {!isLoading && location && (
          <div className="flex items-center justify-between  border border-slate-700/40 rounded-2xl px-5 py-3">
            <div className="text-sm ">Starting rate</div>
            <div className="text-lg font-bold text-white">${location.pricePerHour}<span className="text-sm font-normal ">/hr</span></div>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-2  border border-amber-500/30 rounded-xl px-4 py-3 text-amber-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Instructions */}
        {!isLoading && availableCount > 0 && (
          <p className=" text-sm">
            Click any available slot to proceed directly to payment.
          </p>
        )}

        {/* Legend */}
        {!isLoading && slots.length > 0 && (
          <Legend />
        )}

        {/* Slot grid */}
        {isLoading ? (
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse space-y-3">
                <div className="h-4  rounded w-24" />
                <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))' }}>
                  {Array.from({ length: 12 }).map((_, j) => (
                    <div key={j} className="h-14 /50 rounded-xl" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : slots.length === 0 ? (
          <div className="text-center py-20">
            <Car className="w-12 h-12 mx-auto text-slate-600 mb-3" />
            <p className=" font-medium">No slot data available for this location.</p>
            <button
              onClick={() => navigate('/explorer')}
              className="mt-4 text-violet-400 text-sm hover:underline"
            >
              ← Back to Explorer
            </button>
          </div>
        ) : availableCount === 0 ? (
          <div className="text-center py-16  border border-slate-700/30 rounded-2xl">
            <div className="text-4xl mb-3">🚫</div>
            <p className="text-white font-semibold">This location is full</p>
            <p className=" text-sm mt-1 mb-4">All {totalCount} slots are currently occupied.</p>
            <button
              onClick={() => navigate('/explorer')}
              className="bg-violet-600 hover:bg-violet-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            >
              Find Another Location
            </button>
          </div>
        ) : (
          <div className=" border border-slate-800/60 rounded-2xl p-5 space-y-7">
            {Object.entries(sections).map(([label, sectionSlots]) => (
              <SectionRow
                key={label}
                label={`Section ${label}`}
                slots={sectionSlots}
                onSlotClick={handleSlotClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
