import React from 'react';
import { CreditCard, Apple, CheckCircle } from 'lucide-react';

const SavedPaymentMethods = ({ paymentMethods, selectedSavedMethod, onSelectMethod }) => {
  return (
    <div className="luxury-card p-6 space-y-3" role="tabpanel">
      <p className="text-label-md font-medium text-on-surface-variant">SELECT SAVED METHOD</p>
      {paymentMethods.map((method) => (
        <label
          key={method.id}
          className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
            selectedSavedMethod === method.id
              ? 'border-violet bg-violet-light/50'
              : 'border-outline-variant/50 hover:border-violet-muted bg-surface'
          }`}
        >
          <input
            type="radio"
            name="saved-payment"
            value={method.id}
            checked={selectedSavedMethod === method.id}
            onChange={(e) => onSelectMethod(e.target.value)}
            className="hidden"
          />
          <div className="flex items-center gap-4 w-full">
            {method.type === 'visa' ? (
              <div className="w-12 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center relative">
                <CreditCard className="w-5 h-5 text-white" />
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-white rounded-tr-full" />
              </div>
            ) : (
              <div className="w-12 h-8 rounded-lg bg-on-surface flex items-center justify-center">
                <Apple className="w-5 h-5 text-on-surface" />
              </div>
            )}
            <div className="flex-1">
              <div className="text-label-md font-bold text-on-surface">
                {method.type === 'visa' ? `Visa ending in ${method.last4}` : 'Apple Pay'}
              </div>
              {method.expiry && (
                <div className="text-label-sm text-on-surface-variant">Expires {method.expiry}</div>
              )}
            </div>
            {selectedSavedMethod === method.id && (
              <CheckCircle className="w-5 h-5 text-violet" style={{ fontVariationSettings: "'FILL' 1" }} />
            )}
          </div>
        </label>
      ))}
    </div>
  );
};

export default SavedPaymentMethods;