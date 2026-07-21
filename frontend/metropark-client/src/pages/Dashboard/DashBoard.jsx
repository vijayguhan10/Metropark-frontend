import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  MapPin,
  Filter,
  Box,
  ChevronLeft,
  ChevronRight,
  Navigation,
  Wallet as WalletIcon,
  Clock,
  Zap,
  Shield,
  TrendingUp,
  Map as MapIcon,
  Calendar,
  Star,
  History,
} from 'lucide-react';
import { parkingLocations, dashboardStats, user } from '../../data/mockData';

export default function Dashboard() {
  const [currentLocationIndex, setCurrentLocationIndex] = useState(0);

  const locationsToShow = parkingLocations.slice(0, 3);

  const nextLocation = () => {
    setCurrentLocationIndex((prev) => (prev + 1) % parkingLocations.length);
  };

  const prevLocation = () => {
    setCurrentLocationIndex((prev) => (prev - 1 + parkingLocations.length) % parkingLocations.length);
  };

  const getAvailabilityColor = (slots) => {
    if (slots > 10) return 'text-success';
    if (slots > 3) return 'text-warning';
    return 'text-error';
  };

  const getAvailabilityBg = (slots) => {
    if (slots > 10) return 'bg-success-light';
    if (slots > 3) return 'bg-warning-light';
    return 'bg-error-light';
  };

  const getAvailabilityBorder = (slots) => {
    if (slots > 10) return 'border-success/20';
    if (slots > 3) return 'border-warning/20';
    return 'border-error/20';
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-display-sm text-on-surface font-semibold tracking-tight">
            Welcome back, {user.name.split(' ')[0]}
          </h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Here's your parking overview for today
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/explorer" className="btn-luxury-outline">
            <Filter className="w-4 h-4" />
            Explore Parking
          </Link>
          <Link to="/checkout" className="btn-luxury-primary">
            <Navigation className="w-4 h-4" />
            Book a Slot
          </Link>
        </div>
      </div>

      {/* Active Reservation Card */}
      {dashboardStats.activeReservation && (
        <div className="luxury-card-elevated p-6 relative overflow-hidden">
          <div className="absolute inset-0  from-primary-light to-secondary-light opacity-10" />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary-light rounded-2xl flex items-center justify-center">
                <MapPin className="w-8 h-8 text-primary" />
              </div>
              <div>
                <span className="badge-luxury badge-luxury-primary">Active Reservation</span>
                <h2 className="text-headline-md font-bold text-on-surface mt-2">
                  {dashboardStats.activeReservation.locationName}
                </h2>
                <p className="text-label-md text-on-surface-variant mt-1">
                  Slot {dashboardStats.activeReservation.slot} • {dashboardStats.activeReservation.floor} • {dashboardStats.activeReservation.zone}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 sm:ml-auto">
              <div className="text-right hidden sm:block">
                <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">Time Remaining</p>
                <p className="text-headline-lg font-bold text-primary" id="dashboard-timer">2h 35m</p>
              </div>
              <Link to="/checkout" className="btn-luxury-primary">
                <Navigation className="w-4 h-4" />
                View Details
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid-luxury grid-luxury-3">
        {/* Stat 1: Average Search Time */}
        <div className="stat-luxury">
          <div className="stat-luxury-icon bg-primary-light text-primary">
            <Clock className="w-6 h-6" />
          </div>
          <div className="stat-luxury-value font-semibold">{dashboardStats.averageSearchTime}</div>
          <div className="stat-luxury-label">Avg Search Time</div>
          <div className="stat-luxury-trend stat-luxury-trend-positive">
            <TrendingUp className="w-4 h-4" />
            <span>12% faster than last month</span>
          </div>
        </div>

        {/* Stat 2: Monthly Savings */}
        <div className="stat-luxury">
          <div className="stat-luxury-icon bg-secondary-light text-secondary">
            <WalletIcon className="w-6 h-6" />
          </div>
          <div className="stat-luxury-value font-semibold">{dashboardStats.monthlySavings}</div>
          <div className="stat-luxury-label">Monthly Savings</div>
          <div className="stat-luxury-trend stat-luxury-trend-positive">
            <TrendingUp className="w-4 h-4" />
            <span>8% more than last month</span>
          </div>
        </div>

        {/* Stat 3: Total Bookings */}
        <div className="stat-luxury">
          <div className="stat-luxury-icon bg-tertiary-light text-tertiary">
            <Car className="w-6 h-6" />
          </div>
          <div className="stat-luxury-value">{dashboardStats.totalBookings}</div>
          <div className="stat-luxury-label">Total Bookings</div>
          <div className="stat-luxury-trend stat-luxury-trend-positive">
            <TrendingUp className="w-4 h-4" />
            <span>5 bookings this month</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid-luxury grid-luxury-4 gap-4">
        <Link to="/explorer" className="luxury-card p-5 text-center group hover:shadow-luxury-lg transition-all duration-300">
          <div className="w-12 h-12 mx-auto mb-3 bg-primary-light rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <MapIcon className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-title-md font-semibold text-on-surface">Explore</h3>
          <p className="text-label-sm text-on-surface-variant mt-1">Find parking near you</p>
        </Link>
        <Link to="/map" className="luxury-card p-5 text-center group hover:shadow-luxury-lg transition-all duration-300">
          <div className="w-12 h-12 mx-auto mb-3 bg-secondary-light rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <MapPin className="w-6 h-6 text-secondary" />
          </div>
          <h3 className="text-title-md font-semibold text-on-surface">Live Map</h3>
          <p className="text-label-sm text-on-surface-variant mt-1">Real-time availability</p>
        </Link>
        <Link to="/reservations" className="luxury-card p-5 text-center group hover:shadow-luxury-lg transition-all duration-300">
          <div className="w-12 h-12 mx-auto mb-3 bg-tertiary-light rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Calendar className="w-6 h-6 text-tertiary" />
          </div>
          <h3 className="text-title-md font-semibold text-on-surface">My Bookings</h3>
          <p className="text-label-sm text-on-surface-variant mt-1">Manage reservations</p>
        </Link>
        <Link to="/history" className="luxury-card p-5 text-center group hover:shadow-luxury-lg transition-all duration-300">
          <div className="w-12 h-12 mx-auto mb-3 bg-warning-light rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <History className="w-6 h-6 text-warning" />
          </div>
          <h3 className="text-title-md font-semibold text-on-surface">History</h3>
          <p className="text-label-sm text-on-surface-variant mt-1">Past transactions</p>
        </Link>
      </div>

      {/* Featured Locations */}
      {/* <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-headline-md font-semibold text-on-surface">Explore Nearby</h2>
            <p className="text-body-md text-on-surface-variant mt-1">Real-time availability in your area</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-luxury-ghost">
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <button className="btn-luxury-ghost">
              <Box className="w-4 h-4" />
              Grid
            </button>
          </div>
        </div>

        <div className="grid-luxury grid-luxury-3">
          {locationsToShow.map((location, index) => (
            <article
              key={location.id}
              className="luxury-card overflow-hidden group flex flex-col"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={location.image}
                  alt={location.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 right-4">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md bg-white/90 border ${getAvailabilityBorder(location.availableSlots)}`}>
                    <span
                      className={`w-2 h-2 rounded-full animate-pulse ${getAvailabilityBg(location.availableSlots)}`}
                    />
                    <span className="text-label-sm font-semibold text-on-surface">
                      {location.availableSlots} slots
                    </span>
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 flex gap-2">
                  <span className="badge-luxury badge-luxury-primary flex items-center gap-1">
                    <Star className="w-3 h-3" style={{ fontVariationSettings: "'FILL' 1" }} />
                    {location.rating}
                  </span>
                  <span className="badge-luxury badge-luxury-neutral flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {location.totalReviews} reviews
                  </span>
                </div>
              </div>
              <div className="p-5 space-y-4 flex-1 flex flex-col">
                <div>
                  <h3 className="text-title-lg font-bold text-on-surface">{location.name}</h3>
                  <p className="text-label-md text-on-surface-variant mt-1">{location.address}</p>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-headline-sm font-bold text-primary">
                    ${location.pricePerHour.toFixed(2)}<span className="text-label-md font-normal text-on-surface-variant">/hr</span>
                  </span>
                  <span className="badge-luxury badge-luxury-neutral">{location.floors} Floors</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {location.features.slice(0, 3).map((feature) => (
                    <span key={feature} className="badge-luxury badge-luxury-neutral text-label-sm">
                      {feature}
                    </span>
                  ))}
                  {location.features.length > 3 && (
                    <span className="badge-luxury badge-luxury-neutral text-label-sm">
                      +{location.features.length - 3} more
                    </span>
                  )}
                </div>
                <Link
                  to={`/explorer?location=${location.id}`}
                  className="btn-luxury-outline w-full mt-auto justify-center"
                >
                  View & Book
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div> */}

      {/* Map Teaser Section */}
      {/* <div className="luxury-card-elevated relative overflow-hidden h-72">
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuBwNCXeNyx1wPyPVt4ThA-UQ4egfG9j5NM-1fKBeLm6TLVHPev8R0vFgstBqvJCf7EyM2vzA-G8haZkjyHPeDpecGS9h7SSQGV7vNDax1o-oQAdCDbuZvdQdxgphl9evQHNT5elPvGnkCqIn6P_0ftjH1AhJzrkNY_BopA2-VWXiPMQzN49gzGf1Bk5FcLnbYgIECQ-_eT4DX2mMTFrXZSFRr2HW8ij4J7jPTvpCUO9Nluhd2El3fFosdqxGxQ_NSvB_lx76TSOm8AE)'
        }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
          <span className="badge-luxury badge-luxury-secondary mb-3 w-fit">Live Map View</span>
          <h3 className="text-headline-lg font-bold mb-2">Interactive Map</h3>
          <p className="text-body-md opacity-90 max-w-md mb-4">
            Find live navigation and sensor-based slot occupancy tracking in the expanded map view.
          </p>
          <Link to="/map" className="btn-luxury-secondary w-fit">
            <MapIcon className="w-4 h-4" />
            Open Map View
          </Link>
        </div>
      </div> */}

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 lg:bottom-8 lg:right-8 z-40 lg:hidden">
        <Link to="/checkout" className="btn-luxury-primary w-14 h-14 p-0 shadow-luxury-lg flex items-center justify-center">
          <Navigation className="w-6 h-6" />
        </Link>
      </div>
    </div>
  );
}
