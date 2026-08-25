import React from 'react';
import { Building2, MapPin as MapPinIcon, Car } from 'lucide-react';
import { getSlotTypeLabel, getSlotTypeColor } from '../utils/formatters';

const LocationSlotCard = ({ location, slotId, floor, slotType }) => {

  return (
    <div className="luxury-card p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-violet-light flex items-center justify-center border border-violet-muted/50">
            <Building2 className="w-6 h-6 text-violet" />
          </div>
          <div>
            <p className="text-label-sm font-medium text-on-surface-variant uppercase tracking-wider">PARKING LOCATION</p>
            <h3 className="text-headline-sm font-bold text-on-surface">{location.name}</h3>
            <p className="text-label-md text-on-surface-variant flex items-center gap-1 mt-0.5">
              <MapPinIcon className="w-4 h-4" />
              {location.address}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-5 sm:ml-auto">
          <div className="text-right border-l border-outline-variant/50 pl-5 hidden sm:block">
            <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">YOUR SLOT</p>
            <p className="text-xl font-bold text-on-surface">{slotId}</p>
          </div>
          <div className="text-right">
            <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">FLOOR</p>
            <p className="text-base font-bold text-on-surface flex items-center gap-1 justify-end">
              <MapPinIcon className="w-4 h-4 text-violet" />
              {floor}
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-3 flex items-center gap-2">
        <span className={`px-3 py-1.5 rounded-full text-label-sm font-semibold border ${getSlotTypeColor(slotType)}`}>
          <Car className="w-4 h-4" />
          {getSlotTypeLabel(slotType)}
        </span>
      </div>
    </div>
  );
};

export default LocationSlotCard;
