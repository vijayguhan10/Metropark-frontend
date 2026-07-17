import React, { useState, useMemo, useEffect } from "react";
import {
  ArrowLeft,
  MapPin,
  Car,
  BatteryCharging,
  Maximize,
  ShieldCheck,
  Check,
  ChevronDown,
  Navigation,
  Zap,
  Expand,
} from "lucide-react";

// --- MOCK DATA ---
export const parkingLocations = [
  {
    id: "loc_001",
    name: "Metropolitan Square",
    address: "142 Industrial Blvd, Zone A",
    image:"https://images.crunchbase.com/image/upload/c_pad,h_256,w_256,f_auto,q_auto:eco,dpr_1/py3k8t1ffgyhnveafakn?ik-sanitizeSvg=true",
    pricePerHour: 4.5,
    availableSlots: 12,
    totalSlots: 50,
    features: ["EV Charging", "24/7 Access", "Security"],
    coordinates: { lat: 37.7749, lng: -122.4194 },
    rating: 4.5,
    totalReviews: 234,
    floors: 5,
    hasEVCharging: true,
    hasValet: false,
    isOpen24h: true,
  },
];

export const floorPlans = {
  loc_001: {
    floors: [
      {
        id: "floor_1",
        name: "1st Floor",
        sections: ["A", "B", "C", "D"],
        slots: [
          { id: "A-1", section: "A", status: "available", type: "standard" },
          { id: "A-2", section: "A", status: "available", type: "standard" },
          { id: "A-3", section: "A", status: "available", type: "standard" },
          { id: "A-4", section: "A", status: "occupied", type: "standard" },
          { id: "B-1", section: "B", status: "available", type: "standard" },
          { id: "B-2", section: "B", status: "available", type: "standard" },
          { id: "B-3", section: "B", status: "occupied", type: "standard" },
          { id: "B-4", section: "B", status: "occupied", type: "standard" },
          { id: "C-1", section: "C", status: "available", type: "compact" },
          { id: "C-2", section: "C", status: "occupied", type: "compact" },
          { id: "D-1", section: "D", status: "available", type: "oversize" },
          { id: "D-2", section: "D", status: "available", type: "oversize" },
        ],
      },
      {
        id: "floor_2",
        name: "2nd Floor",
        sections: ["A", "B", "C", "D"],
        slots: [
          { id: "A-101", section: "A", status: "available", type: "ev" },
          { id: "A-102", section: "A", status: "available", type: "ev" },
          { id: "A-103", section: "A", status: "occupied", type: "ev" },
          { id: "A-104", section: "A", status: "available", type: "ev" },
          { id: "B-101", section: "B", status: "available", type: "standard" },
          { id: "B-102", section: "B", status: "occupied", type: "standard" },
          { id: "B-103", section: "B", status: "available", type: "standard" },
          { id: "B-104", section: "B", status: "available", type: "standard" },
        ],
      },
    ],
  },
};

// --- COMPONENTS ---

const getSlotIcon = (type, size = 20, strokeWidth = 1.5, className = "") => {
  switch (type) {
    case "ev":
      return <Zap size={size} strokeWidth={strokeWidth} className={className} />;
    case "oversize":
      return <Expand size={size} strokeWidth={strokeWidth} className={className} />;
    case "compact":
      return <Car size={size} strokeWidth={strokeWidth} className={className} />;
    default:
      return <Car size={size} strokeWidth={strokeWidth} className={className} />;
  }
};

const getSlotTypeLabel = (type) => {
  const labels = {
    standard: "Standard",
    compact: "Compact",
    ev: "EV",
    oversize: "Oversize",
  };
  return labels[type] || type;
};

const getSlotTypeColor = (type) => {
  const colors = {
    standard: "bg-blue-100 text-blue-700 border-blue-200",
    compact: "bg-amber-100 text-amber-700 border-amber-200",
    ev: "bg-emerald-100 text-emerald-700 border-emerald-200",
    oversize: "bg-purple-100 text-purple-700 border-purple-200",
  };
  return colors[type] || "bg-gray-100 text-gray-700 border-gray-200";
};

const SlotCard = ({ slot, isSelected, onClick, index }) => {
  const isAvailable = slot.status === "available";
  const isOccupied = slot.status === "occupied";

  // Base styles - COMPACT VERSION
  const baseStyles = `
    relative flex flex-col items-center justify-between 
    h-32 py-2.5 px-2 border-2 rounded-lg 
    transition-all duration-200 ease-out cursor-pointer
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1
  `;

  let containerClasses = baseStyles;
  let textClasses = "text-xs font-semibold tracking-wider text-center w-full ";
  let iconClasses = "flex-1 flex items-center justify-center w-full transition-all duration-200 ";
  let badgeClasses = "text-[9px] uppercase tracking-widest font-medium px-1.5 py-0.5 rounded ";

  if (isSelected) {
    containerClasses += " border-primary bg-primary/5 shadow-md shadow-primary/10 scale-[1.015] z-10";
    textClasses += "text-primary";
    iconClasses += "text-primary";
    badgeClasses += "bg-primary/10 text-primary border-primary/20";
  } else if (isAvailable) {
    containerClasses += " border-gray-200 bg-white hover:border-primary/50 hover:bg-primary/5 hover:shadow-sm hover:shadow-primary/5";
    textClasses += "text-gray-900";
    iconClasses += "text-gray-600";
    badgeClasses += "bg-gray-100 text-gray-500 border-gray-200";
  } else if (isOccupied) {
    containerClasses += " border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed";
    textClasses += "text-gray-400";
    iconClasses += "text-gray-300";
    badgeClasses += "bg-gray-100 text-gray-400 border-gray-200";
  }

  // Staggered animation delay
  const style = {
    animationDelay: `${index * 20}ms`,
    animationFillMode: 'both',
  };

  return (
    <div
      onClick={() => isAvailable && onClick(slot)}
      className={containerClasses}
      style={style}
      role="button"
      tabIndex={isAvailable ? 0 : -1}
      onKeyDown={(e) => {
        if (isAvailable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick(slot);
        }
      }}
      aria-label={`Parking space ${slot.id}, ${getSlotTypeLabel(slot.type)}, ${isAvailable ? 'Available' : 'Occupied'}`}
      aria-pressed={isSelected}
    >
      <span className={textClasses}>{slot.id}</span>

      <div className={iconClasses}>
        {isAvailable && !isSelected ? (
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[9px] font-medium uppercase tracking-[0.1em] text-gray-400">
              Free
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        ) : (
          getSlotIcon(slot.type, 22, 1.5)
        )}
      </div>

      <span className={badgeClasses}>
        {getSlotTypeLabel(slot.type)}
      </span>

      {isSelected && (
        <div className="absolute top-1.5 right-1.5">
          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-sm">
            <Check size={10} className="text-white" />
          </div>
        </div>
      )}

      {/* Subtle selection ring animation */}
      {isSelected && (
        <div className="absolute inset-0 rounded-lg border border-primary/30 animate-ping" aria-hidden="true" />
      )}
    </div>
  );
};

// Section Header Component - COMPACT
const SectionHeader = ({ sectionKey, slots, isLeftColumn }) => {
  const availableCount = slots.filter((s) => s.status === "available").length;
  const totalCount = slots.length;

  return (
    <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
      <div className="flex items-center gap-1.5">
        <div className={`w-6 h-6 rounded flex items-center justify-center ${
          isLeftColumn ? 'bg-primary/10 text-primary' : 'bg-emerald/10 text-emerald'
        }`}>
          <span className="text-xs font-bold">{sectionKey}</span>
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900">Section {sectionKey}</h3>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">
            {availableCount}/{totalCount} free
          </p>
        </div>
      </div>
      {/* Visual indicator bar - compact */}
      <div className="w-24 h-0.5 bg-gray-100 rounded-full overflow-hidden ml-2">
        <div 
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${(availableCount / totalCount) * 100}%` }}
        />
      </div>
    </div>
  );
};

// Floor Selector Component - COMPACT
const FloorSelector = ({ floors, selectedIndex, onSelect }) => {
  return (
    <div className="flex items-center gap-0.5 bg-gray-100 p-0.5 rounded-lg border border-gray-200">
      {floors.map((floor, index) => (
        <button
          key={floor.id}
          onClick={() => onSelect(index)}
          className={`relative px-4 py-2 rounded text-xs font-semibold transition-all duration-150 ${
            selectedIndex === index
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
          }`}
          aria-current={selectedIndex === index ? 'step' : undefined}
        >
          {floor.name}
          {selectedIndex === index && (
            <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
          )}
        </button>
      ))}
    </div>
  );
};

// Driveway Indicator Component - COMPACT
const DrivewayIndicator = ({ label, icon, position }) => {
  return (
    <div className="flex items-center justify-center gap-3 my-5">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200/50 shadow-sm">
        {icon && <icon size={12} className="text-gray-400" />}
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 whitespace-nowrap">
          {label}
        </span>
      </div>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
    </div>
  );
};

// Legend Component - COMPACT
const Legend = () => {
  const items = [
    { type: 'standard', label: 'Standard', color: 'bg-blue-500' },
    { type: 'compact', label: 'Compact', color: 'bg-amber-500' },
    { type: 'ev', label: 'EV', color: 'bg-emerald-500' },
    { type: 'oversize', label: 'Oversize', color: 'bg-purple-500' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50/50 rounded-lg border border-gray-100 mb-4">
      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mr-1">Legend:</span>
      {items.map((item) => (
        <div key={item.type} className="flex items-center gap-1">
          <div className={`w-2.5 h-2.5 rounded ${item.color}`} />
          <span className="text-[10px] text-gray-600">{item.label}</span>
        </div>
      ))}
      <div className="flex items-center gap-1 ml-1 border-l border-gray-200 pl-2">
        <div className="w-5 h-5 border border-gray-300 rounded flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </div>
        <span className="text-[10px] text-gray-600">Free</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-5 h-5 border border-gray-200 rounded bg-gray-50 flex items-center justify-center">
          <div className="w-3 h-3 rounded bg-gray-300" />
        </div>
        <span className="text-[10px] text-gray-600">Taken</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-5 h-5 border border-primary rounded bg-primary/5 flex items-center justify-center">
          <Check size={8} className="text-primary" />
        </div>
        <span className="text-[10px] text-gray-600">Selected</span>
      </div>
    </div>
  );
};

export default function SlotMapWebPanel() {
  const locationId = "loc_001";
  const location = parkingLocations.find((l) => l.id === locationId);
  const floorData = floorPlans[locationId];

  const [selectedFloorIndex, setSelectedFloorIndex] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const currentFloor = floorData.floors[selectedFloorIndex];

  // Group slots by section for layout
  const groupedSlots = useMemo(() => {
    const groups = {};
    currentFloor.sections.forEach((section) => {
      groups[section] = currentFloor.slots.filter((s) => s.section === section);
    });
    return groups;
  }, [currentFloor]);

  // Trigger load animation
  useEffect(() => {
    setIsLoaded(false);
    const timer = setTimeout(() => setIsLoaded(true), 50);
    return () => clearTimeout(timer);
  }, [selectedFloorIndex]);

  const handleSlotSelection = (slot) => {
    setSelectedSlot(slot.id === selectedSlot?.id ? null : slot);
  };

  const handleFloorChange = (index) => {
    setSelectedFloorIndex(index);
    setSelectedSlot(null);
  };

  // Calculate stats
  const totalSlots = currentFloor.slots.length;
  const availableSlots = currentFloor.slots.filter(s => s.status === 'available').length;
  const occupiedSlots = currentFloor.slots.filter(s => s.status === 'occupied').length;

  return (
    <div className="flex h-screen w-full bg-gray-50 text-gray-900  overflow-hidden">
      {/* LEFT CONTENT: Map Area */}
      <div className="flex-1 flex flex-col h-full bg-white border-r border-gray-100">
        {/* Header - COMPACT */}
        <header className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-100 text-gray-500 hover:text-gray-900"
              aria-label="Go back"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-gray-900">
                {location.name}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1 uppercase tracking-wider">
                <MapPin size={11} className="flex-shrink-0" /> {location.address}
              </p>
            </div>
          </div>

          {/* Floor Navigation - COMPACT */}
          <FloorSelector 
            floors={floorData.floors} 
            selectedIndex={selectedFloorIndex} 
            onSelect={handleFloorChange} 
          />
        </header>

        {/* Stats Bar - COMPACT */}
        <div className="px-5 py-3 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-gray-600">{availableSlots} Free</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
              <span className="text-gray-600">{occupiedSlots} Taken</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-gray-600">{totalSlots} Total</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
            <Navigation size={11} />
            <span>L{selectedFloorIndex + 1}/{floorData.floors.length}</span>
          </div>
        </div>

        {/* Map Grid Container */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 custom-scrollbar">
          <div className="max-w-6xl mx-auto relative">
            {/* Legend - COMPACT */}
            <Legend />

            {/* Top Driveway Indicator - COMPACT */}
            <DrivewayIndicator 
              label="Entry" 
              icon={Navigation} 
              position="top" 
            />

            {/* 2x2 Grid Layout for Sections - COMPACT GAPS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-5">
              {/* Loop through sections to maintain specific layout */}
              {currentFloor.sections.map((sectionKey, sectionIndex) => {
                const slots = groupedSlots[sectionKey];
                if (!slots || slots.length === 0) return null;

                const isLeftColumn = sectionIndex % 2 === 0;

                return (
                  <div 
                    key={sectionKey} 
                    className={`flex flex-col animate-fade-in-up ${isLoaded ? '' : 'opacity-0'}`}
                    style={{ animationDelay: `${sectionIndex * 80}ms` }}
                  >
                    <SectionHeader 
                      sectionKey={sectionKey} 
                      slots={slots} 
                      isLeftColumn={isLeftColumn} 
                    />

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {slots.map((slot, slotIndex) => (
                        <SlotCard
                          key={slot.id}
                          slot={slot}
                          isSelected={selectedSlot?.id === slot.id}
                          onClick={handleSlotSelection}
                          index={slotIndex}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Driveway Indicator - COMPACT */}
            <DrivewayIndicator 
              label="Exit" 
              icon={Navigation} 
              position="bottom" 
            />
          </div>
        </div>
      </div>

      {/* RIGHT CONTENT: Booking Sidebar - COMPACT */}
      <div className="w-[360px] h-full bg-white flex flex-col z-10 relative hidden lg:flex">
        {/* Sidebar Image Cover - REDUCED HEIGHT */}
        <div className="h-35 w-full  overflow-hidden">
          <img
            src={location.image}
            alt={location.name}
            className="-w-0px h-full object-cover transition-all duration-700 ease-out hover:scale-105"
          />
          <div className="absolute inset-0  to-transparent" />
          {/* Floor indicator badge on image */}
          <div className="absolute bottom-3 left-3 right-3 flex justify-between">
            <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg border border-gray-100">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Floor</p>
              <p className="text-sm font-bold text-gray-900">{currentFloor.name}</p>
            </div>
            <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg border border-gray-100 text-right">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Free</p>
              <p className="text-sm font-bold text-emerald-600">{availableSlots}</p>
            </div>
          </div>
        </div>

        {/* Sidebar Content - COMPACT */}
        <div className="flex-1 flex flex-col px-3 pb-3 -mt-4 relative z-10">
          {/* Rate & Status Card - COMPACT */}
          <div className="bg-white p-3 border border-gray-100 rounded-lg shadow-sm mb-3 flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Hourly Rate</p>
                <p className="text-lg font-bold text-gray-900">
                  ${location.pricePerHour.toFixed(2)}
                  <span className="text-xs font-normal text-gray-500">/hr</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Status</p>
              <div className="flex items-center gap-1 justify-end">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-xs font-semibold text-emerald-600">Open</p>
              </div>
            </div>
          </div>

          {/* Features Badges - COMPACT */}
          <div className="flex flex-wrap gap-1 mb-3">
            {location.features.map((feature) => (
              <span 
                key={feature} 
                className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-gray-50 text-gray-600 border border-gray-100"
              >
                {feature}
              </span>
            ))}
          </div>

          <div className="flex-1 min-h-0">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-1.5 mb-3">
              Reservation Summary
            </h3>

            {selectedSlot ? (
              <div className="space-y-3 animate-fade-in-up">
                <div className="bg-gray-50/50 rounded-lg p-2.5 border border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Selected Space</p>
                      <p className="text-lg font-bold text-gray-900">{selectedSlot.id}</p>
                    </div>
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Check size={14} className="text-primary" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <div className="bg-white p-2.5 rounded-lg border border-gray-100">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Floor</p>
                    <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                      <Navigation size={11} className="text-gray-400" />
                      {currentFloor.name}
                    </p>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-gray-100">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Type</p>
                    <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                      {getSlotIcon(selectedSlot.type, 12, 2, 'text-primary')}
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${getSlotTypeColor(selectedSlot.type)}`}>
                        {getSlotTypeLabel(selectedSlot.type)}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Price estimate - COMPACT */}
                <div className="bg-primary/5 border border-primary/10 rounded-lg p-2.5">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-primary uppercase tracking-wider mb-0.5">Est. Cost</p>
                      <p className="text-sm font-bold text-primary">${location.pricePerHour.toFixed(2)}/hr</p>
                    </div>
                    <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                      <ArrowLeft size={14} className="text-white rotate-180" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-36 flex flex-col items-center justify-center text-center text-gray-400 border-2 border-dashed border-gray-200 bg-gray-50/50 rounded-lg p-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mb-2">
                  <Car size={20} className="text-gray-300" />
                </div>
                <p className="text-[10px] font-medium text-gray-600 mb-0.5">No Space Selected</p>
                <p className="text-[9px] text-gray-400 max-w-xs">
                  Tap an available space on the map to view details and continue.
                </p>
              </div>
            )}
          </div>

          {/* Action Button - COMPACT */}
          <div className="pt-2 border-t absolute bottom-30 left-10 right-0 border-gray-100">
            <button
              disabled={!selectedSlot}
              className={`w-full py-2.5 px-3 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 ${
                selectedSlot
                  ? "bg-gray-900 text-white hover:bg-black hover:shadow-lg hover:shadow-gray-900/20 active:scale-[0.98]"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {selectedSlot ? "Proceed to Checkout" : "Select a Space"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
