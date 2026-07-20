import React from 'react';
import { Lock, Calendar, Shield, CreditCard } from 'lucide-react';

const CardPaymentForm = ({
  cardFormData,
  cardErrors,
  isCardFocused,
  handleCardChange,
  handleCardFocus,
  handleCardBlur,
  getCardBrand,
}) => {
  const cardBrand = getCardBrand(cardFormData.number);

  return (
    <div className="luxury-card p-6 space-y-6" role="tabpanel">
      <div className="flex items-center gap-2 text-label-sm text-on-surface-variant mb-2">
        <Lock className="w-4 h-4 text-violet" />
        <span>Secured by Stripe • PCI DSS Level 1 Certified</span>
      </div>

      {/* Card Number */}
      <div>
        <label htmlFor="card-number" className="block text-label-sm font-medium text-on-surface-variant mb-2">
          Card Number
        </label>
        <div className="relative">
          <input
            id="card-number"
            type="tel"
            autoComplete="cc-number"
            value={cardFormData.number}
            onChange={(e) => handleCardChange('number', e.target.value)}
            onFocus={() => handleCardFocus('number')}
            onBlur={() => handleCardBlur('number')}
            placeholder="4242 4242 4242 4242"
            className={`input-luxury w-full py-3.5 pl-4 pr-12 text-lg font-mono tracking-wider ${
              cardErrors.number ? 'border-error focus:border-error focus:ring-error/20' : 
              isCardFocused.number ? 'border-violet focus:border-violet focus:ring-violet/20' : ''
            }`}
            inputMode="numeric"
            maxLength={19}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {cardBrand !== 'unknown' && (
              <span className="font-bold text-violet uppercase text-xs tracking-wider">
                {cardBrand.toUpperCase()}
              </span>
            )}
            <Lock className="w-4 h-4 text-on-surface-variant/50" />
          </div>
        </div>
        {cardErrors.number && (
          <p className="mt-1.5 text-label-sm text-error flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-error flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
            </span>
            {cardErrors.number}
          </p>
        )}
      </div>

      {/* Expiry & CVC */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="card-expiry" className="block text-label-sm font-medium text-on-surface-variant mb-2">
            Expiry Date
          </label>
          <div className="relative">
            <input
              id="card-expiry"
              type="tel"
              autoComplete="cc-exp"
              value={cardFormData.expiry}
              onChange={(e) => handleCardChange('expiry', e.target.value)}
              onFocus={() => handleCardFocus('expiry')}
              onBlur={() => handleCardBlur('expiry')}
              placeholder="MM/YY"
              className={`input-luxury w-full py-3.5 pl-4 pr-10 text-lg font-mono tracking-wider ${
                cardErrors.expiry ? 'border-error focus:border-error focus:ring-error/20' : 
                isCardFocused.expiry ? 'border-violet focus:border-violet focus:ring-violet/20' : ''
              }`}
              inputMode="numeric"
              maxLength={5}
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/50" />
          </div>
          {cardErrors.expiry && (
            <p className="mt-1.5 text-label-sm text-error flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-error flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              </span>
              {cardErrors.expiry}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="card-cvc" className="block text-label-sm font-medium text-on-surface-variant mb-2">
            CVC
          </label>
          <div className="relative">
            <input
              id="card-cvc"
              type="tel"
              autoComplete="cc-csc"
              value={cardFormData.cvc}
              onChange={(e) => handleCardChange('cvc', e.target.value)}
              onFocus={() => handleCardFocus('cvc')}
              onBlur={() => handleCardBlur('cvc')}
              placeholder="123"
              className={`input-luxury w-full py-3.5 pl-4 text-lg font-mono tracking-wider ${
                cardErrors.cvc ? 'border-error focus:border-error focus:ring-error/20' : 
                isCardFocused.cvc ? 'border-violet focus:border-violet focus:ring-violet/20' : ''
              }`}
              inputMode="numeric"
              maxLength={4}
            />
            <Shield className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/50" />
          </div>
          {cardErrors.cvc && (
            <p className="mt-1.5 text-label-sm text-error flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-error flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              </span>
              {cardErrors.cvc}
            </p>
          )}
        </div>
      </div>

      {/* Cardholder Name */}
      <div>
        <label htmlFor="card-name" className="block text-label-sm font-medium text-on-surface-variant mb-2">
          Cardholder Name
        </label>
        <input
          id="card-name"
          type="text"
          autoComplete="cc-name"
          value={cardFormData.name}
          onChange={(e) => handleCardChange('name', e.target.value)}
          placeholder="John Doe"
          className={`input-luxury w-full py-3.5 pl-4 text-lg ${
            cardErrors.name ? 'border-error focus:border-error focus:ring-error/20' : ''
          }`}
        />
        {cardErrors.name && (
          <p className="mt-1.5 text-label-sm text-error flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-error flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
            </span>
            {cardErrors.name}
          </p>
        )}
      </div>

      {/* Save card checkbox */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          className="w-4 h-4 rounded border-outline-variant/50 text-violet focus:ring-violet/20"
        />
        <span className="text-label-md text-on-surface-variant">Save this card for future bookings</span>
      </label>
    </div>
  );
};

export default CardPaymentForm;