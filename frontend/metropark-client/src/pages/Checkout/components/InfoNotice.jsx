import React from 'react';
import { Info } from 'lucide-react';

const InfoNotice = () => {
  return (
    <div className="luxury-card p-4 bg-violet-light/50 border-violet-muted/50">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-violet flex-shrink-0 mt-0.5" />
        <div className="text-label-md text-on-surface-variant">
          <p className="font-medium text-on-surface mb-1">Cancellation Policy</p>
          <p>Free cancellation up to 30 minutes before entry time. After that, a 50% fee applies.</p>
        </div>
      </div>
    </div>
  );
};

export default InfoNotice;