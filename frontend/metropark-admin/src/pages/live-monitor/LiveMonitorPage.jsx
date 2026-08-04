import { useState, useEffect, useRef, useCallback } from 'react';
import { PageHeader } from "../../components/ui/PageHeader";
import { StatCard } from "../../components/ui/StatCard";
import { connectToPaymentsStream, connectToSessionsStream } from "../../services/liveMonitorApi";

const ITEMS_PER_PAGE = 10;

export function LiveMonitorPage() {
  // Payment stats state
  const [paymentStats, setPaymentStats] = useState({
    amount: 0,
    currency: 'USD',
    transactionCount: 0,
    period: 'TODAY'
  });

  // Sessions state
  const [sessions, setSessions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Connection refs
  const paymentsEventSourceRef = useRef(null);
  const sessionsEventSourceRef = useRef(null);

  // Connection status
  const [isPaymentsConnected, setIsPaymentsConnected] = useState(false);
  const [isSessionsConnected, setIsSessionsConnected] = useState(false);

  // Handle payment stats update
  const handlePaymentUpdate = useCallback((data) => {
    setPaymentStats(data);
    setIsPaymentsConnected(true);
  }, []);

  // Handle sessions update
  const handleSessionUpdate = useCallback((data) => {
    setSessions(prev => {
      // Check if session already exists (by sessionId)
      const exists = prev.some(session => session.sessionId === data.sessionId);
      if (exists) {
        // Update existing session
        return prev.map(session => 
          session.sessionId === data.sessionId ? data : session
        );
      } else {
        // Add new session at the beginning
        return [data, ...prev];
      }
    });
    setIsSessionsConnected(true);
  }, []);

  // Handle SSE errors
  const handleSSEError = useCallback((error, type) => {
    console.error(`${type} SSE error:`, error);
    if (type === 'payments') {
      setIsPaymentsConnected(false);
    } else {
      setIsSessionsConnected(false);
    }
  }, []);

  // Initialize SSE connections
  useEffect(() => {
    // Connect to payments stream
    paymentsEventSourceRef.current = connectToPaymentsStream(
      handlePaymentUpdate,
      (error) => handleSSEError(error, 'payments')
    );

    // Connect to sessions stream
    sessionsEventSourceRef.current = connectToSessionsStream(
      handleSessionUpdate,
      (error) => handleSSEError(error, 'sessions')
    );

    // Cleanup on unmount
    return () => {
      if (paymentsEventSourceRef.current) {
        paymentsEventSourceRef.current.close();
      }
      if (sessionsEventSourceRef.current) {
        sessionsEventSourceRef.current.close();
      }
    };
  }, [handlePaymentUpdate, handleSessionUpdate, handleSSEError]);

  // Calculate pagination
  useEffect(() => {
    setTotalPages(Math.ceil(sessions.length / ITEMS_PER_PAGE) || 1);
    if (currentPage > Math.ceil(sessions.length / ITEMS_PER_PAGE) || currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [sessions.length, totalPages]);

  // Get paginated sessions
  const paginatedSessions = sessions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Format currency
  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Format duration
  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Get status badge class
  const getStatusClass = (status) => {
    const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return `${base} bg-emerald-100 text-emerald-800`;
      case 'REGISTERED':
        return `${base} bg-blue-100 text-blue-800`;
      case 'GUEST':
        return `${base} bg-slate-100 text-slate-800`;
      case 'SUSPENDED':
        return `${base} bg-amber-100 text-amber-800`;
      case 'COMPLETED':
        return `${base} bg-violet-100 text-violet-800`;
      default:
        return `${base} bg-slate-100 text-slate-800`;
    }
  };

  return (
    <section>
      <PageHeader
        eyebrow="Real-time operations"
        title="Live monitoring feed"
        description="A cleaner operations view for active sessions, occupancy, and the current health of the parking network."
      />

      {/* Connection Status Indicators */}
      <div className="mb-4 flex items-center gap-4 text-sm">
        <span className={`flex items-center gap-1.5 ${isPaymentsConnected ? 'text-emerald-600' : 'text-rose-600'}`}>
          <span className={`w-2 h-2 rounded-full ${isPaymentsConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          Payments Stream
        </span>
        <span className={`flex items-center gap-1.5 ${isSessionsConnected ? 'text-emerald-600' : 'text-rose-600'}`}>
          <span className={`w-2 h-2 rounded-full ${isSessionsConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          Sessions Stream
        </span>
      </div>

      {/* Stats Cards - Using live payment data */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Revenue today"
          value={formatCurrency(paymentStats.amount, paymentStats.currency)}
          hint={`${paymentStats.transactionCount} transactions • ${paymentStats.period}`}
          tone="default"
        />
        <StatCard
          label="Active sessions"
          value={sessions.length.toLocaleString()}
          hint={`${sessions.filter(s => s.status === 'ACTIVE').length} currently active`}
          tone="cyan"
        />
        <StatCard
          label="Total transactions"
          value={paymentStats.transactionCount.toLocaleString()}
          hint={`Period: ${paymentStats.period}`}
          tone="violet"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[2fr_1fr]">
        {/* Active Sessions Table with Pagination */}
        <div className="rounded-3xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-950">
              Active session ledger
            </h3>
            <span className="text-xs text-slate-500">
              {sessions.length} total sessions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-black">
                <tr>
                  {["Session", "Plate", "Vehicle", "Slot", "Status", "Entry Time", "Duration"].map(
                    (header) => (
                      <th key={header} className="px-5 py-4 font-medium">
                        {header}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {paginatedSessions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-slate-500">
                      No active sessions
                    </td>
                  </tr>
                ) : (
                  paginatedSessions.map((session) => (
                    <tr
                      key={session.sessionId}
                      className="border-t border-slate-200 text-slate-700 hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 font-mono text-slate-900">{session.sessionId}</td>
                      <td className="px-5 py-4 font-medium">{session.plate}</td>
                      <td className="px-5 py-4">{session.vehicle}</td>
                      <td className="px-5 py-4 font-mono">{session.slot}</td>
                      <td className="px-5 py-4">
                        <span className={getStatusClass(session.status)}>
                          {session.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {session.entryTime ? new Date(session.entryTime).toLocaleTimeString() : '-'}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {session.durationMinutes ? formatDuration(session.durationMinutes) : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="border-t border-slate-200 px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  Page {currentPage} of {totalPages} • {sessions.length} sessions
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-950">
              Entry camera 04
            </h3>
            <div className="mt-4 aspect-video rounded-2xl bg-linear-to-br from-slate-50 via-white to-[rgba(167,139,250,0.12)]" />
            <p className="mt-3 text-sm text-slate-600">
              ANPR active. Latest plate detected: {sessions[0]?.plate || 'XYZ-9876'}.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-950">
              Telemetry logs
            </h3>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <p>14:32:01 INFO — New session initiated {sessions[0]?.sessionId || '#SN-88224'}</p>
              <p>14:31:58 INFO — Barrier 02 closed successfully</p>
              <p className="text-amber-600">
                14:31:12 WARN — Sensor mismatch on B1-12
              </p>
              <p className="text-rose-600">
                14:31:45 CRIT — Payment failure on #SN-88102
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}