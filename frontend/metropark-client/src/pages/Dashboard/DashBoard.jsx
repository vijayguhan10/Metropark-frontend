import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  MapPin,
  Filter,
  BoxIcon,
  //AddCircle,
  ChevronLeft,
  ChevronRight,
  Navigation,
  Wallet as WalletIcon,
} from 'lucide-react';
import { parkingLocations, dashboardStats, user } from '../../data/mockData';
import { Button, Card, Badge } from '../../components/UI';

export default function Dashboard() {
  const [currentLocationIndex, setCurrentLocationIndex] = useState(0);

  const locationsToShow = parkingLocations.slice(0, 3);

  const nextLocation = () => {
    setCurrentLocationIndex((prev) => (prev + 1) % parkingLocations.length);
  };

  const prevLocation = () => {
    setCurrentLocationIndex((prev) => (prev - 1 + parkingLocations.length) % parkingLocations.length);
  };

  return (
    <div className="space-y-8">
      {/* Hero/Welcome Section with Asymmetric Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Summary Card (Upcoming Reservation) */}
        <div className="lg:col-span-5 bg-primary-container text-on-primary-container p-6 rounded-xl relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10">
            <Badge variant="primary" className="mb-4" size="sm">
              Upcoming Reservation
            </Badge>
            <h2 className="text-headline-md font-headline-md mb-1">
              {dashboardStats.activeReservation.locationName}
            </h2>
            <p className="text-body-md opacity-80">
              Slot {dashboardStats.activeReservation.slot} • {dashboardStats.activeReservation.floor}
            </p>
          </div>
          <div className="mt-8 relative z-10 flex items-end justify-between">
            <div>
              <p className="text-label-sm opacity-60 uppercase tracking-widest">Entry Time</p>
              <p className="text-headline-md font-bold">{dashboardStats.activeReservation.entryTime}</p>
            </div>
            <Button variant="secondary" size="md">
              Get Directions
              <Navigation className="w-4 h-4" />
            </Button>
          </div>
          {/* Abstract Background Decoration */}
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        </div>

        {/* Market Insights / Stats */}
        <div className="lg:col-span-7 grid grid-cols-2 gap-6">
          <Card variant="outlined">
            <div className="flex flex-col justify-center">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                <Car className="w-7 h-7 text-secondary" />
              </div>
              <p className="text-label-sm text-on-surface-variant uppercase">Average Search Time</p>
              <p className="text-headline-md font-black">{dashboardStats.averageSearchTime}</p>
            </div>
          </Card>
          <Card variant="outlined">
            <div className="flex flex-col justify-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <WalletIcon className="w-7 h-7 text-primary" />
              </div>
              <p className="text-label-sm text-on-surface-variant uppercase">Monthly Savings</p>
              <p className="text-headline-md font-black">{dashboardStats.monthlySavings}</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Featured Locations Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-headline-md font-headline-md text-on-surface">Explore Nearby</h3>
          <p className="text-body-md text-on-surface-variant">Real-time availability in your current area</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" leftIcon={<Filter className="w-4 h-4" />}>
            Filters
          </Button>
          <Button variant="ghost" size="sm" leftIcon={<BoxIcon className="w-4 h-4" />}>
            Grid
          </Button>
        </div>
      </div>

      {/* Location Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {locationsToShow.map((location, index) => (
          <Card key={location.id} variant="outlined" className="group overflow-hidden flex flex-col hover:border-primary transition-all">
            <div className="relative h-48 overflow-hidden">
              <img
                src={location.image}
                alt={location.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full border border-outline-variant flex items-center gap-1">
                <span
                  className={`w-2 h-2 rounded-full animate-pulse ${
                    location.availableSlots > 10 ? 'bg-secondary' : location.availableSlots > 3 ? 'bg-warning' : 'bg-error'
                  }`}
                />
                <span className="text-label-sm font-bold text-on-surface">
                  {location.availableSlots} slots available
                </span>
              </div>
            </div>
            <div className="p-6 space-y-3 flex-1 flex flex-col">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-body-lg font-bold text-on-surface">{location.name}</h4>
                  <p className="text-label-md text-on-surface-variant">{location.address}</p>
                </div>
                <span className="text-body-lg font-black text-primary">
                  ${location.pricePerHour.toFixed(2)}<span className="text-label-sm font-normal text-on-surface-variant">/hr</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {location.features.slice(0, 3).map((feature) => (
                  <Badge key={feature} variant="default" size="sm">
                    {feature}
                  </Badge>
                ))}
                {location.features.length > 3 && (
                  <Badge variant="default" size="sm">
                    +{location.features.length - 3} more
                  </Badge>
                )}
              </div>
              <Button
                variant="outline"
                fullWidth
                className="mt-auto"
                onClick={() => console.log('Book slot at', location.name)}
              >
                View & Book
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Real-time Map Teaser */}
      <Card variant="outlined" className="relative h-64 overflow-hidden group">
        <div className="absolute inset-0 bg-surface-dim">
          <div className="w-full h-full bg-cover bg-center" style={{
            backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuBwNCXeNyx1wPyPVt4ThA-UQ4egfG9j5NM-1fKBeLm6TLVHPev8R0vFgstBqvJCf7EyM2vzA-G8haZkjyHPeDpecGS9h7SSQGV7vNDax1o-oQAdCDbuZvdQdxgphl9evQHNT5elPvGnkCqIn6P_0ftjH1AhJzrkNY_BopA2-VWXiPMQzN49gzGf1Bk5FcLnbYgIECQ-_eT4DX2mMTFrXZSFRr2HW8ij4J7jPTvpCUO9Nluhd2El3fFosdqxGxQ_NSvB_lx76TSOm8AE)'
          }} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex flex-col justify-end p-6 text-white">
          <h4 className="text-headline-md font-bold">Interactive Map</h4>
          <p className="text-body-md opacity-90 max-w-md mt-1">
            Find live navigation and sensor-based slot occupancy tracking in the expanded map view.
          </p>
          <Button
            variant="primary"
            className="mt-4 w-fit"
            leftIcon={<MapPin className="w-4 h-4" />}
            onClick={() => console.log('Open Map View')}
          >
            Open Map View
          </Button>
        </div>
      </Card>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 lg:bottom-12 lg:right-12 z-40">
        <Button
          variant="primary"
          size="xl"
          className="w-16 h-16 p-0 shadow-[0px_4px_12px_rgba(0,0,0,0.08)] group"
          leftIcon={<MapPin className="w-7 h-7" />}
          onClick={() => console.log('Book a Slot')}
        >
          <span className="absolute right-full mr-4 px-3 py-2 bg-inverse-surface text-inverse-on-surface text-label-md rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Book a Slot
          </span>
        </Button>
      </div>
    </div>
  );
}