import React from 'react';
import { DollarSign } from 'lucide-react';

const ProcessingModal = ({ isProcessing }) => {
  if (!isProcessing) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-surface-container-lowest rounded-3xl p-10 text-center max-w-sm mx-4 shadow-luxury-lg border border-outline-variant/50">
        <div className="w-16 h-16 mx-auto mb-6 relative">
          <div className="absolute inset-0 border-4 border-violet/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-violet rounded-full animate-spin border-t-transparent" />
          <div className="relative w-full h-full rounded-full bg-violet-light flex items-center justify-center">
            <DollarSign className="w-8 h-8 text-violet" />
          </div>
        </div>
        <h3 className="text-headline-md font-bold text-on-surface mb-2">Processing Payment</h3>
        <p className="text-body-md text-on-surface-variant">Please don't close this window</p>
      </div>
    </div>
  );
};

export default ProcessingModal;