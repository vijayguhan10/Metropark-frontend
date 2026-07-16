import React from 'react';
import { Link } from 'react-router-dom';
import {
  Filter,
  Add,
  ChevronLeft,
  ChevronRight,
  Receipt,
  User,
  MapPin,
  Dock,
  Compass,
} from 'lucide-react';
import { reservations, user } from '../../data/mockData';
import { Card, Badge, Button } from '../../components/UI';

const statusConfig = {
  active: { variant: 'success', label: 'ACTIVE' },
  exited: { variant: 'default', label: 'EXITED' },
  cancelled: { variant: 'error', label: 'CANCELLED' },
};

export default function History() {
  const formatCurrency = (amount) => `$${amount.toFixed(2)}`;
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  const formatTime = (dateString) => new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-headline-lg font-headline-lg text-on-surface mb-2">Reservations & History</h1>
        <p className="text-body-md font-body-md text-on-surface-variant">Manage your current parking sessions and review past transactions.</p>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex gap-2">
          <Button variant="primary" leftIcon={<Filter className="w-4 h-4" />} size="sm">
            All Sessions
          </Button>
          <Button variant="outline" size="sm">Active Only</Button>
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
              {reservations.map((reservation) => {
                const config = statusConfig[reservation.status] || statusConfig.exited;
                const isActive = reservation.status === 'active';
                const isCancelled = reservation.status === 'cancelled';

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
                      <Badge variant={config.variant} size="sm">
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
                        <Button variant="ghost" size="sm" className="text-primary-container font-bold">
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

      {/* Pagination/Footer Stats */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-label-md font-label-md text-on-surface-variant">Showing 5 of 42 sessions</p>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="w-10 h-10 p-0">
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
    </div>
  );
}