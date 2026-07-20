import React from 'react';
import { Car, Zap } from 'lucide-react';

const VehicleCard = ({ vehicle }) => {
  return (
    <div className="luxury-card p-6">
      <p className="text-label-sm font-medium text-on-surface-variant uppercase tracking-wider mb-4">YOUR VEHICLE</p>
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-surface-container-low flex items-center justify-center border border-outline-variant/50">
          <Car className="w-7 h-7 text-on-surface-variant" />
        </div>
        <div>
          <p className="text-title-md font-bold text-on-surface">{vehicle.make} {vehicle.model}</p>
          <p className="text-label-md text-on-surface-variant">{vehicle.licensePlate} • {vehicle.color}</p>
          {vehicle.isElectric && (
            <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-violet-light text-violet text-label-sm font-medium">
              <Zap className="w-3 h-3" />
              Electric Vehicle
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;