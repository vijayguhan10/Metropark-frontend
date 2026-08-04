import { EventSourcePolyfill } from 'event-source-polyfill';

const BASE_URL = 'http://localhost:8080/live';

/**
 * Creates an EventSource connection for Server-Sent Events
 * @param {string} endpoint - The SSE endpoint path
 * @param {Function} onMessage - Callback function to handle incoming messages
 * @param {Function} onError - Callback function to handle errors
 * @returns {EventSource} - The EventSource instance
 */
export const createSSEConnection = (endpoint, onMessage, onError) => {
  const url = `${BASE_URL}${endpoint}`;
  
  const eventSource = new EventSourcePolyfill(url, {
    headers: {
      'Accept': 'text/event-stream',
    },
    withCredentials: false,
  });

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (error) {
      console.error('Error parsing SSE message:', error);
    }
  };

  eventSource.onerror = (error) => {
    console.error('SSE connection error:', error);
    if (onError) {
      onError(error);
    }
  };

  return eventSource;
};

/**
 * Connects to the payments stream endpoint
 * @param {Function} onMessage - Callback for payment updates
 * @param {Function} onError - Callback for errors
 * @returns {EventSource} - The EventSource instance
 */
export const connectToPaymentsStream = (onMessage, onError) => {
  return createSSEConnection('/payments/stream', onMessage, onError);
};

/**
 * Connects to the sessions stream endpoint
 * @param {Function} onMessage - Callback for session updates
 * @param {Function} onError - Callback for errors
 * @returns {EventSource} - The EventSource instance
 */
export const connectToSessionsStream = (onMessage, onError) => {
  return createSSEConnection('/sessions/stream', onMessage, onError);
};

/**
 * Hook to manage SSE connections for live monitor
 * @returns {Object} - Object containing connection functions and state
 */
export const useLiveMonitorSSE = () => {
  const connections = {
    payments: null,
    sessions: null,
  };

  const connectPayments = (onMessage, onError) => {
    if (connections.payments) {
      connections.payments.close();
    }
    connections.payments = connectToPaymentsStream(onMessage, onError);
    return connections.payments;
  };

  const connectSessions = (onMessage, onError) => {
    if (connections.sessions) {
      connections.sessions.close();
    }
    connections.sessions = connectToSessionsStream(onMessage, onError);
    return connections.sessions;
  };

  const disconnectAll = () => {
    if (connections.payments) {
      connections.payments.close();
      connections.payments = null;
    }
    if (connections.sessions) {
      connections.sessions.close();
      connections.sessions = null;
    }
  };

  return {
    connectPayments,
    connectSessions,
    disconnectAll,
    connections,
  };
};

export default {
  createSSEConnection,
  connectToPaymentsStream,
  connectToSessionsStream,
  useLiveMonitorSSE,
};