import React from 'react';
import { Building2, MapPin as MapPinIcon } from 'lucide-react';
import { getSlotTypeLabel, getSlotTypeIcon, getSlotTypeColor } from '../utils/formatters';

const LocationSlotCard = ({ location, slotId, floor, slotType }) => {
  const SlotTypeIcon = getSlotTypeIcon(slotType);

  return (
    <div className="luxury-card p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-violet-light flex items-center justify-center border border-violet-muted/50">
            <Building2 className="w-7 h-7 text-violet" />
          </div>
          <div>
            <p className="text-label-sm font-medium text-on-surface-variant uppercase tracking-wider">PARKING LOCATION</p>
            <h3 className="text-headline-md font-bold text-on-surface">{location.name}</h3>
            <p className="text-label-md text-on-surface-variant flex items-center gap-1 mt-1">
              <MapPinIcon className="w-4 h-4" />
              {location.address}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6 sm:ml-auto">
          <div className="text-right border-l border-outline-variant/50 pl-6 hidden sm:block">
            <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">YOUR SLOT</p>
            <p className="text-2xl font-bold text-on-surface">{slotId}</p>
          </div>
          <div className="text-right">
            <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">FLOOR</p>
            <p className="text-lg font-bold text-on-surface flex items-center gap-1 justify-end">
              <MapPinIcon className="w-4 h-4 text-violet" />
              {floor}
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex items-center gap-2">
        <span className={`px-3 py-1.5 rounded-full text-label-sm font-semibold border ${getSlotTypeColor(slotType)}`}>
          <SlotTypeIcon className="w-4 h-4" />
          {getSlotTypeLabel(slotType)}
        </span>
      </div>
    </div>
  );
};

export default LocationSlotCard;