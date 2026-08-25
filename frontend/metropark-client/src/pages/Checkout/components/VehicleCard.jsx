import React from 'react';
import { Car, Zap, CheckCircle, Loader2 } from 'lucide-react';

const VehicleCard = ({ 
  vehicles = [], 
  selectedVehicleId, 
  onSelectVehicle, 
  isLoading = false, 
  error = null,
  vehicle // Fallback for single vehicle prop
}) => {
  const vehicleList = vehicles.length > 0 ? vehicles : (vehicle ? [vehicle] : []);

  return (
    <div className="luxury-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-on-surface font-semibold text-base flex items-center gap-2">
          <Car className="w-5 h-5 text-primary" />
          Select Vehicle
        </h3>
        {vehicleList.length > 0 && (
          <span className="text-xs text-on-surface-variant font-medium">
            {vehicleList.length} {vehicleList.length === 1 ? 'vehicle' : 'vehicles'} registered
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
          <span className="text-body-md text-on-surface-variant">Loading your vehicles...</span>
        </div>
      ) : error ? (
        <div className="text-sm text-error bg-error-light p-3 rounded-xl">
          {error}
        </div>
      ) : vehicleList.length === 0 ? (
        <div className="text-center py-6 bg-surface-container-low rounded-xl border border-dashed border-outline-variant">
          <Car className="w-8 h-8 text-on-surface-variant mx-auto mb-2 opacity-50" />
          <p className="text-sm text-on-surface-variant">No vehicles found in your account.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
          {vehicleList.map((v) => {
            const vId = String(v.vehicleId || v.id || v.vehicle_id);
            const isSelected = String(selectedVehicleId) === vId;
            const makeModel = (v.make && v.model) ? `${v.make} ${v.model}` : (v.vehicleNumber || v.licensePlate || v.license_plate || `Vehicle #${vId}`);
            const plate = v.vehicleNumber || v.licensePlate || v.license_plate || v.vehicle_number || '';
            const isEV = v.isElectric || v.is_electric;

            return (
              <button
                key={vId}
                type="button"
                onClick={() => onSelectVehicle && onSelectVehicle(vId)}
                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start justify-between ${
                  isSelected
                    ? 'bg-primary-light/40 border-2 border-primary shadow-sm'
                    : 'bg-surface-container-low border-outline-variant/50 hover:border-primary/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'
                  }`}>
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-on-surface text-sm">{makeModel}</p>
                    {plate && <p className="text-xs text-on-surface-variant font-mono mt-0.5">{plate}</p>}
                    {isEV && (
                      <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-violet-light text-violet text-[10px] font-medium">
                        <Zap className="w-3 h-3" />
                        Electric
                      </span>
                    )}
                  </div>
                </div>
                {isSelected && (
                  <CheckCircle className="w-5 h-5 text-primary shrink-0 ml-2 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VehicleCard;
