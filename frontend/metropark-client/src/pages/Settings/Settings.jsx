import React, { useState } from 'react';
import { Save, Bell, Shield, Palette, Globe, Delete } from 'lucide-react';
import { settings, user } from '../../data/mockData';
import { Card, Button, Badge, Input } from '../../components/UI';

export default function Settings() {
  const [formData, setFormData] = useState(settings);
  const [activeSection, setActiveSection] = useState('general');

  const sections = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'danger', label: 'Danger Zone', icon: Delete },
  ];

  const handleSave = () => {
    console.log('Saving settings:', formData);
    // In a real app, this would call an API
    alert('Settings saved successfully!');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-headline-lg font-headline-lg text-on-surface mb-2">Settings</h1>
        <p className="text-body-md text-on-surface-variant">Manage your account preferences and settings.</p>
      </div>

      {/* Section Navigation */}
      <Card variant="outlined" className="p-2">
        <nav className="flex gap-1 overflow-x-auto" aria-label="Settings sections">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg font-label-md text-label-md transition-colors whitespace-nowrap ${
                activeSection === section.id
                  ? 'bg-primary text-on-primary'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant'
              }`}
            >
              <section.icon className="w-5 h-5" />
              {section.label}
            </button>
          ))}
        </nav>
      </Card>

      {/* Section Content */}
      {activeSection === 'general' && (
        <Card variant="outlined" className="p-6 space-y-6">
          <h2 className="text-headline-md font-headline-md">General Settings</h2>
          <div className="space-y-4">
            <Input
              label="Display Name"
              value={formData.general?.displayName || user.name}
              onChange={(e) => setFormData({ ...formData, general: { ...formData.general, displayName: e.target.value } })}
              leftIcon={<span className="material-symbols-outlined">person</span>}
            />
            <Input
              label="Email Address"
              type="email"
              value={user.email}
              onChange={(e) => setFormData({ ...formData, general: { ...formData.general, email: e.target.value } })}
              leftIcon={<span className="material-symbols-outlined">mail</span>}
            />
            <div className="flex items-center justify-between p-4 bg-surface-container rounded-lg">
              <div>
                <p className="text-label-md font-label-md text-on-surface">Auto-save Preferences</p>
                <p className="text-label-sm text-on-surface-variant">Automatically save your parking preferences</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.general?.autoSave || true}
                  onChange={(e) => setFormData({ ...formData, general: { ...formData.general, autoSave: e.target.checked } })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </Card>
      )}

      {activeSection === 'notifications' && (
        <Card variant="outlined" className="p-6 space-y-6">
          <h2 className="text-headline-md font-headline-md">Notification Preferences</h2>
          <div className="space-y-4">
            {Object.entries(formData.notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-4 bg-surface-container rounded-lg">
                <div>
                  <p className="text-label-md font-label-md text-on-surface capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                  <p className="text-label-sm text-on-surface-variant">
                    {key === 'email' && 'Receive email notifications about your bookings'}
                    {key === 'push' && 'Receive push notifications on your device'}
                    {key === 'sms' && 'Receive SMS notifications for important updates'}
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

      {activeSection === 'security' && (
        <Card variant="outlined" className="p-6 space-y-6">
          <h2 className="text-headline-md font-headline-md">Security Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-surface-container rounded-lg">
              <div>
                <p className="text-label-md font-label-md text-on-surface">Two-Factor Authentication</p>
                <p className="text-label-sm text-on-surface-variant">Add an extra layer of security to your account</p>
              </div>
              <Button variant="outline" leftIcon={<Shield className="w-4 h-4" />}>
                {formData.security?.twoFactorEnabled ? 'Disable' : 'Enable'}
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 bg-surface-container rounded-lg">
              <div>
                <p className="text-label-md font-label-md text-on-surface">Change Password</p>
                <p className="text-label-sm text-on-surface-variant">Update your account password</p>
              </div>
              <Button variant="outline" leftIcon={<span className="material-symbols-outlined">lock</span>}>
                Change
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 bg-surface-container rounded-lg">
              <div>
                <p className="text-label-md font-label-md text-on-surface">Login History</p>
                <p className="text-label-sm text-on-surface-variant">View recent login activity</p>
              </div>
              <Button variant="ghost" leftIcon={<span className="material-symbols-outlined">history</span>}>
                View History
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 bg-surface-container rounded-lg">
              <div>
                <p className="text-label-md font-label-md text-on-surface">Active Sessions</p>
                <p className="text-label-sm text-on-surface-variant">Manage devices logged into your account</p>
              </div>
              <Button variant="ghost" leftIcon={<span className="material-symbols-outlined">devices</span>}>
                Manage
              </Button>
            </div>
          </div>
        </Card>
      )}

      {activeSection === 'appearance' && (
        <Card variant="outlined" className="p-6 space-y-6">
          <h2 className="text-headline-md font-headline-md">Appearance</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-label-md font-label-md text-on-surface-variant mb-3">Theme</label>
              <div className="flex gap-2">
                {['light', 'dark', 'system'].map((theme) => (
                  <button
                    key={theme}
                    onClick={() => setFormData({ ...formData, appearance: { ...formData.appearance, theme } })}
                    className={`flex-1 py-3 px-4 rounded-lg text-label-md font-label-md transition-colors border-2 ${
                      formData.appearance.theme === theme
                        ? 'border-primary bg-primary-fixed text-on-primary-fixed'
                        : 'border-outline-variant bg-surface text-on-surface-variant hover:border-outline'
                    }`}
                  >
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-label-md font-label-md text-on-surface-variant mb-3">Language</label>
              <select
                value={formData.appearance.language}
                onChange={(e) => setFormData({ ...formData, appearance: { ...formData.appearance, language: e.target.value } })}
                className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg text-body-md focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="zh">中文</option>
                <option value="ja">日本語</option>
              </select>
            </div>
            <div className="flex items-center justify-between p-4 bg-surface-container rounded-lg">
              <div>
                <p className="text-label-md font-label-md text-on-surface">Compact Mode</p>
                <p className="text-label-sm text-on-surface-variant">Reduce spacing for more content on screen</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.appearance.compactMode || false}
                  onChange={(e) => setFormData({ ...formData, appearance: { ...formData.appearance, compactMode: e.target.checked } })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </Card>
      )}

      {activeSection === 'danger' && (
        <Card variant="outlined" className="p-6 space-y-6 border-error/20">
          <div className="flex items-center gap-3 text-error">
            <Delete className="w-6 h-6" />
            <h2 className="text-headline-md font-headline-md">Danger Zone</h2>
          </div>
          <p className="text-body-md text-on-surface-variant">These actions are irreversible. Please proceed with caution.</p>
          <div className="space-y-4 pt-4 border-t border-outline-variant">
            <div className="flex items-center justify-between p-4 bg-error-container/50 rounded-lg border border-error/20">
              <div>
                <p className="text-label-md font-label-md text-error">Export Data</p>
                <p className="text-label-sm text-on-surface-variant">Download all your account data</p>
              </div>
              <Button variant="outline" className="border-error text-error hover:bg-error-container">Export</Button>
            </div>
            <div className="flex items-center justify-between p-4 bg-error-container/50 rounded-lg border border-error/20">
              <div>
                <p className="text-label-md font-label-md text-error">Delete Account</p>
                <p className="text-label-sm text-on-surface-variant">Permanently delete your account and all data</p>
              </div>
              <Button variant="danger" leftIcon={<Delete className="w-4 h-4" />}>Delete Account</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button variant="primary" leftIcon={<Save className="w-4 h-4" />} onClick={handleSave} size="lg">
          Save All Settings
        </Button>
      </div>
    </div>
  );
}