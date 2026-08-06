import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Shield,
  BadgeCheck,
  Receipt,
  Loader2,
  ArrowRight as ArrowRightIcon,
  AlertCircle,
  CheckCircle,
  MapPin as MapPinIcon,
  Car,
  Clock,
} from 'lucide-react';
import { parkingLocations } from '../../data/mockData';
import {
  Header,
  LocationSlotCard,
  PriceBreakdown,
  InfoNotice,
  PaymentMethodTabs,
  CardPaymentForm,
  ApplePayForm,
  SuccessModal,
  ProcessingModal,
} from './components';
import { useCardValidation } from './hooks';
import { formatCurrency } from './utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { reservationsApi, parkingSessionsApi, paymentsApi, paymentMethodsApi, gatesApi, toLocalDateTime } from '../../api';

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { session } = useAuth();

  // Get params from URL (passed from Explorer)
  const locationId = searchParams.get('location');
  const vehicleType = parseInt(searchParams.get('vehicle_type')) || 1; // 1=Standard, 2=Compact, 3=EV, 4=Oversize
  const vehicleTypeLabel = searchParams.get('vehicle_type_label') || 'Standard';
  const selectedDate = searchParams.get('date');
  const selectedTime = searchParams.get('time');
  const rate = parseFloat(searchParams.get('rate')) || 5;

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [animationState, setAnimationState] = useState('initial');
  const [bookingError, setBookingError] = useState(null);
  const [toast, setToast] = useState(null);

  // Sequential flow state
  const [reservationId, setReservationId] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [stepLoading, setStepLoading] = useState(null);

  // Payment methods (from API)
  const [paymentMethodList, setPaymentMethodList] = useState([]);
  const [methodsLoading, setMethodsLoading] = useState(true);
  const [methodsError, setMethodsError] = useState(null);

  const location = parkingLocations.find((l) => l.id === locationId) || parkingLocations[0];

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const vehicleTypes = {
    1: { label: 'Standard', icon: Car },
    2: { label: 'Compact', icon: Car },
    3: { label: 'EV', icon: Car },
    4: { label: 'Oversize', icon: Car },
  };

  const selectedVehicleType = vehicleTypes[vehicleType] || vehicleTypes[1];

  // Calculate duration from selected time (assume 2 hours default, or calculate from time)
  const getDuration = () => {
    if (!selectedTime) return 2;
    const [hours] = selectedTime.split(':').map(Number);
    // Default 2 hours, or calculate based on time of day
    return 2;
  };

  const duration = getDuration();
  const baseAmount = rate * duration;
  const serviceCharge = 1.5;
  const tax = baseAmount * 0.08;
  const totalAmount = baseAmount + serviceCharge + tax;

  const {
    cardFormData, cardErrors, isCardFocused, setCardFocused,
    validateCard, handleCardChange, getCardBrand,
  } = useCardValidation();

  // Extract an id from a response that may be a bare number, string, or object
  const extractId = (res, ...keys) => {
    if (typeof res === 'number') return res;
    if (typeof res === 'string') return parseInt(res, 10);
    for (const k of keys) if (res?.[k] != null) return res[k];
    return res?.id ?? null;
  };

  // Fetch payment methods on page load
  useEffect(() => {
    let cancelled = false;
    setMethodsLoading(true);
    setMethodsError(null);
    paymentMethodsApi.getAll()
      .then((data) => {
        if (cancelled) return;
        const active = (Array.isArray(data) ? data : []).filter(
          (m) => (m.isActive ?? m.is_active) !== false
        );
        setPaymentMethodList(active);
        if (active.length) {
          setSelectedPaymentMethod(String(active[0].methodId ?? active[0].method_id));
        }
      })
      .catch((err) => {
        if (!cancelled) setMethodsError(err.message || 'Could not load payment methods.');
      })
      .finally(() => {
        if (!cancelled) setMethodsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Auto-select ACTIVE gates for this location
  const [entryGateId, setEntryGateId] = useState(null);
  const [exitGateId, setExitGateId] = useState(null);

  useEffect(() => {
    if (!locationId) return;
    gatesApi.getAll()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        const matches = (g, type) =>
          String(g.locationId ?? g.location_id ?? '') === String(locationId) &&
          String(g.gateType ?? g.gate_type ?? '').toUpperCase() === type &&
          String(g.status ?? g.gateStatus ?? 'ACTIVE').toUpperCase() === 'ACTIVE';

        const entry = list.find((g) => matches(g, 'ENTRY'));
        const exit = list.find((g) => matches(g, 'EXIT'));

        if (entry) setEntryGateId(entry.gateId ?? entry.gate_id ?? entry.id);
        if (exit) setExitGateId(exit.gateId ?? exit.gate_id ?? exit.id);
      })
      .catch(() => {});
  }, [locationId]);

  // Parse entry/exit times from selected date and time
  const parseDateTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return new Date();
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date(dateStr);
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const entryTime = parseDateTime(selectedDate, selectedTime);
  const exitTime = new Date(entryTime.getTime() + duration * 60 * 60 * 1000);

  // Step 1 — Create Reservation
  const handleCreateReservation = async () => {
    setBookingError(null);
    setStepLoading('reservation');
    try {
      // For now, we'll create a reservation without a specific slot ID
      // The backend should assign an available slot of the requested vehicle type
      const res = await reservationsApi.create({
        userId: session.user_id,
        locationId: locationId,
        vehicleTypeId: vehicleType,
        entryTime: toLocalDateTime(entryTime),
        exitTime: toLocalDateTime(exitTime),
      });
      const id = extractId(res, 'reservationId', 'reservation_id');
      if (!id) throw new Error('Server did not return a reservationId.');
      setReservationId(id);
      showToast(`Reservation created (#${id}).`);
    } catch (err) {
      const msg = err.message || 'Could not create reservation.';
      setBookingError(msg);
      showToast(msg, 'error');
    } finally {
      setStepLoading(null);
    }
  };

  // Step 2 — Create Parking Session
  const handleCreateSession = async () => {
    if (!reservationId) return;

    setBookingError(null);
    setStepLoading('session');
    try {
      const body = {
        reservationId,
        userId: session.user_id,
        vehicleTypeId: vehicleType,
        sessionStatus: 'ACTIVE',
        actualEntryTime: toLocalDateTime(entryTime),
        expectedExitTime: toLocalDateTime(exitTime),
      };
      if (entryGateId) body.entryGateId = entryGateId;
      if (exitGateId) body.exitGateId = exitGateId;

      const res = await parkingSessionsApi.create(body);
      const id = extractId(res, 'sessionId', 'session_id');
      if (!id) throw new Error('Server did not return a sessionId.');
      setSessionId(id);
      showToast(`Parking session started (#${id}).`);
    } catch (err) {
      const msg = err.message || 'Could not create parking session.';
      setBookingError(msg);
      showToast(msg, 'error');
    } finally {
      setStepLoading(null);
    }
  };

  // Step 3 — Payment
  const handlePayment = async () => {
    if (!sessionId) return;
    if (selectedPaymentMethod === 'card' && !validateCard()) return;

    setBookingError(null);
    setStepLoading('payment');
    setIsProcessing(true);
    setAnimationState('processing');
    try {
      const now = toLocalDateTime();
      const res = await paymentsApi.create({
        transactionReference: null,
        userId: session.user_id,
        reservationId,
        sessionId,
        methodId: parseInt(selectedPaymentMethod, 10),
        amount: parseFloat(totalAmount.toFixed(2)),
        currency: 'INR',
        paymentStatus: 'PENDING',
        gatewayResponseCode: null,
        gatewayResponseMessage: null,
        processedAt: null,
      });

      const newPaymentId = extractId(res, 'paymentId', 'payment_id');
      if (newPaymentId) {
        // Payment ID stored if needed
      }

      showToast('Payment successful.');
      setIsProcessing(false);
      setAnimationState('success');
      setShowSuccessModal(true);
    } catch (err) {
      setIsProcessing(false);
      setAnimationState('enter');
      const msg = err.message || 'Payment failed. Please try again.';
      setBookingError(msg);
      showToast(msg, 'error');
    } finally {
      setStepLoading(null);
    }
  };

  if (!locationId) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="luxury-card p-12 max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-primary-light rounded-2xl flex items-center justify-center">
            <MapPinIcon className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-headline-lg text-on-surface font-bold mb-3">No Parking Selected</h2>
          <p className="text-body-md text-on-surface-variant mb-8">Please select a parking spot from the explorer first.</p>
          <button onClick={() => navigate('/explorer')} className="btn-luxury-primary w-full">
            <ArrowLeft className="w-4 h-4" />
            Explore Parking
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header locationId={locationId} onBackClick={() => navigate('/explorer')} />
      <main className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left column - Booking Summary */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            <LocationSlotCard 
              location={location} 
              slotId={`${selectedVehicleType.label} Slot`} 
              floor={selectedDate ? new Date(selectedDate).toLocaleDateString() : 'Today'} 
              slotType={selectedVehicleType.label}
            />

            {/* Vehicle Type Selection */}
            <div className="luxury-card">
              <h3 className="text-on-surface font-semibold text-lg mb-4 flex items-center gap-2">
                <Car className="w-5 h-5 text-primary" />
                Vehicle Type
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(vehicleTypes).map(([key, vtype]) => (
                  <button
                    key={key}
                    onClick={() => {
                      // Update URL with new vehicle type
                      const params = new URLSearchParams(searchParams);
                      params.set('vehicle_type', key);
                      params.set('vehicle_type_label', vtype.label);
                      navigate(`/checkout?${params.toString()}`);
                    }}
                    className={`luxury-card p-4 transition-all text-center border-2 ${
                      vehicleType === parseInt(key)
                        ? "border-primary bg-primary-light"
                        : 'border-outline-variant/50 hover:border-primary/30'
                    }`}
                  >
                    <vtype.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <div className="font-medium text-on-surface">{vtype.label}</div>
                    <div className="text-xs text-on-surface-variant">${rate}/hr</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Date & Time Summary */}
            <div className="luxury-card">
              <h3 className="text-on-surface font-semibold text-lg mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Date & Time
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-surface-container rounded-xl">
                  <div className="text-xs text-on-surface-variant mb-1">Date</div>
                  <div className="font-medium text-on-surface">{selectedDate ? new Date(selectedDate).toLocaleDateString() : 'Today'}</div>
                </div>
                <div className="p-3 bg-surface-container rounded-xl">
                  <div className="text-xs text-on-surface-variant mb-1">Entry Time</div>
                  <div className="font-medium text-on-surface">{selectedTime || 'Now'}</div>
                </div>
                <div className="p-3 bg-surface-container rounded-xl">
                  <div className="text-xs text-on-surface-variant mb-1">Duration</div>
                  <div className="font-medium text-on-surface">{duration} hrs</div>
                </div>
                <div className="p-3 bg-surface-container rounded-xl">
                  <div className="text-xs text-on-surface-variant mb-1">Exit Time</div>
                  <div className="font-medium text-on-surface">{exitTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
            </div>

            <PriceBreakdown
              duration={duration}
              rate={rate}
              baseAmount={baseAmount}
              serviceCharge={serviceCharge}
              tax={tax}
              totalAmount={totalAmount}
            />

            <InfoNotice />
          </div>

          {/* Right column – Payment */}
          <aside className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-24 space-y-6">
              <PaymentMethodTabs
                selectedPaymentMethod={selectedPaymentMethod}
                onPaymentMethodChange={setSelectedPaymentMethod}
                paymentMethods={paymentMethodList}
                methodsLoading={methodsLoading}
                methodsError={methodsError}
              />

              {selectedPaymentMethod && !methodsLoading && !methodsError && (
                <>
                  {selectedPaymentMethod === 'card' && (
                    <CardPaymentForm
                      cardFormData={cardFormData}
                      cardErrors={cardErrors}
                      isCardFocused={isCardFocused}
                      handleCardChange={handleCardChange}
                      handleCardFocus={(field) => setCardFocused((p) => ({ ...p, [field]: true }))}
                      handleCardBlur={(field) => setCardFocused((p) => ({ ...p, [field]: false }))}
                      getCardBrand={getCardBrand}
                    />
                  )}
                  {selectedPaymentMethod === 'apple_pay' && <ApplePayForm />}
                </>
              )}

              {/* Step toast */}
              {toast && (
                <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm border ${
                  toast.type === 'success'
                    ? 'bg-success-light border-success/30 text-success'
                    : 'bg-error-light border-error/30 text-error'
                }`}>
                  {toast.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  {toast.message}
                </div>
              )}

              {/* API error */}
              {bookingError && (
                <div className="flex items-start gap-2 bg-error-light border border-error/30 rounded-xl px-4 py-3 text-error text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  {bookingError}
                </div>
              )}

              <div className="p-4 bg-surface-container border border-outline-variant/50 rounded-xl text-sm text-on-surface-variant">
                <p>
                  By clicking confirm, you agree to our{' '}
                  <span className="underline font-bold text-on-surface cursor-pointer">Terms of Service</span>
                  {' '}and{' '}
                  <span className="underline font-bold text-on-surface cursor-pointer">Privacy Policy</span>.
                  Cancellation is free up to 30 minutes before entry.
                </p>
              </div>

              {/* Step 1 — Reservation */}
              <button
                className="btn-luxury-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleCreateReservation}
                disabled={!!reservationId || stepLoading !== null}
              >
                {stepLoading === 'reservation' ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Reserving…</span>
                  </>
                ) : reservationId ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Reserved #{reservationId}</span>
                  </>
                ) : (
                  <>
                    <span>1. Reserve Spot</span>
                    <ArrowRightIcon className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Step 2 — Parking Session */}
              <button
                className="btn-luxury-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleCreateSession}
                disabled={!reservationId || !!sessionId || stepLoading !== null}
              >
                {stepLoading === 'session' ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Starting Session…</span>
                  </>
                ) : sessionId ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Session #{sessionId}</span>
                  </>
                ) : (
                  <>
                    <span>2. Start Parking</span>
                    <ArrowRightIcon className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Step 3 — Payment */}
              <button
                className="btn-luxury-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handlePayment}
                disabled={!sessionId || stepLoading !== null || !selectedPaymentMethod || methodsLoading}
              >
                {stepLoading === 'payment' ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Processing…</span>
                  </>
                ) : (
                  <>
                    <span>3. Pay {formatCurrency(totalAmount)}</span>
                    <ArrowRightIcon className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="flex flex-wrap justify-center gap-6 text-on-surface-variant">
                {[
                  { Icon: Shield, label: '256-bit SSL Encrypted' },
                  { Icon: BadgeCheck, label: 'PCI DSS Compliant' },
                  { Icon: Receipt, label: 'Instant Receipt' },
                ].map(({ Icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5 text-sm">
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onViewPass={() => { setShowSuccessModal(false); navigate('/reservations'); }}
        onFindAnotherSpot={() => { setShowSuccessModal(false); navigate('/explorer'); }}
        slotId={`${selectedVehicleType.label} Slot`}
        location={location}
        duration={duration}
        totalAmount={totalAmount}
        entryTime={entryTime}
        animationState={animationState}
      />

      <ProcessingModal isProcessing={isProcessing} />
    </>
  );
}