import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Search,
  Bell,
  Settings,
  Menu,
  ChevronDown,
  User,
  LogOut,
} from 'lucide-react';
import { user, notifications } from '../../data/mockData';

export default function Header() {
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const headerLinks = [
    { name: 'Explorer', href: '/' },
    { name: 'My Bookings', href: '/reservations' },
    { name: 'Support', href: '/support' },
  ];

  return (
    <header className="sticky top-0 z-50 flex justify-between items-center w-full px-8 bg-surface h-16 border-b border-outline-variant">
      {/* Left Section - Logo & Search */}
      <div className="flex-1 flex items-center max-w-2xl">
        {/* Mobile Menu Button */}
        <button className="lg:hidden p-2 text-on-surface-variant hover:text-primary" aria-label="Open menu">
          <Menu className="w-6 h-6" />
        </button>

        <div className="relative w-full max-w-xl mx-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by location, city, or zip code..."
            className="w-full pl-10 pr-4 py-2 bg-surface-container border border-outline-variant rounded-lg focus:border-primary focus:ring-0 text-body-md transition-all"
          />
        </div>
      </div>

      {/* Right Section - Navigation & User */}
      <div className="flex items-center gap-4 ml-8">
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {headerLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={`text-label-md font-label-md transition-colors ${
                location.pathname === link.href
                  ? 'text-primary border-b-2 border-primary pb-1'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <button
            className="relative p-2 text-on-surface-variant hover:text-primary transition-colors"
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-error text-on-error text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Settings */}
          <button className="p-2 text-on-surface-variant hover:text-primary transition-colors" aria-label="Settings">
            <Settings className="w-5 h-5" />
          </button>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 px-3 py-1 bg-surface-container rounded-full hover:bg-surface-container-high transition-colors"
            >
              <div className="w-8 h-8 bg-primary-fixed rounded-full flex items-center justify-center">
                <span className="text-primary text-label-sm font-label-sm">
                  {user.name.charAt(0)}
                </span>
              </div>
              <span className="text-label-md font-label-md hidden sm:block">{user.name}</span>
              <ChevronDown className="w-4 h-4 text-on-surface-variant" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg py-2 z-50">
                <div className="px-4 py-2 border-b border-outline-variant">
                  <p className="text-label-md font-bold text-on-surface">{user.name}</p>
                  <p className="text-label-sm text-on-surface-variant">{user.email}</p>
                  <p className="text-label-sm text-primary font-medium mt-1">{user.membership}</p>
                </div>
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:bg-surface-variant transition-colors"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <User className="w-5 h-5" />
                  <span className="text-label-md">Profile</span>
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:bg-surface-variant transition-colors"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <Settings className="w-5 h-5" />
                  <span className="text-label-md">Settings</span>
                </Link>
                <div className="border-t border-outline-variant my-2" />
                <button
                  className="flex items-center gap-3 px-4 py-2 text-error hover:bg-error-container transition-colors w-full text-left"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-label-md">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}