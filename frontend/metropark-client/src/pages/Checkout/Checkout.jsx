import { useState, useEffect } from 'react';
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
  Clock,
  Plus,
  Wallet as WalletIcon,
} from 'lucide-react';
import { parkingLocations, vehicles as mockVehicles } from '../../data/mockData';
import {
  Header,
  LocationSlotCard,
  VehicleCard,
  PriceBreakdown,
  InfoNotice,
  SuccessModal,
  ProcessingModal,
  WalletModal,
} from './components';
import { formatCurrency } from './utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { parkingSessionsApi, vehiclesApi, walletApi, toLocalDateTime } from '../../api';

const SESSION_KEY = 'activeSession';

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { session, isAuthenticated } = useAuth();

  const locationId = searchParams.get('location');
  const slotId = searchParams.get('slotId') || searchParams.get('slot_id');
  const fromDate = searchParams.get('fromDate') || searchParams.get('from_date');
  const toDate = searchParams.get('toDate') || searchParams.get('to_date');
  const rate = parseFloat(searchParams.get('rate')) || 5;

  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [animationState, setAnimationState] = useState('initial');
  const [bookingError, setBookingError] = useState(null);
  const [toast, setToast] = useState(null);

  const [vehiclesList, setVehiclesList] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [vehiclesError, setVehiclesError] = useState(null);

  const [sessionResponse, setSessionResponse] = useState(null);

  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletLoading, setWalletLoading] = useState(false);

  const location = parkingLocations.find((l) => l.id === locationId) || parkingLocations[0];

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const getDuration = () => {
    if (!fromDate || !toDate) return 2;
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const diffMs = end - start;
    const diffHours = diffMs / (1000 * 60 * 60);
    return Math.max(0.5, Math.ceil(diffHours * 2) / 2); // Round to nearest 0.5 hour
  };

  const duration = getDuration();
  const baseAmount = rate * duration;
  const serviceCharge = 1.5;
  const tax = baseAmount * 0.08;
  const totalAmount = baseAmount + serviceCharge + tax;

  useEffect(() => {
    let cancelled = false;
    async function loadVehicles() {
      setVehiclesLoading(true);
      setVehiclesError(null);
      try {
        // Fetch the vehicles for the active user from /api/vehicles/user/{userId}.
        const userId = getActiveUserId();
        let fetchedData = null;

        if (userId) {
          try {
            fetchedData = await vehiclesApi.getByUserPath(userId);
          } catch (e) {
            console.error('Failed to load user vehicles:', e);
            fetchedData = null;
          }
        }

        if (!fetchedData || (Array.isArray(fetchedData) && fetchedData.length === 0)) {
          fetchedData = await vehiclesApi.getAll();
        }

        if (!cancelled) {
          let list = Array.isArray(fetchedData) ? fetchedData : fetchedData?.content || [];
          if (list.length === 0) {
            list = mockVehicles; // Fallback to mock data if API returns empty
          }
          setVehiclesList(list);
          if (list.length > 0) {
            const defaultVeh = list.find((v) => v.isDefault || v.is_default) || list[0];
            const defId = String(defaultVeh.vehicleId || defaultVeh.id || defaultVeh.vehicle_id || 1);
            setSelectedVehicleId(defId);
          }
          setVehiclesLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load vehicles from API:', err);
          setVehiclesList(mockVehicles);
          if (mockVehicles.length > 0) {
            setSelectedVehicleId(String(mockVehicles[0].id || mockVehicles[0].vehicleId || 1));
          }
          setVehiclesLoading(false);
        }
      }
    }

    loadVehicles();
    return () => { cancelled = true; };
  }, [session?.user_id]);

  const parseDateTime = (dateStr) => {
    if (!dateStr) return new Date();
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const entryTime = parseDateTime(fromDate);
  const exitTime = parseDateTime(toDate);

  // Read the active session from localStorage (never hardcode the user ID).
  const getActiveUserId = () => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      return parsed?.user_id ?? parsed?.userId ?? null;
    } catch {
      return null;
    }
  };

  // Fetch the wallet balance for the active user from /api/wallet/{userId}.
  useEffect(() => {
    let cancelled = false;
    const userId = getActiveUserId();
    if (!userId) return undefined;

    async function loadBalance() {
      setWalletLoading(true);
      try {
        const res = await walletApi.getBalance(userId);
        if (!cancelled) {
          const balance =
            res?.balance ??
            res?.walletBalance ??
            res?.amount ??
            (typeof res === 'number' ? res : 0);
          setWalletBalance(Number(balance) || 0);
        }
      } catch (err) {
        console.error('Failed to load wallet balance:', err);
        if (!cancelled) setWalletBalance(0);
      } finally {
        if (!cancelled) setWalletLoading(false);
      }
    }

    loadBalance();
    return () => { cancelled = true; };
  }, [session?.user_id]);

  // Open the wallet popup. If there is no active session/user ID, redirect to
  // login and restore the wallet popup automatically after a successful login.
  const handleAddMoneyClick = () => {
    const userId = getActiveUserId();
    if (!userId) {
      const currentPath = window.location.pathname;
      const currentSearch = window.location.search;
      const sep = currentSearch ? '&' : '?';
      navigate('/login', {
        state: {
          from: { pathname: currentPath, search: `${currentSearch}${sep}wallet=1` },
        },
      });
      return;
    }
    setShowWalletModal(true);
  };

  // If the user was redirected to login to add money, reopen the wallet popup
  // automatically once they return to the Checkout page.
  useEffect(() => {
    if (searchParams.get('wallet') === '1' && isAuthenticated) {
      setShowWalletModal(true);
    }
  }, [searchParams, isAuthenticated]);

  const handleCreatePayment = async () => {
    if (!selectedVehicleId) {
      showToast('Please select a vehicle', 'error');
      setBookingError('Please select a vehicle before proceeding.');
      return;
    }

    setBookingError(null);
    setIsProcessing(true);
    setAnimationState('processing');

    try {
      const parsedVehId = parseInt(String(selectedVehicleId).replace(/\D/g, ''), 10) || 1;
      const parsedSlotId = parseInt(String(slotId || '1').replace(/\D/g, ''), 10) || 1;
      const userIdStr = String(session?.user_id || getActiveUserId() || 'user_001');
      const locationIdStr = String(locationId || '');

      const payload = {
        vehicleId: parsedVehId,
        userId: userIdStr,
        locationId: locationIdStr,
        slotId: parsedSlotId,
        fromDate: toLocalDateTime(entryTime),
        toDate: toLocalDateTime(exitTime),
      };

      console.log('Posting Parking Session payload:', payload);

      const response = await parkingSessionsApi.create(payload);

      console.log('Parking Session response:', response);
      setSessionResponse(response);

      showToast('Booking session created successfully!');
      setIsProcessing(false);
      setAnimationState('success');
      setShowSuccessModal(true);
    } catch (err) {
      setIsProcessing(false);
      setAnimationState('enter');
      const msg = err.message || 'Failed to create parking session. Please try again.';
      setBookingError(msg);
      showToast(msg, 'error');
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
      <Header locationId={locationId} onBackClick={() => navigate('/explorer')} onAddMoney={handleAddMoneyClick} />
      <main className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column - Booking Summary */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            <LocationSlotCard 
              location={location} 
              slotId={`Slot ${slotId}`} 
              floor={fromDate ? new Date(fromDate).toLocaleDateString() : 'Today'} 
              slotType="Standard"
            />

            {/* Vehicle Selection Card */}
            <VehicleCard
              vehicles={vehiclesList}
              selectedVehicleId={selectedVehicleId}
              onSelectVehicle={setSelectedVehicleId}
              isLoading={vehiclesLoading}
              error={vehiclesError}
            />

            {/* Date & Time Summary */}
            <div className="luxury-card p-4">
              <h3 className="text-on-surface font-semibold text-base mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Date & Time
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                <div className="p-2.5 bg-surface-container rounded-xl">
                  <div className="text-xs text-on-surface-variant mb-1">Start Date</div>
                  <div className="font-medium text-on-surface text-sm">{fromDate ? new Date(fromDate).toLocaleDateString() : 'Today'}</div>
                </div>
                <div className="p-2.5 bg-surface-container rounded-xl">
                  <div className="text-xs text-on-surface-variant mb-1">Entry Time</div>
                  <div className="font-medium text-on-surface text-sm">{fromDate ? new Date(fromDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}</div>
                </div>
                <div className="p-2.5 bg-surface-container rounded-xl">
                  <div className="text-xs text-on-surface-variant mb-1">End Date</div>
                  <div className="font-medium text-on-surface text-sm">{toDate ? new Date(toDate).toLocaleDateString() : 'Today'}</div>
                </div>
                <div className="p-2.5 bg-surface-container rounded-xl">
                  <div className="text-xs text-on-surface-variant mb-1">Exit Time</div>
                  <div className="font-medium text-on-surface text-sm">{toDate ? new Date(toDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Later'}</div>
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

          {/* Right column – Booking Summary */}
          <aside className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-20 space-y-4">
              {/* Wallet Balance */}
              <div className="luxury-card p-5 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-violet/10 pointer-events-none" />
                <div className="absolute -bottom-12 -left-8 w-32 h-32 rounded-full bg-violet/5 pointer-events-none" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-label-md text-on-surface-variant font-medium uppercase tracking-wider">
                      Wallet Balance
                    </span>
                    <button
                      onClick={handleAddMoneyClick}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-label-sm font-semibold rounded-lg bg-violet text-on-violet hover:bg-violet-hover transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Money
                    </button>
                  </div>
                  {walletLoading ? (
                    <div className="flex items-center gap-2 py-1">
                      <Loader2 className="w-5 h-5 animate-spin text-violet" />
                      <span className="text-body-md text-on-surface-variant">Loading balance...</span>
                    </div>
                  ) : (
                    <div className="flex items-end gap-2">
                      <span className="text-display-md font-bold text-on-surface tracking-tight">
                        {formatCurrency(walletBalance)}
                      </span>
                      <span className="text-label-md text-on-surface-variant mb-1.5">available</span>
                    </div>
                  )}
                  <div className="mt-3 pt-3 border-t border-outline-variant/50 flex items-center gap-2 text-label-sm text-on-surface-variant">
                    <WalletIcon className="w-4 h-4 text-violet" />
                    <span>Use your wallet for quick, secure parking payments</span>
                  </div>
                </div>
              </div>

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

              {/* Create Booking Button */}
              <button
                className="btn-luxury-primary w-full disabled:opacity-50 disabled:cursor-not-allowed py-4 text-lg"
                onClick={handleCreatePayment}
                disabled={isProcessing || !selectedVehicleId || vehiclesLoading}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Creating Booking...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Booking {formatCurrency(totalAmount)}</span>
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

      <WalletModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        userId={getActiveUserId()}
        initialBalance={walletBalance}
        onBalanceUpdate={setWalletBalance}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onViewPass={() => { setShowSuccessModal(false); navigate('/reservations'); }}
        onFindAnotherSpot={() => { setShowSuccessModal(false); navigate('/explorer'); }}
        slotId={`Slot ${slotId}`}
        location={location}
        duration={duration}
        totalAmount={totalAmount}
        entryTime={entryTime}
        animationState={animationState}
        sessionData={sessionResponse}
      />

      <ProcessingModal isProcessing={isProcessing} />
    </>
  );
}

