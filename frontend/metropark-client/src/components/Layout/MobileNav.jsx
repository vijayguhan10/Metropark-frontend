import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Compass, Map, Dock, User } from 'lucide-react';

const mobileNavItems = [
  { name: 'Explorer', href: '/', icon: Compass },
  { name: 'Map', href: '/map', icon: Map },
  { name: 'Bookings', href: '/reservations', icon: Dock },
  { name: 'Profile', href: '/profile', icon: User },
];

export default function MobileNav() {
  const location = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 pb-safe bg-surface border-t border-outline-variant shadow-lg">
      {mobileNavItems.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <NavLink
            key={item.name}
            to={item.href}
            className={`flex flex-col items-center justify-center transition-all ${
              isActive ? 'text-primary font-bold scale-90' : 'text-on-surface-variant'
            }`}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-label-sm font-label-sm mt-1">{item.name}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}