import React, { useState, useMemo } from 'react';
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
  LayoutGrid,
  LayoutList,
  MapPin as MapPinIcon,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { parkingLocations } from '../../data/mockData';

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const filteredLocations = useMemo(() => {
    return parkingLocations.filter((location) => {
      const matchesSearch =
        location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesEV = !selectedFilters.evCharging || location.hasEVCharging;
      const matchesValet = !selectedFilters.valet || location.hasValet;
      const matchesCovered = !selectedFilters.covered || location.features.includes('Covered');
      const matches24h = !selectedFilters.open24h || location.isOpen24h;
      return matchesSearch && matchesEV && matchesValet && matchesCovered && matches24h;
    });
  }, [searchQuery, selectedFilters]);

  const sortedLocations = useMemo(() => {
    const sorted = [...filteredLocations].sort((a, b) => {
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
    return sorted;
  }, [filteredLocations, sortBy]);

  const paginatedLocations = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedLocations.slice(start, start + itemsPerPage);
  }, [sortedLocations, currentPage]);

  const totalPages = Math.ceil(sortedLocations.length / itemsPerPage);

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

  const getStatusConfig = (status) => {
    switch (status) {
      case 'available':
        return { variant: 'success', label: 'Available', icon: CheckCircle, color: 'text-success' };
      case 'limited':
        return { variant: 'warning', label: 'Limited', icon: AlertCircle, color: 'text-warning' };
      case 'full':
        return { variant: 'error', label: 'Full', icon: XCircle, color: 'text-error' };
      default:
        return { variant: 'neutral', label: 'Unknown', icon: AlertCircle, color: 'text-on-surface-variant' };
    }
  };

  const statusConfig = getStatusConfig(
    (location) => location.availableSlots > 10 ? 'available' : location.availableSlots > 3 ? 'limited' : 'full'
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page Header */}
      <div className="page-luxury-header">
        <h1 className="page-luxury-title">Explore Parking</h1>
        <p className="page-luxury-subtitle">Find and book the perfect parking spot near you</p>
      </div>

      {/* Search & Filters Card */}
      <div className="luxury-card p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Search Input */}
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 w-5 h-5" />
            <input
              type="text"
              placeholder="Search locations, address, or landmarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-luxury input-luxury-with-icon"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              className="btn-luxury-ghost"
              onClick={() => console.log('Open filters')}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-luxury min-w-[200px] py-2.5"
            >
              <option value="distance">Distance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="availability">Most Available</option>
            </select>

            <div className="flex border border-outline-variant/50 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2.5 transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
                aria-label="Grid view"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2.5 transition-colors ${
                  viewMode === 'list'
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
                aria-label="List view"
              >
                <LayoutList className="w-5 h-5" />
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
              className={`flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer transition-all duration-200 ${
                selectedFilters[filter.key]
                  ? 'bg-primary-light text-primary border border-primary/20'
                  : 'bg-surface-container-low border border-outline-variant/50 text-on-surface-variant hover:border-outline-variant hover:text-on-surface'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedFilters[filter.key]}
                onChange={(e) =>
                  setSelectedFilters({ ...selectedFilters, [filter.key]: e.target.checked })
                }
                className="sr-only peer"
              />
              <filter.icon className="w-4 h-4" />
              <span className="text-label-md font-medium">{filter.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-label-md text-on-surface-variant">
          Showing <span className="font-semibold text-on-surface">{paginatedLocations.length}</span> of{' '}
          <span className="font-semibold text-on-surface">{filteredLocations.length}</span> locations
        </p>
        <div className="flex items-center gap-2">
          {totalPages > 1 && (
            <>
              <button
                className="btn-luxury-icon"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`w-10 h-10 rounded-xl font-semibold transition-all duration-200 ${
                    page === currentPage
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`}
                  onClick={() => setCurrentPage(page)}
                  aria-label={`Page ${page}`}
                  aria-current={page === currentPage ? 'page' : undefined}
                >
                  {page}
                </button>
              ))}
              <button
                className="btn-luxury-icon"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Results Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid-luxury grid-luxury-3">
          {paginatedLocations.map((location) => (
            <LocationCard
              key={location.id}
              location={location}
              getAvailabilityColor={getAvailabilityColor}
              getAvailabilityBg={getAvailabilityBg}
              getAvailabilityBorder={getAvailabilityBorder}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedLocations.map((location) => (
            <LocationListCard
              key={location.id}
              location={location}
              getAvailabilityColor={getAvailabilityColor}
              getAvailabilityBg={getAvailabilityBg}
              getAvailabilityBorder={getAvailabilityBorder}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredLocations.length === 0 && (
        <div className="empty-luxury">
          <Search className="empty-luxury-icon" />
          <h3 className="empty-luxury-title">No locations found</h3>
          <p className="empty-luxury-description">
            Try adjusting your search or filters to find available parking spots.
          </p>
          <div className="empty-luxury-action">
            <button
              className="btn-luxury-outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedFilters({ evCharging: false, valet: false, covered: false, open24h: false });
              }}
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
          <p className="text-label-md text-on-surface-variant">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              className="btn-luxury-icon"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              aria-label="First page"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              className="btn-luxury-icon"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let page;
              if (totalPages <= 5) {
                page = i + 1;
              } else if (currentPage <= 3) {
                page = i + 1;
              } else if (currentPage >= totalPages - 2) {
                page = totalPages - 4 + i;
              } else {
                page = currentPage - 2 + i;
              }
              return (
                <button
                  key={page}
                  className={`w-10 h-10 rounded-xl font-semibold transition-all duration-200 ${
                    page === currentPage
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`}
                  onClick={() => setCurrentPage(page)}
                  aria-label={`Page ${page}`}
                  aria-current={page === currentPage ? 'page' : undefined}
                >
                  {page}
                </button>
              );
            })}
            <button
              className="btn-luxury-icon"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              className="btn-luxury-icon"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              aria-label="Last page"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function LocationCard({
  location,
  getAvailabilityColor,
  getAvailabilityBg,
  getAvailabilityBorder,
}) {
  const formatCurrency = (amount) => `$${amount.toFixed(2)}`;

  return (
    <article className="luxury-card overflow-hidden group flex flex-col">
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
            <MapPinIcon className="w-3 h-3" />
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
            {formatCurrency(location.pricePerHour)}<span className="text-label-md font-normal text-on-surface-variant">/hr</span>
          </span>
          <span className="badge-luxury badge-luxury-neutral">{location.floors} Floors</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {location.features.slice(0, 4).map((feature) => (
            <span key={feature} className="badge-luxury badge-luxury-neutral text-label-sm">
              {feature}
            </span>
          ))}
          {location.features.length > 4 && (
            <span className="badge-luxury badge-luxury-neutral text-label-sm">
              +{location.features.length - 4} more
            </span>
          )}
        </div>
        <Link
          to={`/checkout?location=${location.id}`}
          className="btn-luxury-outline w-full mt-auto justify-center"
        >
          <Navigation className="w-4 h-4" />
          View & Book
        </Link>
      </div>
    </article>
  );
}

function LocationListCard({
  location,
  getAvailabilityColor,
  getAvailabilityBg,
  getAvailabilityBorder,
}) {
  const formatCurrency = (amount) => `$${amount.toFixed(2)}`;

  return (
    <article className="luxury-card p-4 flex flex-col md:flex-row gap-6 items-start md:items-center">
      <div className="relative w-full md:w-32 h-32 md:h-24 rounded-xl overflow-hidden flex-shrink-0">
        <img
          src={location.image}
          alt={location.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full backdrop-blur-md bg-white/90 border ${getAvailabilityBorder(location.availableSlots)}`}>
            <span
              className={`w-1.5 h-1.5 rounded-full animate-pulse ${getAvailabilityBg(location.availableSlots)}`}
            />
            <span className="text-label-sm font-bold text-on-surface">{location.availableSlots}</span>
          </div>
        </div>
      </div>
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-title-lg font-bold text-on-surface">{location.name}</h3>
            <p className="text-label-md text-on-surface-variant">{location.address}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-headline-sm font-bold text-primary">{formatCurrency(location.pricePerHour)}/hr</span>
            <span className="badge-luxury badge-luxury-neutral">{location.floors} Floors</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="badge-luxury badge-luxury-primary flex items-center gap-1">
            <Star className="w-3 h-3" style={{ fontVariationSettings: "'FILL' 1" }} />
            {location.rating} ({location.totalReviews})
          </span>
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
      </div>
      <Link
        to={`/checkout?location=${location.id}`}
        className="btn-luxury-primary md:w-auto flex-shrink-0"
      >
        <Navigation className="w-4 h-4" />
        Book Now
      </Link>
    </article>
  );
}