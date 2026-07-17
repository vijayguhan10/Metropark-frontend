import React from 'react';
import { Link } from 'react-router-dom';
import {
  Filter,
  Plus,
  ChevronLeft,
  ChevronRight,
  Receipt,
  User,
  MapPin,
  Dock,
  Compass,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Car,
} from 'lucide-react';
import { reservations, user } from '../../data/mockData';

const statusConfig = {
  active: { variant: 'success', label: 'ACTIVE', icon: AlertCircle, color: 'text-warning' },
  exited: { variant: 'default', label: 'EXITED', icon: CheckCircle, color: 'text-success' },
  cancelled: { variant: 'error', label: 'CANCELLED', icon: XCircle, color: 'text-error' },
};

export default function History() {
  const formatCurrency = (amount) => `$${amount.toFixed(2)}`;
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  const formatTime = (dateString) => new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page Header */}
      <div className="page-luxury-header">
        <h1 className="page-luxury-title">Reservations & History</h1>
        <p className="page-luxury-subtitle">Manage your current parking sessions and review past transactions.</p>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex gap-2 flex-wrap">
          <button className="btn-luxury-ghost">
            <Filter className="w-4 h-4" />
            All Sessions
          </button>
          <button className="btn-luxury-outline">Active Only</button>
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
              {reservations.map((reservation) => {
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
                        <button className="btn-luxury-ghost text-primary font-semibold">
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

      {/* Pagination/Footer Stats */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-label-md font-medium text-on-surface-variant">Showing 5 of 42 sessions</p>
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
    </div>
  );
}