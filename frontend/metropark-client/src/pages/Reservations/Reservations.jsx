import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Filter,
  Plus,
  ChevronLeft,
  ChevronRight,
  Receipt,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { reservations, user, vehicles } from '../../data/mockData';

const statusConfig = {
  active: { variant: 'success', label: 'ACTIVE', icon: AlertCircle, color: 'text-warning' },
  exited: { variant: 'default', label: 'EXITED', icon: CheckCircle, color: 'text-success' },
  cancelled: { variant: 'error', label: 'CANCELLED', icon: XCircle, color: 'text-error' },
};

export default function Reservations() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendHours, setExtendHours] = useState(1);

  const filteredReservations = activeFilter === 'all'
    ? reservations
    : reservations.filter(r => r.status === activeFilter);

  const formatCurrency = (amount) => `$${amount.toFixed(2)}`;
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  const formatTime = (dateString) => new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const activeReservation = reservations.find(r => r.status === 'active');

  const handleExtend = () => {
    // In a real app, this would call an API
    console.log('Extend reservation by', extendHours, 'hours');
    setShowExtendModal(false);
    setExtendHours(1);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page Header */}
      <div className="page-luxury-header">
        <h1 className="page-luxury-title">My Reservations</h1>
        <p className="page-luxury-subtitle">Manage your active and upcoming parking sessions.</p>
      </div>

      {/* Active Reservation Banner */}
      {activeReservation && (
        <div className="luxury-card border-primary/30 bg-primary-light/30 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary-light text-primary rounded-2xl flex items-center justify-center">
                <CheckCircle className="w-7 h-7" style={{ fontVariationSettings: "'FILL' 1" }} />
              </div>
              <div>
                <h3 className="text-title-lg font-bold text-on-surface">Active Session</h3>
                <p className="text-label-md text-on-surface-variant">
                  {activeReservation.locationName} • Slot {activeReservation.slotId} • {activeReservation.floor}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-label-sm text-on-surface-variant">Time Remaining</p>
                <p className="text-headline-md font-bold text-primary" id="active-timer">2h 35m</p>
              </div>
              <button className="btn-luxury-primary" onClick={() => setShowExtendModal(true)}>
                <Clock className="w-4 h-4" />
                Extend
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex gap-2 flex-wrap">
          <button
            className={`btn-luxury-sm ${activeFilter === 'all' ? 'btn-luxury-primary' : 'btn-luxury-outline'}`}
            onClick={() => setActiveFilter('all')}
          >
            <Filter className="w-4 h-4" />
            All Sessions
          </button>
          <button
            className={`btn-luxury-sm ${activeFilter === 'active' ? 'btn-luxury-primary' : 'btn-luxury-outline'}`}
            onClick={() => setActiveFilter('active')}
          >
            Active Only
          </button>
          <button
            className={`btn-luxury-sm ${activeFilter === 'exited' ? 'btn-luxury-primary' : 'btn-luxury-outline'}`}
            onClick={() => setActiveFilter('exited')}
          >
            Completed
          </button>
          <button
            className={`btn-luxury-sm ${activeFilter === 'cancelled' ? 'btn-luxury-primary' : 'btn-luxury-outline'}`}
            onClick={() => setActiveFilter('cancelled')}
          >
            Cancelled
          </button>
        </div>
        <Link to="/explorer" className="btn-luxury-secondary">
          <Plus className="w-4 h-4" />
          Book New Slot
        </Link>
      </div>

      {/* Sessions Table */}
      <div className="luxury-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-luxury">
            <thead>
              <tr>
                <th className="px-6 py-4">Location & Slot</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Entry Time</th>
                <th className="px-6 py-4">Exit Time</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50">
              {filteredReservations.map((reservation) => {
                const config = statusConfig[reservation.status] || statusConfig.exited;
                const isActive = reservation.status === 'active';
                const isCancelled = reservation.status === 'cancelled';
                const Icon = config.icon;

                return (
                  <tr key={reservation.id} className={`transition-colors duration-150 ${isCancelled ? 'opacity-75' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className={`text-body-md font-bold ${isCancelled ? 'text-on-surface-variant line-through' : 'text-on-surface'}`}>
                          {reservation.locationName}
                        </span>
                        <span className="text-label-sm font-medium text-on-surface-variant">
                          Slot: {reservation.slotId} ({reservation.floor})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge-luxury badge-luxury-${config.variant} flex items-center gap-1`}>
                        <Icon className={`w-3 h-3 ${config.color}`} />
                        {config.label}
                      </span>
                    </td>
                <td className="px-6 py-4 text-body-md text-on-surface">
                  {formatDate(reservation.entryTime)}, {formatTime(reservation.entryTime)}
                </td>
                <td className="px-6 py-4 text-body-md">
                  {reservation.exitTime ? (
                    <>
                      {formatDate(reservation.exitTime)}, {formatTime(reservation.exitTime)}
                    </>
                  ) : (
                    <span className="text-on-surface-variant italic">Ongoing...</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right text-body-md font-medium text-primary">
                  {formatCurrency(reservation.totalAmount)}
                </td>
                    <td className="px-6 py-4 text-right">
                      {isActive ? (
                        <button className="btn-luxury-ghost text-primary font-semibold" onClick={() => setShowExtendModal(true)}>
                          Extend Duration
                        </button>
                      ) : isCancelled ? (
                        <span className="text-label-sm font-medium text-outline italic">Refund Issued</span>
                      ) : (
                        <button className="btn-luxury-ghost">
                          <Receipt className="w-4 h-4" />
                          View Invoice
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-label-md font-medium text-on-surface-variant">
          Showing {filteredReservations.length} of {reservations.length} sessions
        </p>
        <div className="flex gap-2">
          <button className="btn-luxury-icon w-10 h-10 p-0" disabled>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button className="btn-luxury-primary w-10 h-10 p-0">1</button>
          <button className="btn-luxury-ghost w-10 h-10 p-0">2</button>
          <button className="btn-luxury-ghost w-10 h-10 p-0">3</button>
          <button className="btn-luxury-ghost w-10 h-10 p-0">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Extend Duration Modal */}
      <div
        className={`fixed inset-0 z-[var(--z-modal-backdrop)] bg-black/30 backdrop-blur-sm ${showExtendModal ? 'opacity-100 visible' : 'opacity-0 invisible'} transition-all duration-300`}
        onClick={() => setShowExtendModal(false)}
      >
        <div
          className={`fixed z-[var(--z-modal)] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm mx-4 bg-surface-container-lowest rounded-3xl shadow-luxury-lg border border-outline-variant/50 p-6 ${showExtendModal ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'} transition-all duration-300`}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-headline-md font-semibold text-on-surface mb-6">Extend Parking Duration</h2>
          <div className="space-y-6">
            <p className="text-body-md text-on-surface-variant">
              Extend your parking session at <strong>{activeReservation?.locationName}</strong>
            </p>
            <div className="space-y-4">
              <label className="block text-label-md font-medium text-on-surface-variant">Additional Hours</label>
              <div className="flex items-center justify-center gap-4">
                <button
                  className="btn-luxury-icon w-12 h-12 p-0"
                  onClick={() => setExtendHours(Math.max(1, extendHours - 1))}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-display-sm font-bold text-on-surface w-16 text-center">{extendHours}h</span>
                <button
                  className="btn-luxury-icon w-12 h-12 p-0"
                  onClick={() => setExtendHours(extendHours + 1)}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <div className="luxury-card-filled p-4">
                <div className="flex justify-between text-body-md">
                  <span className="text-on-surface-variant">Additional Cost ({extendHours}h × ${activeReservation?.ratePerHour?.toFixed(2) || '4.50'})</span>
                  <span className="font-medium">${(extendHours * (activeReservation?.ratePerHour || 4.50)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-body-md mt-2 pt-2 border-t border-outline-variant/50">
                  <span className="text-headline-md font-bold text-on-surface">New Total</span>
                  <span className="text-headline-md font-bold text-primary">${((activeReservation?.totalAmount || 21.25) + extendHours * (activeReservation?.ratePerHour || 4.50)).toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button className="btn-luxury-outline flex-1" onClick={() => setShowExtendModal(false)}>Cancel</button>
              <button className="btn-luxury-primary flex-1" onClick={handleExtend}>Confirm Extension</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}