import { useState, useCallback } from 'react';
import { formatCardNumber, formatExpiry, formatCVC, getCardBrand } from '../utils/formatters';

export const useCardValidation = () => {
  const [cardFormData, setCardFormData] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
  });
  const [cardErrors, setCardErrors] = useState({});
  const [isCardFocused, setCardFocused] = useState({ number: false, expiry: false, cvc: false });

  const validateCard = useCallback(() => {
    const errors = {};
    const number = cardFormData.number.replace(/\s/g, '');
    const expiry = cardFormData.expiry;
    const cvc = cardFormData.cvc;
    const name = cardFormData.name.trim();

    if (!number || number.length < 15) {
      errors.number = 'Invalid card number';
    }
    if (!expiry || !/^\d{2}\/\d{2}$/.test(expiry)) {
      errors.expiry = 'Invalid expiry (MM/YY)';
    } else {
      const [month, year] = expiry.split('/').map(Number);
      const now = new Date();
      const currentYear = now.getFullYear() % 100;
      const currentMonth = now.getMonth() + 1;
      if (year < currentYear || (year === currentYear && month < currentMonth)) {
        errors.expiry = 'Card expired';
      }
    }
    if (!cvc || cvc.length < 3) {
      errors.cvc = 'Invalid CVC';
    }
    if (!name) {
      errors.name = 'Name required';
    }
    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  }, [cardFormData]);

  const handleCardChange = (field, value) => {
    let formattedValue = value;
    if (field === 'number') formattedValue = formatCardNumber(value);
    if (field === 'expiry') formattedValue = formatExpiry(value);
    if (field === 'cvc') formattedValue = formatCVC(value);
    
    setCardFormData(prev => ({ ...prev, [field]: formattedValue }));
    if (cardErrors[field]) {
      setCardErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  return {
    cardFormData,
    setCardFormData,
    cardErrors,
    isCardFocused,
    setCardFocused,
    validateCard,
    handleCardChange,
    getCardBrand: (number) => getCardBrand(number),
  };
};