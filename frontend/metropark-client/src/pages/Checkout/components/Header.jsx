import React from 'react';
import { ArrowLeft, MapPin as MapPinIcon, Wallet as WalletIcon } from 'lucide-react';
import Timer from './Timer';

const Header = ({ locationId, onBackClick, onAddMoney }) => {
  return (
    <header className="relative z-10 sticky top-0 w-full bg-surface/95 backdrop-blur-xl border-b border-outline-variant/50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <button
              className="btn-luxury-icon p-2 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors"
              onClick={onBackClick}
              aria-label="Go back to map"
            >
              <ArrowLeft className="w-5 h-5 text-on-surface" />
            </button>
            <div>
              <span className="text-headline-sm font-bold text-on-surface">Metropark</span>
              <p className="text-label-sm text-on-surface-variant">Secure Checkout</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onAddMoney}
              className="inline-flex items-center gap-2 px-4 py-2 text-label-md font-semibold rounded-xl bg-violet text-on-violet shadow-luxury hover:bg-violet-hover hover:shadow-luxury-lg active:scale-[0.98] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2"
              aria-label="Add money to wallet"
            >
              <WalletIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Add Money to Wallet</span>
              <span className="sm:hidden">Add Money</span>
            </button>
            <Timer />
            <div className="w-9 h-9 rounded-full bg-violet-light flex items-center justify-center">
              <span className="text-label-md font-bold text-violet">U</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
