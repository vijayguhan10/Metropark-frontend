import React, { useState } from 'react';
import { User, Mail, Lock, Bell, Shield, Palette, Save, Edit2, Camera } from 'lucide-react';
import { user, vehicles, paymentMethods, settings } from '../../data/mockData';
import { Card, Button, Input, Badge } from '../../components/UI';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: '+1 (555) 123-4567',
    notifications: settings.notifications,
    privacy: settings.privacy,
    appearance: settings.appearance,
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'vehicles', label: 'Vehicles', icon: 'car' },
    { id: 'payments', label: 'Payments', icon: 'credit_card' },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  const handleSave = () => {
    console.log('Saving profile:', formData);
    setEditMode(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <Card variant="outlined" className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-primary-container flex items-center justify-center overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-primary text-3xl font-bold">{user.name.charAt(0)}</span>
              )}
            </div>
            {editMode && (
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-on-primary rounded-full flex items-center justify-center cursor-pointer hover:opacity-90">
                <Camera className="w-4 h-4" />
                <input type="file" accept="image/*" className="hidden" />
              </label>
            )}
          </div>
          <div className="flex-1 text-center md:text-left">
            {editMode ? (
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                label="Full Name"
                className="max-w-xs"
              />
            ) : (
              <>
                <h1 className="text-headline-lg font-headline-lg text-on-surface">{user.name}</h1>
                <p className="text-body-md text-on-surface-variant mt-1">{user.email}</p>
              </>
            )}
            {!editMode && (
              <Badge variant="secondary" className="mt-3 inline-flex">
                {user.membership}
              </Badge>
            )}
          </div>
          {editMode ? (
            <div className="flex gap-3 justify-center md:justify-end">
              <Button variant="outline" onClick={() => setEditMode(false)}>Cancel</Button>
              <Button variant="primary" leftIcon={<Save className="w-4 h-4" />} onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          ) : (
            <Button variant="ghost" leftIcon={<Edit2 className="w-4 h-4" />} onClick={() => setEditMode(true)}>
              Edit Profile
            </Button>
          )}
        </div>
      </Card>

      {/* Tab Navigation */}
      <div className="border-b border-outline-variant">
        <nav className="flex gap-8 overflow-x-auto" aria-label="Profile tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-4 border-b-2 font-label-md text-label-md transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab.icon === 'car' ? (
                <span className="material-symbols-outlined">directions_car</span>
              ) : tab.icon === 'credit_card' ? (
                <span className="material-symbols-outlined">credit_card</span>
              ) : (
                <tab.icon className="w-5 h-5" />
              )}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <Card variant="outlined" className="p-6">
          <h2 className="text-headline-md font-headline-md mb-6">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={!editMode}
              leftIcon={<User className="w-5 h-5" />}
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!editMode}
              leftIcon={<Mail className="w-5 h-5" />}
            />
            <Input
              label="Phone Number"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={!editMode}
              leftIcon={<span className="material-symbols-outlined">phone</span>}
            />
            <div className="md:col-span-2">
              <label className="block text-label-md font-label-md text-on-surface-variant mb-2">Member Since</label>
              <p className="text-body-md text-on-surface">{new Date(user.memberSince).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'vehicles' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-headline-md font-headline-md">My Vehicles</h2>
            <Button variant="primary" leftIcon={<span className="material-symbols-outlined">add</span>}>
              Add Vehicle
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vehicles.map((vehicle) => (
              <Card key={vehicle.id} variant="outlined" className="p-4">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${vehicle.isElectric ? 'bg-secondary/10' : 'bg-surface-container'}`}>
                    <span className="material-symbols-outlined text-on-surface">{vehicle.isElectric ? 'ev_station' : 'directions_car'}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-body-lg font-bold">{vehicle.make} {vehicle.model}</h3>
                      {vehicle.isDefault && <Badge variant="primary" size="sm">Default</Badge>}
                      {vehicle.isElectric && <Badge variant="success" size="sm">Electric</Badge>}
                    </div>
                    <p className="text-label-md text-on-surface-variant">{vehicle.licensePlate} • {vehicle.color}</p>
                  </div>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-headline-md font-headline-md">Payment Methods</h2>
            <Button variant="primary" leftIcon={<span className="material-symbols-outlined">add</span>}>
              Add Payment Method
            </Button>
          </div>
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <Card key={method.id} variant="outlined" className="p-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${method.type === 'visa' ? 'bg-primary/10' : 'bg-secondary/10'}`}>
                    {method.type === 'visa' ? (
                      <span className="material-symbols-outlined text-primary">credit_card</span>
                    ) : (
                      <span className="material-symbols-outlined text-secondary">apple</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-body-lg font-bold">
                        {method.type === 'visa' ? `Visa ending in ${method.last4}` : 'Apple Pay'}
                      </h3>
                      {method.isDefault && <Badge variant="primary" size="sm">Default</Badge>}
                    </div>
                    {method.expiry && <p className="text-label-md text-on-surface-variant">Expires {method.expiry}</p>}
                  </div>
                  <Button variant="ghost" size="sm">Manage</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <Card variant="outlined" className="p-6 space-y-6">
          <h2 className="text-headline-md font-headline-md">Notification Preferences</h2>
          <div className="space-y-4">
            {Object.entries(formData.notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="text-label-md font-label-md text-on-surface capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                  <p className="text-label-sm text-on-surface-variant">
                    {key === 'email' && 'Receive email notifications'}
                    {key === 'push' && 'Receive push notifications'}
                    {key === 'sms' && 'Receive SMS notifications'}
                    {key === 'sessionReminders' && 'Get reminders before your parking session starts/ends'}
                    {key === 'promotions' && 'Receive promotional offers and discounts'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setFormData({ ...formData, notifications: { ...formData.notifications, [key]: e.target.checked } })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'security' && (
        <Card variant="outlined" className="p-6 space-y-6">
          <h2 className="text-headline-md font-headline-md">Security Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-surface-container rounded-lg">
              <div>
                <p className="text-label-md font-label-md text-on-surface">Change Password</p>
                <p className="text-label-sm text-on-surface-variant">Update your account password</p>
              </div>
              <Button variant="outline" leftIcon={<Lock className="w-4 h-4" />}>Change</Button>
            </div>
            <div className="flex items-center justify-between p-4 bg-surface-container rounded-lg">
              <div>
                <p className="text-label-md font-label-md text-on-surface">Two-Factor Authentication</p>
                <p className="text-label-sm text-on-surface-variant">Add an extra layer of security</p>
              </div>
              <Button variant="outline" leftIcon={<Shield className="w-4 h-4" />}>Enable</Button>
            </div>
            <div className="flex items-center justify-between p-4 bg-surface-container rounded-lg">
              <div>
                <p className="text-label-md font-label-md text-on-surface">Login History</p>
                <p className="text-label-sm text-on-surface-variant">View recent login activity</p>
              </div>
              <Button variant="ghost" leftIcon={<span className="material-symbols-outlined">history</span>}>View</Button>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'appearance' && (
        <Card variant="outlined" className="p-6 space-y-6">
          <h2 className="text-headline-md font-headline-md">Appearance</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-surface-container rounded-lg">
              <div>
                <p className="text-label-md font-label-md text-on-surface">Theme</p>
                <p className="text-label-sm text-on-surface-variant">Choose your preferred color scheme</p>
              </div>
              <div className="flex gap-2">
                {['light', 'dark', 'system'].map((theme) => (
                  <button
                    key={theme}
                    onClick={() => setFormData({ ...formData, appearance: { ...formData.appearance, theme } })}
                    className={`px-4 py-2 rounded-lg text-label-md font-label-md transition-colors ${
                      formData.appearance.theme === theme
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface text-on-surface-variant hover:bg-surface-variant'
                    }`}
                  >
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-surface-container rounded-lg">
              <div>
                <p className="text-label-md font-label-md text-on-surface">Language</p>
                <p className="text-label-sm text-on-surface-variant">Select your preferred language</p>
              </div>
              <select
                value={formData.appearance.language}
                onChange={(e) => setFormData({ ...formData, appearance: { ...formData.appearance, language: e.target.value } })}
                className="px-4 py-2 bg-surface border border-outline-variant rounded-lg text-body-md focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}