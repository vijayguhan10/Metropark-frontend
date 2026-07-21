import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import {
  Header,
  LocationSlotCard,
  VehicleCard,
  DurationCard,
  PriceBreakdown,
  InfoNotice,
  PaymentMethodTabs,
  CardPaymentForm,
  ApplePayForm,
  SavedPaymentMethods,
  SuccessModal,
  ProcessingModal,
  Timer as TimerComponent,
} from './components';
import { useTimeValidation, useCardValidation } from './hooks';
import { formatCurrency, parseTimeInput, formatTimeForInput, formatDate, formatTime, getCardBrand } from './utils/formatters';

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
  const [animationState, setAnimationState] = useState('initial');
  
  // Refs
  const entryTimeRef = useRef(null);
  const exitTimeRef = useRef(null);

  // Find location and vehicle
  const location = parkingLocations.find(l => l.id === locationId) || parkingLocations[0];
  const vehicle = vehicles.find(v => v.isDefault) || vehicles[0];
  const defaultPaymentMethod = paymentMethods.find(p => p.isDefault) || paymentMethods[0];

  // Time validation hook
  const initialEntryTime = new Date();
  const initialExitTime = new Date(Date.now() + 4 * 60 * 60 * 1000);
  
  const {
    entryTime,
    exitTime,
    entryTimeInput,
    exitTimeInput,
    timeErrors,
    showTimePicker,
    setShowTimePicker,
    validateTimes,
    handleEntryTimeChange,
    handleExitTimeChange,
    setQuickDuration,
  } = useTimeValidation(initialEntryTime, initialExitTime);

  // Card validation hook
  const {
    cardFormData,
    cardErrors,
    isCardFocused,
    setCardFocused,
    validateCard,
    handleCardChange,
    getCardBrand,
  } = useCardValidation();

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

  // Animate entrance
  useEffect(() => {
    setAnimationState('enter');
  }, []);

  const handleConfirmBooking = async () => {
    if (!validateTimes().isValid) return;
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
      {/* Top Navigation Bar */}
      <Header 
        locationId={locationId} 
        onBackClick={() => navigate('/map?location=' + locationId)} 
      />

      <main className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN - Order Summary */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
            
            {/* Location & Slot Header Card */}
            <LocationSlotCard 
              location={location} 
              slotId={slotId} 
              floor={floor} 
              slotType={slotType} 
            />

            {/* Vehicle & Duration Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vehicle Card */}
              <VehicleCard vehicle={vehicle} />

              {/* Duration Card - Editable Times */}
              <DurationCard
                entryTime={entryTime}
                exitTime={exitTime}
                entryTimeInput={entryTimeInput}
                exitTimeInput={exitTimeInput}
                timeErrors={timeErrors}
                duration={duration}
                totalAmount={formatCurrency(totalAmount)}
                onEntryTimeChange={handleEntryTimeChange}
                onExitTimeChange={handleExitTimeChange}
                onQuickDuration={setQuickDuration}
                onEntryFocus={() => setShowTimePicker(prev => ({ ...prev, entry: true }))}
                onEntryBlur={() => setTimeout(() => setShowTimePicker(prev => ({ ...prev, entry: false })), 200)}
                onExitFocus={() => setShowTimePicker(prev => ({ ...prev, exit: true }))}
                onExitBlur={() => setTimeout(() => setShowTimePicker(prev => ({ ...prev, exit: false })), 200)}
              />
            </div>

            {/* Price Breakdown Card */}
            <PriceBreakdown 
              duration={duration} 
              rate={rate} 
              baseAmount={baseAmount} 
              serviceCharge={serviceCharge} 
              tax={tax} 
              totalAmount={totalAmount} 
            />

            {/* Info Notice */}
            <InfoNotice />

          </div>

          {/* RIGHT COLUMN - Payment Form */}
          <aside className="lg:col-span-5 xl:col-span-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="sticky top-24 space-y-6">
              
              {/* Payment Method Tabs */}
              <PaymentMethodTabs 
                selectedPaymentMethod={selectedPaymentMethod} 
                onPaymentMethodChange={setSelectedPaymentMethod} 
              />

              {/* Card Payment Form */}
              {selectedPaymentMethod === 'card' && (
                <CardPaymentForm
                  cardFormData={cardFormData}
                  cardErrors={cardErrors}
                  isCardFocused={isCardFocused}
                  handleCardChange={handleCardChange}
                  handleCardFocus={(field) => setCardFocused(prev => ({ ...prev, [field]: true }))}
                  handleCardBlur={(field) => setCardFocused(prev => ({ ...prev, [field]: false }))}
                  getCardBrand={getCardBrand}
                />
              )}

              {/* Apple Pay */}
              {selectedPaymentMethod === 'apple_pay' && (
                <ApplePayForm />
              )}

              {/* Saved Payment Methods */}
              {selectedPaymentMethod === 'saved' && (
                <SavedPaymentMethods 
                  paymentMethods={paymentMethods} 
                  selectedSavedMethod={selectedSavedMethod} 
                  onSelectMethod={setSelectedSavedMethod} 
                />
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

              {/* Pay Button */}
              <button
                className="btn-luxury-primary w-full text-xl py-5 rounded-2xl font-bold transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-3 bg-violet hover:bg-violet-hover"
                onClick={handleConfirmBooking}
                disabled={isProcessing || !validateTimes().isValid || (selectedPaymentMethod === 'card' && Object.keys(cardErrors).length > 0)}
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

              {/* Security Badges */}
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

      {/* Success Modal */}
      <SuccessModal 
        isOpen={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)} 
        onViewPass={handleViewPass} 
        onFindAnotherSpot={handleBackToExplorer}
        slotId={slotId}
        location={location}
        duration={duration}
        totalAmount={totalAmount}
        entryTime={entryTime}
        animationState={animationState}
      />

      {/* Processing Modal */}
      <ProcessingModal isProcessing={isProcessing} />
    </>
  );
}