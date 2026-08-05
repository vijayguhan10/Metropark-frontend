import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/DashBoard';
import SlotMap from './pages/SlotMap/SlotMap';
import Checkout from './pages/Checkout/Checkout';
import History from './pages/History/History';
import Reservations from './pages/Reservations/Reservations';
import Profile from './pages/Profile/Profile';
import Settings from './pages/Settings/Settings';
import Explorer from './pages/Explorer/Explorer';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="explorer" element={<Explorer />} />
            <Route path="map" element={<SlotMap />} />
            <Route path="reservations" element={<Reservations />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="history" element={<History />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
