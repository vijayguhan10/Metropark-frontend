import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Map,
  CalendarClock,
  History,
  HelpCircle,
  LogOut,
  User,
  Settings,
  PlusCircle,
} from 'lucide-react';
import { user } from '../../data/mockData';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Map View', href: '/map', icon: Map },
  { name: 'Reservations', href: '/reservations', icon: CalendarClock },
  { name: 'History', href: '/history', icon: History },
];

const bottomNavigation = [
  { name: 'Help', href: '/help', icon: HelpCircle },
  { name: 'Logout', href: '/logout', icon: LogOut },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex flex-col h-[calc(100vh-4rem)] sticky left-0 top-16 p-4 bg-surface-container-low border-r border-outline-variant w-64">
      {/* User Profile Section */}
      <div className="mb-xl px-2">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
            <User className="w-5 h-5" />
          </div>
          <div>
            <p className="text-label-md font-bold text-on-surface">{user.name}</p>
            <p className="text-label-sm text-on-surface-variant">{user.membership}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-secondary-container text-on-secondary-container font-bold scale-95'
                    : 'text-on-surface-variant hover:bg-surface-variant'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="text-label-md font-label-md">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="mt-auto pt-lg border-t border-outline-variant">
        <button className="w-full py-3 bg-primary text-on-primary rounded-lg font-bold hover:opacity-90 transition-opacity mb-6 flex items-center justify-center gap-2">
          <PlusCircle className="w-5 h-5" />
          <span>Book New Slot</span>
        </button>
        <div className="space-y-1">
          {bottomNavigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <item.icon className="w-5 h-5" />
              <span className="text-label-md">{item.name}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </aside>
  );
}