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
import Explorer from './pages/Explorer/Explorer';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={<Layout />}
          >
            <Route index element={<Navigate to="/explorer" replace />} />
            <Route path="explorer" element={<Explorer />} />
            <Route path="map" element={<SlotMap />} />
            <Route path="reservations" element={<Reservations />} />
            <Route path="history" element={<History />} />
            <Route path="profile" element={<Profile />} />
            <Route
              path="checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/explorer" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
