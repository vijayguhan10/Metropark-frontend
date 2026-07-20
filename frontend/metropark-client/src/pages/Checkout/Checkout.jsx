import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CreditCard,
  CheckCircle,
  Timer,
  BadgeCheck,
  Shield,
  Receipt,
  MapPin,
  Clock,
  Car,
  X,
  ChevronDown,
  ChevronUp,
  Lock,
  Check,
  Loader2,
  Apple,
  Zap,
  Building2,
  MapPin as MapPinIcon,
  Calendar,
  DollarSign,
  ArrowRight as ArrowRightIcon,
  Edit2,
  AlertCircle,
  Info,
  Minus,
  Plus,
} from 'lucide-react';
import { parkingLocations, vehicles, paymentMethods, user } from '../../data/mockData';

const formatCurrency = (amount) => `$${amount.toFixed(2)}`;

const getSlotTypeLabel = (type) => {
  const labels = {
    standard: 'Standard',
    compact: 'Compact',
    ev: 'EV Charging',
    oversize: 'Oversize',
  };
  return labels[type] || type;
};

const getSlotTypeIcon = (type) => {
  switch (type) {
    case 'ev': return <Zap className="w-4 h-4" />;
    case 'oversize': return <Building2 className="w-4 h-4" />;
    case 'compact': return <Car className="w-4 h-4" />;
    default: return <Car className="w-4 h-4" />;
  }
};

const getSlotTypeColor = (type) => {
  const colors = {
    standard: 'bg-violet-light text-violet border-violet-muted',
    compact: 'bg-amber-100 text-amber-700 border-amber-200',
    ev: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    oversize: 'bg-purple-100 text-purple-700 border-purple-200',
  };
  return colors[type] || 'bg-gray-100 text-gray-700 border-gray-200';
};

const formatTime = (date) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
};

const formatDate = (date) => {
  return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
};

const parseTimeInput = (timeStr, baseDate) => {
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (modifier === 'PM' && hours !== 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;
  const date = new Date(baseDate);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const formatTimeForInput = (date) => {
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const modifier = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours.toString().padStart(2, '0')}:${minutes} ${modifier}`;
};

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get URL parameters
  const locationId = searchParams.get('location');
  const slotId = searchParams.get('slot');
  const floor = searchParams.get('floor');
  const slotType = searchParams.get('type');
  const rate = parseFloat(searchParams.get('rate')) || 4.50;

  // State
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [selectedSavedMethod, setSelectedSavedMethod] = useState(paymentMethods[0]?.id || 'pm_001');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [cardFormData, setCardFormData] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
  });
  const [cardErrors, setCardErrors] = useState({});
  const [isCardFocused, setCardFocused] = useState({ number: false, expiry: false, cvc: false });
  const [countdown, setCountdown] = useState(15 * 60);
  const [animationState, setAnimationState] = useState('initial');
  
  // Editable time state
  const [entryTime, setEntryTime] = useState(new Date());
  const [exitTime, setExitTime] = useState(() => new Date(Date.now() + 4 * 60 * 60 * 1000));
  const [entryTimeInput, setEntryTimeInput] = useState(() => formatTimeForInput(new Date()));
  const [exitTimeInput, setExitTimeInput] = useState(() => formatTimeForInput(new Date(Date.now() + 4 * 60 * 60 * 1000)));
  const [timeErrors, setTimeErrors] = useState({});
  const [showTimePicker, setShowTimePicker] = useState({ entry: false, exit: false });
  
  // Refs
  const cardNumberRef = useRef(null);
  const cardExpiryRef = useRef(null);
  const cardCvcRef = useRef(null);
  const entryTimeRef = useRef(null);
  const exitTimeRef = useRef(null);

  // Find location and vehicle
  const location = parkingLocations.find(l => l.id === locationId) || parkingLocations[0];
  const vehicle = vehicles.find(v => v.isDefault) || vehicles[0];
  const defaultPaymentMethod = paymentMethods.find(p => p.isDefault) || paymentMethods[0];

  // Calculate duration and pricing
  const calculateDuration = useCallback(() => {
    const diffMs = exitTime.getTime() - entryTime.getTime();
    const hours = Math.max(0.5, Math.ceil(diffMs / (1000 * 60 * 60) * 2) / 2); // Round to nearest 0.5 hour
    return hours;
  }, [entryTime, exitTime]);

  const duration = calculateDuration();
  const baseAmount = rate * duration;
  const serviceCharge = 1.50;
  const tax = baseAmount * 0.08;
  const totalAmount = baseAmount + serviceCharge + tax;

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Animate entrance
  useEffect(() => {
    setAnimationState('enter');
  }, []);

  const minutes = Math.floor(countdown / 60).toString().padStart(2, '0');
  const seconds = (countdown % 60).toString().padStart(2, '0');

  // Validate time inputs
  const validateTimes = useCallback(() => {
    const errors = {};
    const now = new Date();
    now.setSeconds(0, 0);
    
    const entry = parseTimeInput(entryTimeInput, entryTime);
    const exit = parseTimeInput(exitTimeInput, exitTime);
    
    if (entry < now) {
      errors.entry = 'Entry time cannot be in the past';
    }
    
    if (exit <= entry) {
      errors.exit = 'Exit time must be after entry time';
    }
    
    const maxHours = 24;
    const diffHours = (exit - entry) / (1000 * 60 * 60);
    if (diffHours > maxHours) {
      errors.exit = `Maximum parking duration is ${maxHours} hours`;
    }
    
    setTimeErrors(errors);
    return Object.keys(errors).length === 0;
  }, [entryTimeInput, exitTimeInput, entryTime, exitTime]);

  // Handle time input changes
  const handleEntryTimeChange = (value) => {
    setEntryTimeInput(value);
    const parsed = parseTimeInput(value, entryTime);
    if (!isNaN(parsed.getTime())) {
      setEntryTime(parsed);
    }
    if (timeErrors.entry) {
      setTimeErrors(prev => ({ ...prev, entry: null }));
    }
  };

  const handleExitTimeChange = (value) => {
    setExitTimeInput(value);
    const parsed = parseTimeInput(value, exitTime);
    if (!isNaN(parsed.getTime())) {
      setExitTime(parsed);
    }
    if (timeErrors.exit) {
      setTimeErrors(prev => ({ ...prev, exit: null }));
    }
  };

  // Quick duration buttons
  const setQuickDuration = (hours) => {
    const newExit = new Date(entryTime.getTime() + hours * 60 * 60 * 1000);
    setExitTime(newExit);
    setExitTimeInput(formatTimeForInput(newExit));
  };

  // Card formatting functions
  const formatCardNumber = (value) => {
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

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const formatCVC = (value) => {
    return value.replace(/\s+/g, '').replace(/[^0-9]/gi, '').substring(0, 4);
  };

  const validateCard = () => {
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
  };

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

  const getCardBrand = (number) => {
    const num = number.replace(/\s/g, '');
    if (/^4/.test(num)) return 'visa';
    if (/^5[1-5]/.test(num)) return 'mastercard';
    if (/^3[47]/.test(num)) return 'amex';
    if (/^6/.test(num)) return 'discover';
    return 'unknown';
  };

  const handleConfirmBooking = async () => {
    if (!validateTimes()) return;
    if (selectedPaymentMethod === 'card' && !validateCard()) {
      return;
    }

    setIsProcessing(true);
    setAnimationState('processing');
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    setIsProcessing(false);
    setAnimationState('success');
    setShowSuccessModal(true);
  };

  const handleBackToExplorer = () => {
    navigate('/explorer');
  };

  const handleViewPass = () => {
    navigate('/reservations');
    setShowSuccessModal(false);
  };

  // Edge case: No location/slot selected
  if (!locationId || !slotId) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="luxury-card p-12 max-w-md w-full text-center animate-fade-in-up">
          <div className="w-20 h-20 mx-auto mb-6 bg-violet-light rounded-2xl flex items-center justify-center">
            <MapPinIcon className="w-10 h-10 text-violet" />
          </div>
          <h2 className="text-headline-lg font-bold text-on-surface mb-3">No Parking Selected</h2>
          <p className="text-body-md text-on-surface-variant mb-8">Please select a parking spot from the map first.</p>
          <button 
            onClick={handleBackToExplorer}
            className="btn-luxury-primary w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Explore Parking
          </button>
        </div>
      </div>
    );
  }

  // Edge case: Invalid location
  const isValidLocation = parkingLocations.some(l => l.id === locationId);
  if (!isValidLocation) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="luxury-card p-12 max-w-md w-full text-center animate-fade-in-up">
          <div className="w-20 h-20 mx-auto mb-6 bg-warning-light rounded-2xl flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-warning" />
          </div>
          <h2 className="text-headline-lg font-bold text-on-surface mb-3">Invalid Location</h2>
          <p className="text-body-md text-on-surface-variant mb-8">The selected parking location is no longer available.</p>
          <button 
            onClick={handleBackToExplorer}
            className="btn-luxury-primary w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Find Another Spot
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Top Navigation Bar - Clean, no gradient */}
      <header className="relative z-10 sticky top-0 w-full bg-surface/95 backdrop-blur-xl border-b border-outline-variant/50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                className="btn-luxury-icon p-2 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors"
                onClick={() => navigate('/map?location=' + locationId)}
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
              {/* Timer - Clean monochrome */}
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-surface-container-low border border-outline-variant/50 rounded-full">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-violet animate-pulse" />
                  <Timer className="w-4 h-4 text-violet" />
                </div>
                <span className="text-label-md font-mono font-bold text-on-surface tabular-nums">
                  {minutes}:{seconds}
                </span>
                <span className="text-label-sm text-on-surface-variant">remaining</span>
              </div>
              {/* User avatar */}
              <div className="w-9 h-9 rounded-full bg-violet-light flex items-center justify-center">
                <span className="text-label-md font-bold text-violet">{user.name.charAt(0)}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN - Order Summary */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
            
            {/* Location & Slot Header Card - Clean, no gradients/shadows */}
            <div className="luxury-card p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-violet-light flex items-center justify-center border border-violet-muted/50">
                    <Building2 className="w-7 h-7 text-violet" />
                  </div>
                  <div>
                    <p className="text-label-sm font-medium text-on-surface-variant uppercase tracking-wider">PARKING LOCATION</p>
                    <h3 className="text-headline-md font-bold text-on-surface">{location.name}</h3>
                    <p className="text-label-md text-on-surface-variant flex items-center gap-1 mt-1">
                      <MapPinIcon className="w-4 h-4" />
                      {location.address}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 sm:ml-auto">
                  <div className="text-right border-l border-outline-variant/50 pl-6 hidden sm:block">
                    <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">YOUR SLOT</p>
                    <p className="text-2xl font-bold text-on-surface">{slotId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">FLOOR</p>
                    <p className="text-lg font-bold text-on-surface flex items-center gap-1 justify-end">
                      <MapPinIcon className="w-4 h-4 text-violet" />
                      {floor}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Slot type badge - Violet accent */}
              <div className="mt-4 flex items-center gap-2">
                <span className={`px-3 py-1.5 rounded-full text-label-sm font-semibold border ${getSlotTypeColor(slotType)}`}>
                  {getSlotTypeIcon(slotType)}
                  {getSlotTypeLabel(slotType)}
                </span>
              </div>
            </div>

            {/* Vehicle & Duration Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vehicle Card */}
              <div className="luxury-card p-6">
                <p className="text-label-sm font-medium text-on-surface-variant uppercase tracking-wider mb-4">YOUR VEHICLE</p>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-surface-container-low flex items-center justify-center border border-outline-variant/50">
                    <Car className="w-7 h-7 text-on-surface-variant" />
                  </div>
                  <div>
                    <p className="text-title-md font-bold text-on-surface">{vehicle.make} {vehicle.model}</p>
                    <p className="text-label-md text-on-surface-variant">{vehicle.licensePlate} • {vehicle.color}</p>
                    {vehicle.isElectric && (
                      <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-violet-light text-violet text-label-sm font-medium">
                        <Zap className="w-3 h-3" />
                        Electric Vehicle
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Duration Card - Editable Times */}
              <div className="luxury-card p-6">
                <p className="text-label-sm font-medium text-on-surface-variant uppercase tracking-wider mb-4">DURATION</p>
                
                {/* Entry Time - Editable */}
                <div className="mb-4">
                  <label className="block text-label-sm font-medium text-on-surface-variant mb-2">ENTRY TIME</label>
                  <div className="relative">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-violet-light flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-violet" />
                      </div>
                      <div className="flex-1">
                        <input
                          ref={entryTimeRef}
                          type="text"
                          value={entryTimeInput}
                          onChange={(e) => handleEntryTimeChange(e.target.value)}
                          onFocus={() => setShowTimePicker(prev => ({ ...prev, entry: true }))}
                          onBlur={() => setTimeout(() => setShowTimePicker(prev => ({ ...prev, entry: false })), 200)}
                          className={`input-luxury w-full py-3 text-lg font-mono tracking-wider ${
                            timeErrors.entry ? 'border-error focus:border-error focus:ring-error/20' : ''
                          }`}
                          placeholder="HH:MM AM/PM"
                        />
                        {timeErrors.entry && (
                          <p className="mt-1.5 text-label-sm text-error flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {timeErrors.entry}
                          </p>
                        )}
                      </div>
                    </div>
                    <Edit2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/50 pointer-events-none" />
                  </div>
                  <p className="mt-1 text-label-sm text-on-surface-variant">
                    {formatDate(entryTime)}
                  </p>
                </div>

                {/* Exit Time - Editable */}
                <div className="mb-4">
                  <label className="block text-label-sm font-medium text-on-surface-variant mb-2">EXIT TIME</label>
                  <div className="relative">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-violet-light flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-violet" />
                      </div>
                      <div className="flex-1">
                        <input
                          ref={exitTimeRef}
                          type="text"
                          value={exitTimeInput}
                          onChange={(e) => handleExitTimeChange(e.target.value)}
                          onFocus={() => setShowTimePicker(prev => ({ ...prev, exit: true }))}
                          onBlur={() => setTimeout(() => setShowTimePicker(prev => ({ ...prev, exit: false })), 200)}
                          className={`input-luxury w-full py-3 text-lg font-mono tracking-wider ${
                            timeErrors.exit ? 'border-error focus:border-error focus:ring-error/20' : ''
                          }`}
                          placeholder="HH:MM AM/PM"
                        />
                        {timeErrors.exit && (
                          <p className="mt-1.5 text-label-sm text-error flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {timeErrors.exit}
                          </p>
                        )}
                      </div>
                    </div>
                    <Edit2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/50 pointer-events-none" />
                  </div>
                  <p className="mt-1 text-label-sm text-on-surface-variant">
                    {formatDate(exitTime)}
                  </p>
                </div>

                {/* Quick Duration Buttons */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {[1, 2, 4, 8, 12, 24].map((hours) => (
                    <button
                      key={hours}
                      type="button"
                      onClick={() => setQuickDuration(hours)}
                      className={`px-3 py-1.5 rounded-lg text-label-sm font-medium transition-all duration-200 ${
                        duration === hours
                          ? 'bg-violet text-on-violet shadow-sm'
                          : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                      }`}
                    >
                      {hours}h
                    </button>
                  ))}
                </div>

                {/* Duration Summary */}
                <div className="pt-3 border-t border-outline-variant/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-on-surface-variant" />
                    <span className="text-label-md font-bold text-on-surface">{duration} Hours Total</span>
                  </div>
                  <span className="text-headline-sm font-bold text-violet">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Price Breakdown Card */}
            <div className="luxury-card p-6">
              <p className="text-label-sm font-medium text-on-surface-variant uppercase tracking-wider mb-5">PRICE BREAKDOWN</p>
              <div className="space-y-3">
                <div className="flex justify-between text-body-md">
                  <span className="text-on-surface-variant">Parking ({duration}h × {formatCurrency(rate)}/hr)</span>
                  <span className="font-medium text-on-surface">{formatCurrency(baseAmount)}</span>
                </div>
                <div className="flex justify-between text-body-md">
                  <span className="text-on-surface-variant">Service Fee</span>
                  <span className="font-medium text-on-surface">{formatCurrency(serviceCharge)}</span>
                </div>
                <div className="flex justify-between text-body-md">
                  <span className="text-on-surface-variant">Tax (8%)</span>
                  <span className="font-medium text-on-surface">{formatCurrency(tax)}</span>
                </div>
                <div className="pt-3 border-t border-outline-variant/50 flex justify-between items-center">
                  <span className="text-headline-sm font-bold text-on-surface">Total</span>
                  <span className="text-headline-lg font-bold text-violet">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Info Notice */}
            <div className="luxury-card p-4 bg-violet-light/50 border-violet-muted/50">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-violet flex-shrink-0 mt-0.5" />
                <div className="text-label-md text-on-surface-variant">
                  <p className="font-medium text-on-surface mb-1">Cancellation Policy</p>
                  <p>Free cancellation up to 30 minutes before entry time. After that, a 50% fee applies.</p>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN - Payment Form */}
          <aside className="lg:col-span-5 xl:col-span-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="sticky top-24 space-y-6">
              
              {/* Payment Method Tabs - Clean */}
              <div className="luxury-card p-1 bg-surface-container-low rounded-2xl">
                <div className="flex gap-1" role="tablist">
                  {[
                    { id: 'card', label: 'Card', icon: CreditCard },
                    { id: 'apple_pay', label: 'Apple Pay', icon: Apple },
                    { id: 'saved', label: 'Saved', icon: BadgeCheck },
                  ].map((method) => (
                    <button
                      key={method.id}
                      role="tab"
                      aria-selected={selectedPaymentMethod === method.id}
                      onClick={() => setSelectedPaymentMethod(method.id)}
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

              {/* Card Payment Form */}
              {selectedPaymentMethod === 'card' && (
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
                        ref={cardNumberRef}
                        id="card-number"
                        type="tel"
                        autoComplete="cc-number"
                        value={cardFormData.number}
                        onChange={(e) => handleCardChange('number', e.target.value)}
                        onFocus={() => setCardFocused(prev => ({ ...prev, number: true }))}
                        onBlur={() => setCardFocused(prev => ({ ...prev, number: false }))}
                        placeholder="4242 4242 4242 4242"
                        className={`input-luxury w-full py-3.5 pl-4 pr-12 text-lg font-mono tracking-wider ${
                          cardErrors.number ? 'border-error focus:border-error focus:ring-error/20' : 
                          isCardFocused.number ? 'border-violet focus:border-violet focus:ring-violet/20' : ''
                        }`}
                        inputMode="numeric"
                        maxLength={19}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        {getCardBrand(cardFormData.number) !== 'unknown' && (
                          <span className="font-bold text-violet uppercase text-xs tracking-wider">
                            {getCardBrand(cardFormData.number).toUpperCase()}
                          </span>
                        )}
                        <Lock className="w-4 h-4 text-on-surface-variant/50" />
                      </div>
                    </div>
                    {cardErrors.number && (
                      <p className="mt-1.5 text-label-sm text-error flex items-center gap-1">
                        <X className="w-3 h-3" />
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
                          ref={cardExpiryRef}
                          id="card-expiry"
                          type="tel"
                          autoComplete="cc-exp"
                          value={cardFormData.expiry}
                          onChange={(e) => handleCardChange('expiry', e.target.value)}
                          onFocus={() => setCardFocused(prev => ({ ...prev, expiry: true }))}
                          onBlur={() => setCardFocused(prev => ({ ...prev, expiry: false }))}
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
                          <X className="w-3 h-3" />
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
                          ref={cardCvcRef}
                          id="card-cvc"
                          type="tel"
                          autoComplete="cc-csc"
                          value={cardFormData.cvc}
                          onChange={(e) => handleCardChange('cvc', e.target.value)}
                          onFocus={() => setCardFocused(prev => ({ ...prev, cvc: true }))}
                          onBlur={() => setCardFocused(prev => ({ ...prev, cvc: false }))}
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
                          <X className="w-3 h-3" />
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
                        <X className="w-3 h-3" />
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
              )}

              {/* Apple Pay */}
              {selectedPaymentMethod === 'apple_pay' && (
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
              )}

              {/* Saved Payment Methods */}
              {selectedPaymentMethod === 'saved' && (
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
                        onChange={(e) => setSelectedSavedMethod(e.target.value)}
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
              )}

              {/* Terms & Conditions */}
              <div className="p-4 bg-surface-container-low rounded-xl text-label-sm text-on-surface-variant">
                <p>
                  By clicking confirm, you agree to our{' '}
                  <a className="underline font-bold text-on-surface hover:text-violet" href="#">Terms of Service</a>
                  {' '}and{' '}
                  <a className="underline font-bold text-on-surface hover:text-violet" href="#">Privacy Policy</a>
                  . Cancellation is free up to 30 minutes before entry.
                </p>
              </div>

              {/* Pay Button - Clean, no heavy shadows */}
              <button
                className="btn-luxury-primary w-full text-xl py-5 rounded-2xl font-bold transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-3 bg-violet hover:bg-violet-hover"
                onClick={handleConfirmBooking}
                disabled={isProcessing || !validateTimes() || (selectedPaymentMethod === 'card' && Object.keys(cardErrors).length > 0)}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <span>Pay {formatCurrency(totalAmount)}</span>
                    <ArrowRightIcon className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Security Badges - Clean */}
              <div className="flex flex-wrap justify-center gap-6 text-on-surface-variant/60">
                <div className="flex items-center gap-1.5 text-label-sm">
                  <Shield className="w-4 h-4" />
                  <span>256-bit SSL Encrypted</span>
                </div>
                <div className="flex items-center gap-1.5 text-label-sm">
                  <BadgeCheck className="w-4 h-4" />
                  <span>PCI DSS Compliant</span>
                </div>
                <div className="flex items-center gap-1.5 text-label-sm">
                  <Receipt className="w-4 h-4" />
                  <span>Instant Receipt</span>
                </div>
              </div>

            </div>
          </aside>
        </div>
      </main>

      {/* Success Modal - Clean */}
      <div
        className={`fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm ${showSuccessModal ? 'opacity-100 visible' : 'opacity-0 invisible'} transition-all duration-300`}
        onClick={() => setShowSuccessModal(false)}
      >
        <div
          className={`fixed z-[70] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md mx-4 bg-surface-container-lowest rounded-3xl shadow-luxury-lg border border-outline-variant/50 p-8 text-center ${showSuccessModal ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'} transition-all duration-300`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Success Animation */}
          <div className="relative mb-6">
            <div className={`w-20 h-20 bg-success-light text-success rounded-full flex items-center justify-center mx-auto ${animationState === 'success' ? 'animate-scale-in' : ''}`}>
              <CheckCircle className="w-10 h-10" style={{ fontVariationSettings: "'FILL' 1" }} />
            </div>
            {animationState === 'success' && (
              <div className="absolute inset-0 rounded-full border-4 border-success/30 animate-ping" />
            )}
          </div>
          
          <h3 className="text-headline-lg font-bold text-on-surface mb-2">Booking Confirmed!</h3>
          <p className="text-body-md text-on-surface-variant mb-6">
            Your spot <strong className="text-on-surface">{slotId}</strong> at <strong className="text-on-surface">{location.name}</strong> is now reserved.
          </p>
          
          <div className="luxury-card p-4 mb-6 text-left">
            <div className="flex justify-between text-label-md mb-2">
              <span className="text-on-surface-variant">Total Paid</span>
              <span className="font-bold text-on-surface">{formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex justify-between text-label-md mb-2">
              <span className="text-on-surface-variant">Duration</span>
              <span className="font-medium text-on-surface">{duration} hours</span>
            </div>
            <div className="flex justify-between text-label-md">
