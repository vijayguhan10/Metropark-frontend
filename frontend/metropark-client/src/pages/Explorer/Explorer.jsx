import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  MapPin,
  Navigation,
  ChevronLeft,
  ChevronRight,
  Star,
  Clock,
  Zap,
  Shield,
  Car,
  Grid,
  List,
} from 'lucide-react';
import { parkingLocations } from '../../data/mockData';
import { Card, Badge, Button, Input } from '../../components/UI';

export default function Explorer() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    evCharging: false,
    valet: false,
    covered: false,
    open24h: false,
  });
  const [sortBy, setSortBy] = useState('distance');
  const [viewMode, setViewMode] = useState('grid');

  const filteredLocations = parkingLocations.filter((location) => {
    const matchesSearch = location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEV = !selectedFilters.evCharging || location.hasEVCharging;
    const matchesValet = !selectedFilters.valet || location.hasValet;
    const matchesCovered = !selectedFilters.covered || location.features.includes('Covered');
    const matches24h = !selectedFilters.open24h || location.isOpen24h;
    return matchesSearch && matchesEV && matchesValet && matchesCovered && matches24h;
  });

  const sortedLocations = [...filteredLocations].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.pricePerHour - b.pricePerHour;
      case 'price-high':
        return b.pricePerHour - a.pricePerHour;
      case 'rating':
        return b.rating - a.rating;
      case 'availability':
        return b.availableSlots - a.availableSlots;
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-headline-lg font-headline-lg text-on-surface mb-2">Explore Parking</h1>
        <p className="text-body-md text-on-surface-variant">Find and book the perfect parking spot near you</p>
      </div>

      {/* Search & Filters */}
      <Card variant="outlined" className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
            <Input
              placeholder="Search locations, address, or landmarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12"
              leftIcon={null}
            />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="outline" leftIcon={<Filter className="w-4 h-4" />} onClick={() => console.log('Open filters')}>
              Filters
            </Button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-body-md focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="distance">Distance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="availability">Most Available</option>
            </select>
            <div className="flex border border-outline-variant rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2.5 transition-colors ${viewMode === 'grid' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-variant'}`}
              >
                <GridView className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2.5 transition-colors ${viewMode === 'list' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-variant'}`}
              >
                <ListView className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-3 mt-6">
          {[
            { key: 'evCharging', label: 'EV Charging', icon: Zap },
            { key: 'valet', label: 'Valet Service', icon: Car },
            { key: 'covered', label: 'Covered', icon: Shield },
            { key: 'open24h', label: '24/7 Access', icon: Clock },
          ].map((filter) => (
            <label
              key={filter.key}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                selectedFilters[filter.key]
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container border border-outline-variant text-on-surface-variant hover:border-outline'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedFilters[filter.key]}
                onChange={(e) => setSelectedFilters({ ...selectedFilters, [filter.key]: e.target.checked })}
                className="sr-only peer"
              />
              <filter.icon className="w-4 h-4" />
              <span className="text-label-md font-label-md">{filter.label}</span>
            </label>
          ))}
        </div>
      </Card>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-label-md text-on-surface-variant">
          Showing {filteredLocations.length} of {parkingLocations.length} locations
        </p>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedLocations.map((location) => (
            <LocationCard key={location.id} location={location} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedLocations.map((location) => (
            <LocationListCard key={location.id} location={location} />
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center gap-2">
        <Button variant="ghost" size="sm" className="w-10 h-10 p-0" disabled>
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
  );
}

function LocationCard({ location }) {
  const formatCurrency = (amount) => `$${amount.toFixed(2)}`;

  return (
    <Card variant="outlined" className="group overflow-hidden flex flex-col hover:border-primary transition-all">
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
            {location.availableSlots} slots
          </span>
        </div>
        <div className="absolute bottom-4 left-4 flex gap-2">
          <Badge variant="primary" className="flex items-center gap-1">
            <Star className="w-3 h-3" style={{ fontVariationSettings: "'FILL' 1" }} />
            {location.rating}
          </Badge>
          <Badge variant="default" className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {location.totalReviews} reviews
          </Badge>
        </div>
      </div>
      <div className="p-6 space-y-4 flex-1 flex flex-col">
        <div>
          <h3 className="text-body-lg font-bold text-on-surface">{location.name}</h3>
          <p className="text-label-md text-on-surface-variant mt-1">{location.address}</p>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-body-lg font-black text-primary">
            {formatCurrency(location.pricePerHour)}<span className="text-label-sm font-normal text-on-surface-variant">/hr</span>
          </span>
          <Badge variant="default" size="sm">
            {location.floors} Floors
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {location.features.slice(0, 4).map((feature) => (
            <Badge key={feature} variant="default" size="sm">{feature}</Badge>
          ))}
          {location.features.length > 4 && (
            <Badge variant="default" size="sm">+{location.features.length - 4} more</Badge>
          )}
        </div>
        <Button
          variant="primary"
          fullWidth
          className="mt-auto"
          leftIcon={<Navigation className="w-4 h-4" />}
          onClick={() => console.log('Book at', location.name)}
        >
          View & Book
        </Button>
      </div>
    </Card>
  );
}

function LocationListCard({ location }) {
  const formatCurrency = (amount) => `$${amount.toFixed(2)}`;

  return (
    <Card variant="outlined" className="p-4 flex flex-col md:flex-row gap-6 items-start md:items-center">
      <div className="relative w-full md:w-32 h-32 md:h-24 rounded-lg overflow-hidden flex-shrink-0">
        <img
          src={location.image}
          alt={location.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 backdrop-blur-md rounded-full border border-outline-variant flex items-center gap-1">
          <span
            className={`w-1.5 h-1.5 rounded-full animate-pulse ${
              location.availableSlots > 10 ? 'bg-secondary' : location.availableSlots > 3 ? 'bg-warning' : 'bg-error'
            }`}
          />
          <span className="text-label-sm font-bold text-on-surface">{location.availableSlots}</span>
        </div>
      </div>
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-body-lg font-bold text-on-surface">{location.name}</h3>
            <p className="text-label-md text-on-surface-variant">{location.address}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-body-lg font-black text-primary">{formatCurrency(location.pricePerHour)}/hr</span>
            <Badge variant="default" size="sm">{location.floors} Floors</Badge>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="primary" className="flex items-center gap-1">
            <Star className="w-3 h-3" style={{ fontVariationSettings: "'FILL' 1" }} />
            {location.rating} ({location.totalReviews})
          </Badge>
          {location.features.slice(0, 3).map((feature) => (
            <Badge key={feature} variant="default" size="sm">{feature}</Badge>
          ))}
          {location.features.length > 3 && (
            <Badge variant="default" size="sm">+{location.features.length - 3} more</Badge>
          )}
        </div>
      </div>
      <Button
        variant="primary"
        size="md"
        leftIcon={<Navigation className="w-4 h-4" />}
        className="md:w-auto flex-shrink-0"
        onClick={() => console.log('Book at', location.name)}
      >
        Book Now
      </Button>
    </Card>
  );
}

