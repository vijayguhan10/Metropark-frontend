import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Search,
  Bell,
  Settings,
  Menu,
  ChevronDown,
  User,
  LogOut,
  X,
} from 'lucide-react';
import { user, notifications } from '../../data/mockData';

export default function Header() {
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const profileMenuRef = useRef(null);
  const notificationsRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const headerLinks = [
    { name: 'Explorer', href: '/explorer' },
    { name: 'My Bookings', href: '/reservations' },
    { name: 'Support', href: '/support' },
  ];

  return (
    <header className="sticky top-0 z-[var(--z-sticky)] w-full bg-surface/80 backdrop-blur-xl border-b border-outline-variant/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Left Section - Logo & Search */}
          <div className="flex-1 flex items-center gap-4 max-w-3xl">
            {/* Mobile Menu Button */}
            <button className="lg:hidden p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-xl transition-colors" aria-label="Open menu">
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 px-3 py-2 text-on-surface hover:opacity-80 transition-opacity" aria-label="Metropark Home">
              <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-on-primary font-bold text-headline-sm">M</span>
              </div>
              <span className="hidden sm:block text-headline-md font-semibold text-on-surface tracking-tight">Metropark</span>
            </Link>

            {/* Search */}
            <div className="relative w-full max-w-xl hidden sm:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search locations, cities, or landmarks..."
                className="input-luxury input-luxury-with-icon"
              />
            </div>
          </div>

          {/* Right Section - Actions & User */}
          <div className="flex items-center gap-2 ml-4">
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 bg-surface-container-low rounded-xl p-1">
              {headerLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`px-4 py-2 text-label-md font-medium rounded-lg transition-all duration-200 ${
                    location.pathname === link.href
                      ? 'bg-surface-container-lowest text-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {/* Notifications */}
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="btn-luxury-icon relative"
                  aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-error text-on-error text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="dropdown-luxury right-0 mt-2 w-80 animate-fade-in-up">
                    <div className="px-4 py-3 border-b border-outline-variant/50 flex items-center justify-between">
                      <h3 className="text-title-md font-semibold text-on-surface">Notifications</h3>
                      {unreadCount > 0 && (
                        <button className="text-label-sm text-primary hover:underline">Mark all read</button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-on-surface-variant">No notifications</div>
                      ) : (
                        notifications.map((notification) => (
                          <button
                            key={notification.id}
                            className={`dropdown-luxury-item w-full text-left p-4 gap-3 ${!notification.read ? 'bg-primary-light/50' : ''}`}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-body-sm font-medium text-on-surface truncate">{notification.title}</p>
                              <p className="text-label-sm text-on-surface-variant truncate mt-0.5">{notification.message}</p>
                              <p className="text-label-sm text-on-surface-variant/60 mt-1">{notification.time}</p>
                            </div>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                            )}
                          </button>
                        ))
                      )}
                    </div>
                    <div className="px-4 py-3 border-t border-outline-variant/50">
                      <Link to="/notifications" className="btn-luxury-ghost w-full justify-center" onClick={() => setShowNotifications(false)}>
                        View All Notifications
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Settings */}
              <button className="btn-luxury-icon" aria-label="Settings">
                <Settings className="w-5 h-5" />
              </button>

              {/* Profile Menu */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="btn-luxury-icon lg:px-3 lg:gap-2"
                  aria-expanded={showProfileMenu}
                  aria-haspopup="true"
                >
                  <div className="avatar-luxury avatar-luxury-sm">
                    <span className="font-semibold">{user.name.charAt(0)}</span>
                  </div>
                  <span className="hidden lg:block text-label-md font-medium text-on-surface">{user.name}</span>
                  <ChevronDown className="w-4 h-4 text-on-surface-variant hidden lg:block" />
                </button>

                {showProfileMenu && (
                  <div className="dropdown-luxury right-0 mt-2 w-56 animate-fade-in-up">
                    <div className="px-4 py-4 border-b border-outline-variant/50">
                      <p className="text-title-md font-semibold text-on-surface">{user.name}</p>
                      <p className="text-label-sm text-on-surface-variant mt-0.5">{user.email}</p>
                      <span className="badge-luxury badge-luxury-primary mt-2 inline-block">{user.membership}</span>
                    </div>
                    <Link
                      to="/profile"
                      className="dropdown-luxury-item"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <User className="w-5 h-5" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      to="/settings"
                      className="dropdown-luxury-item"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <Settings className="w-5 h-5" />
                      <span>Settings</span>
                    </Link>
                    <div className="divider-luxury mx-2" />
                    <button
                      className="dropdown-luxury-item text-error"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}