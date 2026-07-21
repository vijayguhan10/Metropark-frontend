import React from 'react';
import { CheckCircle, ArrowRight as ArrowRightIcon, MapPin as MapPinIcon } from 'lucide-react';
import { formatCurrency, formatTime } from '../utils/formatters';

const SuccessModal = ({ 
  isOpen, 
  onClose, 
  onViewPass, 
  onFindAnotherSpot,
  slotId,
  location,
  duration,
  totalAmount,
  entryTime,
  animationState
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="fixed z-[70] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md mx-4 bg-surface-container-lowest rounded-3xl shadow-luxury-lg border border-outline-variant/50 p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success Animation */}
        <div className="relative mb-6">
          <div className={`w-20 h-20 bg-success-light text-success rounded-full flex items-center justify-center mx-auto ${animationState === 'success' ? 'animate-scale-in' : ''}`}>
            <CheckCircle className="w-10 h-10" style={{ fontVariationSettings: "'FILL' 1" }} />
          </div>
          {animationState === 'success' && (
            <div className="absolute inset-0 rounded-full border-4 border-success/30 animate-ping" />
          )}
        </div>
        
        <h3 className="text-headline-lg font-bold text-on-surface mb-2">Booking Confirmed!</h3>
        <p className="text-body-md text-on-surface-variant mb-6">
          Your spot <strong className="text-on-surface">{slotId}</strong> at <strong className="text-on-surface">{location.name}</strong> is now reserved.
        </p>
        
        <div className="luxury-card p-4 mb-6 text-left">
          <div className="flex justify-between text-label-md mb-2">
            <span className="text-on-surface-variant">Total Paid</span>
            <span className="font-bold text-on-surface">{formatCurrency(totalAmount)}</span>
          </div>
          <div className="flex justify-between text-label-md mb-2">
            <span className="text-on-surface-variant">Duration</span>
            <span className="font-medium text-on-surface">{duration} hours</span>
          </div>
          <div className="flex justify-between text-label-md">
            <span className="text-on-surface-variant">Entry Time</span>
            <span className="font-medium text-on-surface">{formatTime(entryTime)}</span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            className="btn-luxury-primary w-full py-4 text-lg bg-violet hover:bg-violet-hover"
            onClick={onViewPass}
          >
            View Digital Pass
            <ArrowRightIcon className="w-5 h-5" />
          </button>
          <button
            className="btn-luxury-outline w-full py-4 text-lg"
            onClick={onFindAnotherSpot}
          >
            <MapPinIcon className="w-5 h-5" />
            Find Another Spot
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;