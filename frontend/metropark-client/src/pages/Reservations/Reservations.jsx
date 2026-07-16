import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Filter,
  Add,
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
import { Card, Badge, Button, Modal } from '../../components/UI';

const statusConfig = {
  active: { variant: 'success', label: 'ACTIVE', icon: AlertCircle, color: 'text-warning' },
  exited: { variant: 'default', label: 'EXITED', icon: CheckCircle, color: 'text-secondary' },
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
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-headline-lg font-headline-lg text-on-surface mb-2">My Reservations</h1>
        <p className="text-body-md font-body-md text-on-surface-variant">Manage your active and upcoming parking sessions.</p>
      </div>

      {/* Active Reservation Banner */}
      {activeReservation && (
        <Card variant="outlined" className="border-primary bg-primary-fixed/20">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary-container text-on-primary-container rounded-xl flex items-center justify-center">
                <CheckCircle className="w-7 h-7" style={{ fontVariationSettings: "'FILL' 1" }} />
              </div>
              <div>
                <h3 className="text-body-lg font-bold text-on-surface">Active Session</h3>
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
              <Button variant="primary" leftIcon={<Clock className="w-4 h-4" />} onClick={() => setShowExtendModal(true)}>
                Extend
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Filters & Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={activeFilter === 'all' ? 'primary' : 'outline'}
            size="sm"
            leftIcon={<Filter className="w-4 h-4" />}
            onClick={() => setActiveFilter('all')}
          >
            All Sessions
          </Button>
          <Button
            variant={activeFilter === 'active' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('active')}
          >
            Active Only
          </Button>
          <Button
            variant={activeFilter === 'exited' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('exited')}
          >
            Completed
          </Button>
          <Button
            variant={activeFilter === 'cancelled' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('cancelled')}
          >
            Cancelled
          </Button>
        </div>
        <Button variant="secondary" leftIcon={<Add className="w-4 h-4" />}>
          Book New Slot
        </Button>
      </div>

      {/* Sessions Table */}
      <Card variant="outlined" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container text-on-surface-variant border-b border-outline-variant">
              <tr>
                <th className="px-6 py-4 text-label-md font-label-md">Location & Slot</th>
                <th className="px-6 py-4 text-label-md font-label-md">Status</th>
                <th className="px-6 py-4 text-label-md font-label-md">Entry Time</th>
                <th className="px-6 py-4 text-label-md font-label-md">Exit Time</th>
                <th className="px-6 py-4 text-label-md font-label-md text-right">Amount</th>
                <th className="px-6 py-4 text-label-md font-label-md text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filteredReservations.map((reservation) => {
                const config = statusConfig[reservation.status] || statusConfig.exited;
                const isActive = reservation.status === 'active';
                const isCancelled = reservation.status === 'cancelled';
                const Icon = config.icon;

                return (
                  <tr key={reservation.id} className={`hover:bg-surface-container-low transition-colors ${isCancelled ? 'opacity-75' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className={`text-body-md font-bold ${isCancelled ? 'text-on-surface-variant line-through' : 'text-on-surface'}`}>
                          {reservation.locationName}
                        </span>
                        <span className="text-label-sm font-label-sm text-on-surface-variant">
                          Slot: {reservation.slotId} ({reservation.floor})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={config.variant} size="sm" className="flex items-center gap-1">
                        <Icon className={`w-3 h-3 ${config.color}`} />
                        {config.label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-body-md font-body-md text-on-surface">
                      {formatDate(reservation.entryTime)}, {formatTime(reservation.entryTime)}
                    </td>
                    <td className="px-6 py-4 text-body-md font-body-md">
                      {reservation.exitTime
                        ? (
                          <>
                            {formatDate(reservation.exitTime)}, {formatTime(reservation.exitTime)}
                          </>
                        )
                        : (
                          <span className="text-on-surface-variant italic">Ongoing...</span>
                        )}
                    </td>
                    <td className="px-6 py-4 text-right text-body-md font-bold text-primary">
                      {formatCurrency(reservation.totalAmount)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isActive ? (
                        <Button variant="ghost" size="sm" className="text-primary-container font-bold" onClick={() => setShowExtendModal(true)}>
                          Extend Duration
                        </Button>
                      ) : isCancelled ? (
                        <span className="text-label-sm font-label-sm text-outline italic">Refund Issued</span>
                      ) : (
                        <Button variant="ghost" size="sm" leftIcon={<Receipt className="w-4 h-4" />}>
                          View Invoice
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-label-md font-label-md text-on-surface-variant">
          Showing {filteredReservations.length} of {reservations.length} sessions
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="w-10 h-10 p-0" disabled>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button variant="primary" size="sm" className="w-10 h-10 p-0">1</Button>
          <Button variant="ghost" size="sm" className="w-10 h-10 p-0">2</Button>
          <Button variant="ghost" size="sm" className="w-10 h-10 p-0">3</Button>
          <Button variant="ghost" size="sm" className="w-10 h-10 p-0">
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Extend Duration Modal */}
      <Modal
        isOpen={showExtendModal}
        onClose={() => setShowExtendModal(false)}
        title="Extend Parking Duration"
        size="sm"
      >
        <div className="space-y-6">
          <p className="text-body-md text-on-surface-variant">
            Extend your parking session at <strong>{activeReservation?.locationName}</strong>
          </p>
          <div className="space-y-4">
            <label className="block text-label-md font-label-md text-on-surface-variant">Additional Hours</label>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="lg" className="w-12 h-12 p-0" onClick={() => setExtendHours(Math.max(1, extendHours - 1))}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <span className="text-headline-lg font-bold text-on-surface w-16 text-center">{extendHours}h</span>
              <Button variant="outline" size="lg" className="w-12 h-12 p-0" onClick={() => setExtendHours(extendHours + 1)}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
            <div className="bg-surface-container rounded-lg p-4">
              <div className="flex justify-between text-body-md">
                <span className="text-on-surface-variant">Additional Cost ({extendHours}h × ${activeReservation?.ratePerHour?.toFixed(2) || '4.50'})</span>
                <span className="font-medium">${(extendHours * (activeReservation?.ratePerHour || 4.50)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-body-md mt-2 pt-2 border-t border-outline-variant">
                <span className="text-headline-md font-headline-md">New Total</span>
                <span className="text-headline-md font-headline-md text-primary">${((activeReservation?.totalAmount || 21.25) + extendHours * (activeReservation?.ratePerHour || 4.50)).toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" fullWidth onClick={() => setShowExtendModal(false)}>Cancel</Button>
            <Button variant="primary" fullWidth onClick={handleExtend}>Confirm Extension</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}