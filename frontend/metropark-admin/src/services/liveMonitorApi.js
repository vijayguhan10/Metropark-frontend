import { EventSourcePolyfill } from 'event-source-polyfill';

const BASE_URL = 'http://localhost:8080/live';
const BFF_BASE_URL = 'http://localhost:8080/bff';

/**
 * Creates an EventSource connection for Server-Sent Events
 * @param {string} endpoint - The SSE endpoint path
 * @param {Function} onMessage - Callback function to handle incoming messages
 * @param {Function} onError - Callback function to handle errors
 * @param {string} baseUrl - Base URL for the connection (optional)
 * @returns {EventSource} - The EventSource instance
 */
export const createSSEConnection = (endpoint, onMessage, onError, baseUrl = BASE_URL) => {
  const url = `${baseUrl}${endpoint}`;
  
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
 * Connects to the simulation run endpoint (BFF)
 * @param {Function} onMessage - Callback for simulation events
 * @param {Function} onError - Callback for errors
 * @returns {EventSource} - The EventSource instance
 */
export const connectToSimulationStream = (onMessage, onError) => {
  return createSSEConnection('/run-simulation', onMessage, onError, BFF_BASE_URL);
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
 * Connects to the parking stream endpoint
 * @param {Function} onMessage - Callback for parking events (vehicle.entry, vehicle.exit)
 * @param {Function} onError - Callback for errors
 * @returns {EventSource} - The EventSource instance
 */
export const connectToParkingStream = (onMessage, onError) => {
  return createSSEConnection('/parking/stream', onMessage, onError);
};

/**
 * Hook to manage SSE connections for live monitor
 * @returns {Object} - Object containing connection functions and state
 */
export const useLiveMonitorSSE = () => {
  const connections = {
    payments: null,
    sessions: null,
    simulation: null,
    parking: null,
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

  const connectSimulation = (onMessage, onError) => {
    if (connections.simulation) {
      connections.simulation.close();
    }
    connections.simulation = connectToSimulationStream(onMessage, onError);
    return connections.simulation;
  };

  const connectParking = (onMessage, onError) => {
    if (connections.parking) {
      connections.parking.close();
    }
    connections.parking = connectToParkingStream(onMessage, onError);
    return connections.parking;
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
    if (connections.simulation) {
      connections.simulation.close();
      connections.simulation = null;
    }
    if (connections.parking) {
      connections.parking.close();
      connections.parking = null;
    }
  };

  return {
    connectPayments,
    connectSessions,
    connectSimulation,
    connectParking,
    disconnectAll,
    connections,
  };
};

export default {
  createSSEConnection,
  connectToPaymentsStream,
  connectToSessionsStream,
  connectToSimulationStream,
  connectToParkingStream,
  useLiveMonitorSSE,
};
