import React from 'react';
import { CreditCard, Apple, BadgeCheck, Smartphone, Radio } from 'lucide-react';

const getMethodIcon = (methodName) => {
  const name = methodName.toLowerCase();
  if (name.includes('upi')) return Smartphone;
  if (name.includes('credit') || name.includes('card')) return CreditCard;
  if (name.includes('debit')) return CreditCard;
  if (name.includes('apple')) return Apple;
  if (name.includes('saved')) return BadgeCheck;
  return Radio;
};

const PaymentMethodTabs = ({ selectedPaymentMethod, onPaymentMethodChange, paymentMethods = [], methodsLoading = false, methodsError = null }) => {
  if (methodsLoading) {
    return (
      <div className="luxury-card p-1 bg-surface-container-low rounded-2xl">
        <div className="flex gap-1" role="tablist">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1 h-12 bg-slate-700/50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (methodsError) {
    return (
      <div className="luxury-card p-4 bg-red-500/10 border border-red-500/30 rounded-2xl">
        <p className="text-red-400 text-sm text-center">Failed to load payment methods. Please refresh.</p>
      </div>
    );
  }

  if (!paymentMethods || paymentMethods.length === 0) {
    return (
      <div className="luxury-card p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
        <p className="text-amber-400 text-sm text-center">No payment methods available.</p>
      </div>
    );
  }

  return (
    <div className="luxury-card p-1 bg-surface-container-low rounded-2xl">
      <div className="flex gap-1" role="tablist">
        {paymentMethods.map((method) => {
          const Icon = getMethodIcon(method.methodName);
          return (
            <button
              key={method.methodId}
              role="tab"
              aria-selected={selectedPaymentMethod === String(method.methodId)}
              onClick={() => onPaymentMethodChange(String(method.methodId))}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-label-md font-semibold transition-all duration-200 ${
                selectedPaymentMethod === String(method.methodId)
                  ? 'bg-white text-violet shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <Icon className="w-4 h-4" />
              {method.methodName}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentMethodTabs;
