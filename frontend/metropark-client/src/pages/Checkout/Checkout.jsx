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
} from 'lucide-react';
import { parkingLocations, vehicles as mockVehicles, paymentMethods } from '../../data/mockData';
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
} from './components';
import { useTimeValidation, useCardValidation } from './hooks';
import { formatCurrency } from './utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { reservationsApi, parkingSessionsApi, paymentsApi, paymentMethodsApi, vehiclesApi, gatesApi, toLocalDateTime } from '../../api';

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { session } = useAuth();

  const locationId = searchParams.get('location');
  const slotId = searchParams.get('slot_id');         // integer ID for API
  const slotCode = searchParams.get('slot_code') || searchParams.get('slot') || slotId;
  const floor = searchParams.get('floor');
  const slotType = searchParams.get('type');
  const rate = parseFloat(searchParams.get('rate')) || 5;

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [selectedSavedMethod, setSelectedSavedMethod] = useState(paymentMethods[0]?.id || 'pm_001');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [animationState, setAnimationState] = useState('initial');
  const [bookingError, setBookingError] = useState(null);
  const [userVehicle, setUserVehicle] = useState(null);
  const [userVehicles, setUserVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [entryGateId, setEntryGateId] = useState(null);
  const [exitGateId, setExitGateId] = useState(null);
  const [toast, setToast] = useState(null);

  // Sequential flow state
  const [reservationId, setReservationId] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [stepLoading, setStepLoading] = useState(null); // 'reservation' | 'session' | 'payment'

  // Payment methods (from API)
  const [paymentMethodList, setPaymentMethodList] = useState([]);
  const [selectedMethodId, setSelectedMethodId] = useState('');
  const [methodsLoading, setMethodsLoading] = useState(true);
  const [methodsError, setMethodsError] = useState(null);
  const [paymentId, setPaymentId] = useState(null);

  // Add-vehicle form
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [isSavingVehicle, setIsSavingVehicle] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    vehicleNumber: '', vehicleTypeId: '1', brand: '', model: '', color: '',
  });

  const location = parkingLocations.find((l) => l.id === locationId) || parkingLocations[0];

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };
  const displaySlot = { id: slotCode, type: slotType };

  const vehicleKey = (v) => String(v.vehicleId ?? v.vehicle_id ?? v.id ?? '');

  const loadVehicles = useCallback(async (preferId) => {
    if (!session?.user_id) return;
    try {
      const data = await vehiclesApi.getByUserPath(session.user_id);
      const list = Array.isArray(data) ? data : [];
      setUserVehicles(list);

      const preferred = preferId ? list.find((v) => vehicleKey(v) === String(preferId)) : null;
      const pick = preferred || list.find((v) => (v.is_active ?? v.isActive) !== false) || list[0];
      if (pick) {
        setSelectedVehicleId(vehicleKey(pick));
        setUserVehicle(pick);
      }
    } catch {
      setUserVehicles([]);
      setUserVehicle(null);
    }
  }, [session?.user_id]);

  // Fetch user vehicles on mount
  useEffect(() => {
    setAnimationState('enter');
    loadVehicles();
  }, [loadVehicles]);

  const handleAddVehicle = async () => {
    if (!newVehicle.vehicleNumber.trim()) {
      showToast('Vehicle number is required.', 'error');
      return;
    }
    setIsSavingVehicle(true);
    try {
      const now = toLocalDateTime();
      const res = await vehiclesApi.create({
        userId: session.user_id,
        vehicleNumber: newVehicle.vehicleNumber.trim().toUpperCase(),
        vehicleTypeId: parseInt(newVehicle.vehicleTypeId, 10) || 1,
        brand: newVehicle.brand.trim() || null,
        model: newVehicle.model.trim() || null,
        color: newVehicle.color.trim() || null,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });

      const newId =
        typeof res === 'number' ? res :
        typeof res === 'string' ? res :
        res?.vehicleId ?? res?.vehicle_id ?? res?.id ?? null;

      showToast('Vehicle added.');
      setShowAddVehicle(false);
      setNewVehicle({ vehicleNumber: '', vehicleTypeId: '1', brand: '', model: '', color: '' });
      await loadVehicles(newId);
    } catch (err) {
      showToast(err.message || 'Could not add vehicle.', 'error');
    } finally {
      setIsSavingVehicle(false);
    }
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
          setSelectedMethodId(String(active[0].methodId ?? active[0].method_id));
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

  // Auto-select ACTIVE gates for this location (locationId is a string like "LOC-905")
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

  const activeVehicleData = userVehicles.find(
    (v) => String(v.vehicleId ?? v.vehicle_id ?? v.id) === selectedVehicleId
  ) || userVehicle;

  const vehicle = activeVehicleData
    ? {
        id: activeVehicleData.vehicleId ?? activeVehicleData.vehicle_id,
        brand: activeVehicleData.brand || 'Vehicle',
        model: activeVehicleData.model || '',
        plateNumber: activeVehicleData.vehicleNumber ?? activeVehicleData.vehicle_number,
        color: activeVehicleData.color || '',
        type: (activeVehicleData.vehicleTypeId ?? activeVehicleData.vehicle_type_id) === 3 ? 'electric' : 'standard',
        isDefault: true,
      }
    : mockVehicles.find((v) => v.isDefault) || mockVehicles[0];

  const initialEntryTime = new Date();
  const initialExitTime = new Date(Date.now() + 4 * 60 * 60 * 1000);

  const {
    entryTime, exitTime, entryTimeInput, exitTimeInput,
    timeErrors, showTimePicker, setShowTimePicker,
    validateTimes, handleEntryTimeChange, handleExitTimeChange, setQuickDuration,
  } = useTimeValidation(initialEntryTime, initialExitTime);

  const {
    cardFormData, cardErrors, isCardFocused, setCardFocused,
    validateCard, handleCardChange, getCardBrand,
  } = useCardValidation();

  const duration = useCallback(() => {
    const diffMs = exitTime.getTime() - entryTime.getTime();
    return Math.max(0.5, Math.ceil(diffMs / (1000 * 60 * 60) * 2) / 2);
  }, [entryTime, exitTime])();

  const baseAmount = rate * duration;
  const serviceCharge = 1.5;
  const tax = baseAmount * 0.08;
  const totalAmount = baseAmount + serviceCharge + tax;

  // Extract an id from a response that may be a bare number, string, or object
  const extractId = (res, ...keys) => {
    if (typeof res === 'number') return res;
    if (typeof res === 'string') return parseInt(res, 10);
    for (const k of keys) if (res?.[k] != null) return res[k];
    return res?.id ?? null;
  };

  const resolvedVehicleId = selectedVehicleId
    ? parseInt(selectedVehicleId, 10)
    : (activeVehicleData?.vehicleId ?? activeVehicleData?.vehicle_id ?? null);

  const numericSlotId = parseInt(slotId, 10) || undefined;

  // Step 1 — Create Reservation
  const handleCreateReservation = async () => {
    if (!resolvedVehicleId) {
      showToast('Please select a vehicle to continue.', 'error');
      return;
    }
    if (!validateTimes().isValid) return;

    setBookingError(null);
    setStepLoading('reservation');
    try {
      const res = await reservationsApi.create({
        userId: session.user_id,
        slotId: numericSlotId,
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
        slotId: numericSlotId,
        userId: session.user_id,
        vehicleId: resolvedVehicleId,
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
      const txnRef = `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      await paymentsApi.create({
        transactionReference: txnRef,
        sessionId,
        reservationId,
        methodId: PAYMENT_METHOD_ID[selectedPaymentMethod] || 1,
        amount: parseFloat(totalAmount.toFixed(2)),
        currency: 'USD',
        paymentStatus: 'PENDING',
        gatewayResponseCode: '200',
        gatewayResponseMessage: 'successful transaction',
        processedAt: now,
        createdAt: now,
        updatedAt: now,
      });

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

  if (!locationId || (!slotId && !slotCode)) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="luxury-card p-12 max-w-md w-full text-center animate-fade-in-up">
          <div className="w-20 h-20 mx-auto mb-6 bg-violet-light rounded-2xl flex items-center justify-center">
            <MapPinIcon className="w-10 h-10 text-violet" />
          </div>
          <h2 className="text-headline-lg font-bold text-on-surface mb-3">No Parking Selected</h2>
          <p className="text-body-md text-on-surface-variant mb-8">Please select a parking spot from the map first.</p>
          <button onClick={() => navigate('/explorer')} className="btn-luxury-primary w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Explore Parking
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header locationId={locationId} onBackClick={() => navigate(`/map?location=${locationId}`)} />

      <main className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left column */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <LocationSlotCard location={location} slotId={slotCode} floor={floor} slotType={slotType} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-3">
                <div className="luxury-card px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-label-sm text-on-surface-variant">Select Vehicle</p>
                    <button
                      type="button"
                      onClick={() => setShowAddVehicle((s) => !s)}
                      className="text-label-sm font-semibold text-violet-400 hover:underline"
                    >
                      {showAddVehicle ? 'Cancel' : '+ Add Vehicle'}
                    </button>
                  </div>

                  {userVehicles.length > 0 ? (
                    <select
                      value={selectedVehicleId ?? ''}
                      onChange={(e) => {
                        setSelectedVehicleId(e.target.value);
                        const v = userVehicles.find((u) => vehicleKey(u) === e.target.value);
                        if (v) setUserVehicle(v);
                      }}
                      className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-violet-500 cursor-pointer"
                    >
                      {userVehicles.map((v) => {
                        const id = vehicleKey(v);
                        const plate = v.vehicleNumber ?? v.vehicle_number ?? id;
                        const label = [v.brand, v.model].filter(Boolean).join(' ');
                        return (
                          <option key={id} value={id} className="bg-slate-900">
                            {label ? `${label} — ${plate}` : plate}
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    <p className="text-label-sm text-on-surface-variant/70">
                      No vehicles registered. Add one to continue.
                    </p>
                  )}

                  {showAddVehicle && (
                    <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-2">
                      <input
                        type="text"
                        value={newVehicle.vehicleNumber}
                        onChange={(e) => setNewVehicle((p) => ({ ...p, vehicleNumber: e.target.value }))}
                        placeholder="Vehicle number (e.g. KA11SB1234)"
                        className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm outline-none focus:border-violet-500"
                      />
                      <select
                        value={newVehicle.vehicleTypeId}
                        onChange={(e) => setNewVehicle((p) => ({ ...p, vehicleTypeId: e.target.value }))}
                        className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-violet-500 cursor-pointer"
                      >
                        <option value="1" className="bg-slate-900">Standard</option>
                        <option value="2" className="bg-slate-900">Compact</option>
                        <option value="3" className="bg-slate-900">Electric</option>
                        <option value="4" className="bg-slate-900">Oversize</option>
                      </select>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={newVehicle.brand}
                          onChange={(e) => setNewVehicle((p) => ({ ...p, brand: e.target.value }))}
                          placeholder="Brand"
                          className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm outline-none focus:border-violet-500"
                        />
                        <input
                          type="text"
                          value={newVehicle.model}
                          onChange={(e) => setNewVehicle((p) => ({ ...p, model: e.target.value }))}
                          placeholder="Model"
                          className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm outline-none focus:border-violet-500"
                        />
                      </div>
                      <input
                        type="text"
                        value={newVehicle.color}
                        onChange={(e) => setNewVehicle((p) => ({ ...p, color: e.target.value }))}
                        placeholder="Color"
                        className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm outline-none focus:border-violet-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddVehicle}
                        disabled={isSavingVehicle}
                        className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        {isSavingVehicle ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving…
                          </>
                        ) : 'Save Vehicle'}
                      </button>
                    </div>
                  )}
                </div>

                <VehicleCard vehicle={vehicle} />
              </div>
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
                onEntryFocus={() => setShowTimePicker((p) => ({ ...p, entry: true }))}
                onEntryBlur={() => setTimeout(() => setShowTimePicker((p) => ({ ...p, entry: false })), 200)}
                onExitFocus={() => setShowTimePicker((p) => ({ ...p, exit: true }))}
                onExitBlur={() => setTimeout(() => setShowTimePicker((p) => ({ ...p, exit: false })), 200)}
              />
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

          {/* Right column – payment */}
          <aside className="lg:col-span-5 xl:col-span-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="sticky top-24 space-y-6">
              <PaymentMethodTabs
                selectedPaymentMethod={selectedPaymentMethod}
                onPaymentMethodChange={setSelectedPaymentMethod}
              />

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

              {selectedPaymentMethod === 'saved' && (
                <SavedPaymentMethods
                  paymentMethods={paymentMethods}
                  selectedSavedMethod={selectedSavedMethod}
                  onSelectMethod={setSelectedSavedMethod}
                />
              )}

              {/* Step toast */}
              {toast && (
                <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm border ${
                  toast.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}>
                  {toast.type === 'success'
                    ? <CheckCircle className="w-4 h-4 shrink-0" />
                    : <AlertCircle className="w-4 h-4 shrink-0" />}
                  {toast.message}
                </div>
              )}

              {/* API error */}
              {bookingError && (
                <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  {bookingError}
                </div>
              )}

              <div className="p-4 bg-surface-container-low rounded-xl text-label-sm text-on-surface-variant">
                <p>
                  By clicking confirm, you agree to our{' '}
                  <span className="underline font-bold text-on-surface cursor-pointer">Terms of Service</span>
                  {' '}and{' '}
                  <span className="underline font-bold text-on-surface cursor-pointer">Privacy Policy</span>.
                  Cancellation is free up to 30 minutes before entry.
                </p>
              </div>

              {/* Why step 1 is blocked */}
              {!reservationId && (!resolvedVehicleId || !validateTimes().isValid) && (
                <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 text-amber-400 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  {!resolvedVehicleId
                    ? 'Select or add a vehicle to continue.'
                    : Object.values(validateTimes().errors)[0] || 'Please check your entry and exit times.'}
                </div>
              )}

              {/* Step 1 — Reservation */}
              <button
                className="btn-luxury-primary w-full text-xl py-5 rounded-2xl font-bold transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-3 bg-violet hover:bg-violet-hover disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleCreateReservation}
                disabled={!!reservationId || stepLoading !== null || !validateTimes().isValid || !resolvedVehicleId}
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
                    <span>1. Create Reservation</span>
                    <ArrowRightIcon className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Step 2 — Parking Session */}
              <button
                className="btn-luxury-primary w-full text-xl py-5 rounded-2xl font-bold transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-3 bg-violet hover:bg-violet-hover disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleCreateSession}
                disabled={!reservationId || !!sessionId || stepLoading !== null}
              >
                {stepLoading === 'session' ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Starting session…</span>
                  </>
                ) : sessionId ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Session #{sessionId}</span>
                  </>
                ) : (
                  <>
                    <span>2. Start Parking Session</span>
                    <ArrowRightIcon className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Step 3 — Payment */}
              <button
                className="btn-luxury-primary w-full text-xl py-5 rounded-2xl font-bold transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-3 bg-violet hover:bg-violet-hover disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handlePayment}
                disabled={!sessionId || stepLoading !== null}
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

              <div className="flex flex-wrap justify-center gap-6 text-on-surface-variant/60">
                {[
                  { Icon: Shield, label: '256-bit SSL Encrypted' },
                  { Icon: BadgeCheck, label: 'PCI DSS Compliant' },
                  { Icon: Receipt, label: 'Instant Receipt' },
                ].map(({ Icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5 text-label-sm">
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
        slotId={slotCode}
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
