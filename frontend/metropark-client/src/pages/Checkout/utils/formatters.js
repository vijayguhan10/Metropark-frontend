export const formatCurrency = (amount) => `$${amount.toFixed(2)}`;

export const getSlotTypeLabel = (type) => {
  const labels = {
    standard: 'Standard',
    compact: 'Compact',
    ev: 'EV Charging',
    oversize: 'Oversize',
  };
  return labels[type] || type;
};

export const getSlotTypeIcon = (type) => {
  switch (type) {
    case 'ev': return 'ev';
    case 'oversize': return 'oversize';
    case 'compact': return 'compact';
    default: return 'standard';
  }
};

export const getSlotTypeColor = (type) => {
  const colors = {
    standard: 'bg-violet-light text-violet border-violet-muted',
    compact: 'bg-amber-100 text-amber-700 border-amber-200',
    ev: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    oversize: 'bg-purple-100 text-purple-700 border-purple-200',
  };
  return colors[type] || 'bg-gray-100 text-gray-700 border-gray-200';
};

export const formatTime = (date) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
};

export const formatDate = (date) => {
  return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
};

export const parseTimeInput = (timeStr, baseDate) => {
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (modifier === 'PM' && hours !== 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;
  const date = new Date(baseDate);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

export const formatTimeForInput = (date) => {
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const modifier = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours.toString().padStart(2, '0')}:${minutes} ${modifier}`;
};

export const formatCardNumber = (value) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  const matches = v.match(/\d{4,16}/g);
  const match = matches && matches[0] || '';
  const parts = [];
  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }
  if (parts.length) {
    return parts.join(' ');
  }
  return value;
};

export const formatExpiry = (value) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  if (v.length >= 2) {
    return v.substring(0, 2) + '/' + v.substring(2, 4);
  }
  return v;
};

export const formatCVC = (value) => {
  return value.replace(/\s+/g, '').replace(/[^0-9]/gi, '').substring(0, 4);
};

export const getCardBrand = (number) => {
  const num = number.replace(/\s/g, '');
  if (/^4/.test(num)) return 'visa';
  if (/^5[1-5]/.test(num)) return 'mastercard';
  if (/^3[47]/.test(num)) return 'amex';
  if (/^6/.test(num)) return 'discover';
  return 'unknown';
};