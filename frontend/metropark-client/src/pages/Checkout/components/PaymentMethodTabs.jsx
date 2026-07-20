import React from 'react';
import { CreditCard, Apple, BadgeCheck } from 'lucide-react';

const PaymentMethodTabs = ({ selectedPaymentMethod, onPaymentMethodChange }) => {
  const methods = [
    { id: 'card', label: 'Card', icon: CreditCard },
    { id: 'apple_pay', label: 'Apple Pay', icon: Apple },
    { id: 'saved', label: 'Saved', icon: BadgeCheck },
  ];

  return (
    <div className="luxury-card p-1 bg-surface-container-low rounded-2xl">
      <div className="flex gap-1" role="tablist">
        {methods.map((method) => (
          <button
            key={method.id}
            role="tab"
            aria-selected={selectedPaymentMethod === method.id}
            onClick={() => onPaymentMethodChange(method.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-label-md font-semibold transition-all duration-200 ${
              selectedPaymentMethod === method.id
                ? 'bg-white text-violet shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <method.icon className="w-4 h-4" />
            {method.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PaymentMethodTabs;