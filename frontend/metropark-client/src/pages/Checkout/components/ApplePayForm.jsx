import React from 'react';
import { Apple, Lock } from 'lucide-react';

const ApplePayForm = () => {
  return (
    <div className="luxury-card p-6 text-center" role="tabpanel">
      <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-on-surface flex items-center justify-center">
        <Apple className="w-10 h-10 text-on-surface" />
      </div>
      <h3 className="text-headline-sm font-bold text-on-surface mb-2">Pay with Apple Pay</h3>
      <p className="text-body-md text-on-surface-variant mb-6">
        Use Face ID, Touch ID, or your passcode to complete the payment securely.
      </p>
      <button className="w-full py-4 px-6 rounded-xl bg-on-surface text-on-surface-container font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
        <Apple className="w-5 h-5" />
        Pay with Apple Pay
      </button>
      <p className="mt-4 text-label-sm text-on-surface-variant flex items-center justify-center gap-1">
        <Lock className="w-3 h-3" />
        Your card details are never shared with Metropark
      </p>
    </div>
  );
};

export default ApplePayForm;