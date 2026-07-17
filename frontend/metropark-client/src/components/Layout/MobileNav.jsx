import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Compass, Map, Calendar, User, Dock, LayoutDashboard } from 'lucide-react';

const mobileNavItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Explorer', href: '/explorer', icon: Compass },
  { name: 'Map', href: '/map', icon: Map },
  { name: 'Reservations', href: '/reservations', icon: Calendar },
  { name: 'Profile', href: '/profile', icon: User },
];

export default function MobileNav() {
  const location = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-xl border-t border-outline-variant/50 shadow-luxury-lg pb-safe">
      <div className="flex items-center justify-around px-2 py-2">
        {mobileNavItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-primary bg-primary-light'
                  : 'text-on-surface-variant active:bg-surface-container'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <item.icon className={`w-6 h-6 transition-transform ${isActive ? 'scale-110' : ''}`} aria-hidden="true" />
              <span className="text-label-sm font-medium">{item.name}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}