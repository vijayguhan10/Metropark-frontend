import React from 'react';
import { formatCurrency } from '../utils/formatters';

const PriceBreakdown = ({ duration, rate, baseAmount, serviceCharge, tax, totalAmount }) => {
  return (
    <div className="luxury-card p-4">
      <p className="text-label-sm font-medium text-on-surface-variant uppercase tracking-wider mb-3">PRICE BREAKDOWN</p>
      <div className="space-y-2">
        <div className="flex justify-between text-body-md">
          <span className="text-on-surface-variant">Parking ({duration}h × {formatCurrency(rate)}/hr)</span>
          <span className="font-medium text-on-surface">{formatCurrency(baseAmount)}</span>
        </div>
        <div className="flex justify-between text-body-md">
          <span className="text-on-surface-variant">Service Fee</span>
          <span className="font-medium text-on-surface">{formatCurrency(serviceCharge)}</span>
        </div>
        <div className="flex justify-between text-body-md">
          <span className="text-on-surface-variant">Tax (8%)</span>
          <span className="font-medium text-on-surface">{formatCurrency(tax)}</span>
        </div>
        <div className="pt-2.5 border-t border-outline-variant/50 flex justify-between items-center">
          <span className="text-headline-sm font-bold text-on-surface">Total</span>
          <span className="text-headline-md font-bold text-violet">{formatCurrency(totalAmount)}</span>
        </div>
      </div>
    </div>
  );
};

export default PriceBreakdown;
