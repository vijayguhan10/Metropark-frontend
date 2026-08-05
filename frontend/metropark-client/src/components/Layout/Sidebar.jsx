import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  History,
  HelpCircle,
  LogOut,
  User,
  Settings,
  PlusCircle,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Explorer', href: '/explorer', icon: Compass },
  { name: 'Reservations', href: '/reservations', icon: Calendar },
  { name: 'History', href: '/history', icon: History },
];

const bottomNavigation = [
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Help', href: '/help', icon: HelpCircle },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, logout } = useAuth();

  const displayName = session?.name || 'User';
  const displayMembership = session?.membership || 'Member';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="hidden lg:flex flex-col h-[calc(100vh-4.5rem)] sticky left-0 top-18 p-4 bg-surface/80 backdrop-blur-xl border-r border-outline-variant/50 w-64 flex-shrink-0">
      {/* User Profile Section */}
      <div className="mb-6 px-2">
        <div className="flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-surface-container transition-colors">
          <div className="avatar-luxury avatar-luxury-md">
            <span className="font-semibold">{displayName.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-title-md font-semibold text-on-surface truncate">{displayName}</p>
            <p className="text-label-sm text-on-surface-variant truncate">{displayMembership}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1" aria-label="Main navigation">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive: active }) =>
                `flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-200 ${
                  active
                    ? 'bg-primary-light text-primary font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`
              }
              aria-current={isActive ? 'page' : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              <span className="text-label-md font-medium truncate">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="mt-auto pt-4 border-t border-outline-variant/50 space-y-3">
        <button
          onClick={() => navigate('/explorer')}
          className="btn-luxury-primary w-full justify-center gap-2"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Book New Slot</span>
        </button>

        <div className="space-y-1 pt-2">
          {bottomNavigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors duration-200"
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-label-md font-medium">{item.name}</span>
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-error hover:bg-error-light transition-colors duration-200 w-full"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="text-label-md font-medium">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
