import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Arrow,
  CreditCard,
  CheckCircle,
  Timer,
  Verified,
  Security,
  ReceiptLong,
  ArrowBack,
  MapPin,
  Clock,
  Car,
} from 'lucide-react';
import { reservations, user, vehicles, paymentMethods, parkingLocations } from '../../data/mockData';
import { Button, Card, Badge, Modal } from '../../components/UI';

const activeReservation = reservations.find(r => r.status === 'active');

export default function Checkout() {
  const [selectedPayment, setSelectedPayment] = useState(activeReservation?.paymentMethod?.id || 'pm_001');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [countdown, setCountdown] = useState(4 * 60 + 35); // 4:35

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

  const minutes = Math.floor(countdown / 60).toString().padStart(2, '0');
  const seconds = (countdown % 60).toString().padStart(2, '0');

  const handleConfirmBooking = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsProcessing(false);
    setShowSuccessModal(true);
  };

  const formatCurrency = (amount) => `$${amount.toFixed(2)}`;

  if (!activeReservation) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card variant="outlined" className="text-center p-12 max-w-md">
          <p className="text-body-md text-on-surface-variant mb-6">No active reservation found.</p>
          <Button variant="primary" leftIcon={<ArrowBack className="w-4 h-4" />} onClick={() => window.history.back()}>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const location = parkingLocations.find(l => l.id === activeReservation.locationId);
  const vehicle = vehicles.find(v => v.id === activeReservation.vehicle.id);

  return (
    <>
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 flex justify-between items-center w-full px-8 bg-surface h-16 border-b border-outline-variant">
        <div className="flex items-center gap-4">
          <button
            className="flex items-center text-on-surface-variant hover:text-primary transition-colors"
            onClick={() => window.history.back()}
            aria-label="Go back"
          >
            <ArrowBack className="w-5 h-5" />
          </button>
          <span className="text-headline-md font-headline-md font-extrabold text-primary">Metropark</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-surface-container rounded-full text-label-sm font-bold text-on-surface">
            <span className="material-symbols-outlined text-[18px]">account_circle</span>
            {user.name}
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-error-container text-on-error-container rounded-full font-label-sm text-label-sm border border-error/20">
            <Timer className="w-4 h-4" />
            <span>Expiring in <span id="countdown" className="font-bold">{minutes}:{seconds}</span></span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Summary & Details */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <h1 className="text-headline-lg font-headline-lg">Booking Confirmation</h1>
            <p className="text-body-md text-on-surface-variant">Review your reservation details before completing payment.</p>
          </div>

          {/* Bento-style Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Slot Card */}
            <Card variant="outlined">
              <div className="flex justify-between items-start">
                <span className="text-label-sm text-on-surface-variant">SELECTED SLOT</span>
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div className="text-4xl font-black text-primary mt-2">{activeReservation.slotId}</div>
              <div className="flex items-center gap-2 text-on-surface-variant mt-2">
                <MapPin className="w-4 h-4" />
                <span className="text-label-md">{activeReservation.floor}, {activeReservation.zone}</span>
              </div>
            </Card>

            {/* Vehicle Details */}
            <Card variant="outlined">
              <span className="text-label-sm text-on-surface-variant">VEHICLE</span>
              <div className="flex items-center gap-4 mt-3">
                <div className="w-12 h-12 bg-surface-container rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-surface">directions_car</span>
                </div>
                <div>
                  <div className="text-label-md font-bold">{vehicle?.make} {vehicle?.model}</div>
                  <div className="text-label-sm text-on-surface-variant">{vehicle?.licensePlate} • {vehicle?.color}</div>
                </div>
              </div>
              <div className="mt-auto pt-3 border-t border-outline-variant/50">
                <Badge variant="success" size="sm">Premium Electric Spot</Badge>
              </div>
            </Card>

            {/* Duration Card */}
            <Card variant="outlined" className="md:col-span-2">
              <div className="flex justify-between items-center">
                <span className="text-label-sm text-on-surface-variant">EXPECTED DURATION</span>
                <span className="text-label-sm font-bold text-primary">CHANGE</span>
              </div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4">
                <div className="flex items-center gap-6">
                  <div>
                    <div className="text-label-sm text-on-surface-variant">ENTRY</div>
                    <div className="text-headline-md font-headline-md">
                      {new Date(activeReservation.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-label-sm">
                      {new Date(activeReservation.entryTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <div className="h-8 w-px bg-outline-variant" />
                  <div>
                    <div className="text-label-sm text-on-surface-variant">EXIT</div>
                    <div className="text-headline-md font-headline-md">
                      {new Date(activeReservation.exitTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-label-sm">
                      {new Date(activeReservation.exitTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-surface-container rounded-full">
                  <Clock className="w-5 h-5" />
                  <span className="text-label-md font-bold">{activeReservation.duration} Hours Total</span>
                </div>
              </div>
            </Card>
          </div>

          {/* High-end Visualization Area */}
          <Card variant="outlined" className="relative h-64 overflow-hidden group">
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 to-transparent" />
            <img
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              src={location?.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpqfjqGSYQhhU9DHfKZHJBQHWC8C81_AuoPDEtTRcZAG0W3IPX7JecwBqitcSJESOPbv2fd9oHmhInAGm1OIoSzxCgzZytjtUgs3y4Kx7n8T8NNgj5Q37xBNSY3wzxdlX3dRHcVr4uM2Nk18MEuB-k1j7n4eC2syzzj_lXf5wHdNCxc8_gYyhOwSaaX8HK7OkZrO8c-7F99mGpOsjNeLpVLc7RFJZCVtFQ3-A5_tcZd2KZZulgDyUtuUTsz2NwlUdXuTl86emDCcg-'}
              alt="Parking facility view"
            />
            <div className="absolute bottom-6 left-6 z-20 text-white">
              <div className="text-label-sm font-label-sm opacity-80">STATION VIEW</div>
              <div className="text-headline-md font-headline-md">{location?.name}</div>
            </div>
            <div className="absolute top-6 right-6 z-20">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Verified className="w-4 h-4" />
                LIVE STATUS
              </Badge>
            </div>
          </Card>
        </div>

        {/* Right Column: Checkout & Payment */}
        <aside className="lg:col-span-5">
          <div className="sticky top-24 space-y-6">
            {/* Payment Summary Card */}
            <Card variant="outlined" className="p-6 md:p-8 space-y-6">
              <h2 className="text-headline-md font-headline-md">Payment Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-body-md">
                  <span className="text-on-surface-variant">Base Rate ({activeReservation.duration}h × {formatCurrency(activeReservation.ratePerHour)})</span>
                  <span className="font-medium">{formatCurrency(activeReservation.ratePerHour * activeReservation.duration)}</span>
                </div>
                {activeReservation.evChargingFee > 0 && (
                  <div className="flex justify-between text-body-md">
                    <span className="text-on-surface-variant">EV Charging Fee</span>
                    <span className="font-medium">{formatCurrency(activeReservation.evChargingFee)}</span>
                  </div>
                )}
                <div className="flex justify-between text-body-md">
                  <span className="text-on-surface-variant">Service Charge</span>
                  <span className="font-medium">{formatCurrency(activeReservation.serviceCharge)}</span>
                </div>
                <div className="pt-3 border-t border-outline-variant flex justify-between items-center">
                  <span className="text-headline-md font-headline-md">Total</span>
                  <span className="text-headline-md font-headline-md text-primary">{formatCurrency(activeReservation.totalAmount)}</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="pt-4 space-y-3">
                <label className="text-label-md font-label-md text-on-surface-variant">SELECT PAYMENT METHOD</label>
                <div className="space-y-2">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedPayment === method.id
                          ? 'border-primary bg-primary-fixed'
                          : 'border-outline-variant hover:border-outline bg-surface'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={selectedPayment === method.id}
                        onChange={(e) => setSelectedPayment(e.target.value)}
                        className="hidden"
                      />
                      <div className="flex items-center gap-4 w-full">
                        {method.type === 'visa' ? (
                          <CreditCard className="w-5 h-5 text-primary" />
                        ) : (
                          <span className="w-5 h-5 text-on-surface-variant material-symbols-outlined">account_balance_wallet</span>
                        )}
                        <div className="flex-1">
                          <div className="text-label-md font-bold text-on-surface">
                            {method.type === 'visa' ? `Visa ending in ${method.last4}` : 'Apple Pay'}
                          </div>
                          {method.expiry && (
                            <div className="text-label-sm text-on-surface-variant">Expires {method.expiry}</div>
                          )}
                          {method.type === 'apple_pay' && (
                            <div className="text-label-sm text-on-surface-variant">Express Checkout</div>
                          )}
                        </div>
                        {selectedPayment === method.id && (
                          <CheckCircle className="w-5 h-5 text-primary" style={{ fontVariationSettings: "'FILL' 1" }} />
                        )}
                      </div>
                    </label>
                  ))}
                  <Button variant="ghost" fullWidth leftIcon={<Timer className="w-4 h-4" />}>
                    Add New Method
                  </Button>
                </div>
              </div>

              {/* Terms */}
              <div className="p-3 bg-surface-container rounded-lg text-label-sm text-on-surface-variant">
                <p>
                  By clicking confirm, you agree to our{' '}
                  <a className="underline font-bold text-on-surface" href="#">Terms of Service</a>
                  . Cancellation is free up to 30 minutes before entry.
                </p>
              </div>

              {/* Action Button */}
              <Button
                variant="secondary"
                size="xl"
                fullWidth
                rightIcon={<ArrowForward className="w-5 h-5" />}
                onClick={handleConfirmBooking}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Confirm Booking'
                )}
              </Button>
            </Card>

            {/* Trust Badges */}
            <div className="flex justify-center gap-8 text-on-surface-variant opacity-60">
              <div className="flex items-center gap-1 text-label-sm">
                <Security className="w-4 h-4" />
                Encrypted
              </div>
              <div className="flex items-center gap-1 text-label-sm">
                <ReceiptLong className="w-4 h-4" />
                VAT Invoice
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Booking Confirmed!"
        size="md"
      >
        <div className="text-center">
          <div className="w-20 h-20 bg-secondary-container text-on-secondary-container rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10" style={{ fontVariationSettings: "'FILL' 1" }} />
          </div>
          <h3 className="text-headline-lg font-headline-lg mb-2">Booking Confirmed!</h3>
          <p className="text-body-md text-on-surface-variant mb-6">
            Your slot <strong>{activeReservation.slotId}</strong> is now reserved. Your digital entry pass has been sent to your email.
          </p>
          <Button variant="primary" fullWidth onClick={() => window.location.reload()}>
            View Digital Pass
          </Button>
        </div>
      </Modal>
    </>
  );
}

// Need to import parkingLocations for the visualization
// import { parkingLocations } from '../../data/mockData';