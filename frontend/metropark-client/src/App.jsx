import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
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
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
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
  );
}

export default App;