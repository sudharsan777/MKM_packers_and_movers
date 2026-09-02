import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { PwaInstallModal } from '../components/ui/PwaInstallModal';
import { useAppContext } from '../store/AppContext';
import { formatCurrency } from '../utils';
import {
  Building2,
  FileText,
  Percent,
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  Save,
  Download,
  Settings as SettingsIcon,
  Tag,
  FileCode,
  Smartphone,
  Monitor,
  Trash2,
  Plus,
  RefreshCw,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { ServicePrice } from '../types';

export const Settings = () => {
  const {
    settings,
    servicePrices,
    updateSettings,
    updateServicePrices,
    addService,
    updateService,
    deleteService,
    uploadLogo,
    resetToCleanState,
    resetToDemoData,
  } = useAppContext();
  const { success, error: toastError } = useToast();
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const [formData, setFormData] = useState(settings);
  const [activeTab, setActiveTab] = useState<'profile' | 'billing' | 'services' | 'terms' | 'pwa' | 'database'>('profile');
  const [isPwaModalOpen, setIsPwaModalOpen] = useState(false);

  // New Service Rate Modal
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('3000');
  const [newServiceCategory, setNewServiceCategory] = useState('Handling');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'taxRate' || name.includes('Number') ? Number(value) : value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings(formData);
      success('Settings Saved', 'Business configurations and rates have been updated.');
    } catch (err: any) {
      toastError('Unable to Save Settings', err?.message || 'Unable to save. Please check your connection and try again.');
    }
  };

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) {
      toastError('Validation Error', 'Please enter a service name.');
      return;
    }
    const rate = Number(newServicePrice) || 0;
    addService({
      id: `srv-${Date.now()}`,
      name: newServiceName.trim(),
      defaultPrice: rate,
      category: newServiceCategory,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    success('Service Added', `${newServiceName} added to rate sheet.`);
    setIsAddServiceModalOpen(false);
    setNewServiceName('');
    setNewServicePrice('3000');
  };

  const handleResetToClean = () => {
    if (
      window.confirm(
        '⚠️ RESET TO ZERO STATE: This will clear all customer records, leads, quotes, bookings, invoices, and expenses for a pristine production launch. Are you sure?'
      )
    ) {
      resetToCleanState();
      success('Database Cleared', 'All test transactions cleared. Ready for live business operations.');
    }
  };

  const handleResetToDemo = () => {
    if (window.confirm('Reload demonstration dataset with sample customers, bookings, and invoices?')) {
      resetToDemoData();
      success('Demo Loaded', 'Demonstration records restored.');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
            Company Settings & Business Profile
          </h2>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            Configure company branding, GSTIN, default service rates, document prefixes, and PWA setup.
          </p>
        </div>

        <Button
          id="btn-save-all-settings"
          variant="primary"
          size="md"
          onClick={handleSave}
          leftIcon={<Save className="w-4 h-4 text-white" />}
          className="shrink-0 font-bold"
        >
          Save All Changes
        </Button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto gap-1 border-b border-slate-200/80 pb-1 text-xs font-bold">
        {[
          { id: 'profile', label: 'Company Profile', icon: Building2 },
          { id: 'billing', label: 'Invoices & Quotations', icon: FileText },
          { id: 'services', label: 'Service Rates', icon: Tag },
          { id: 'terms', label: 'Terms & Conditions', icon: FileCode },
          { id: 'pwa', label: 'Install App (PWA)', icon: Smartphone },
          { id: 'database', label: 'Data Management', icon: RefreshCw },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl cursor-pointer transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Tab 1: Company Profile */}
        {activeTab === 'profile' && (
          <Card>
            <CardHeader className="py-3.5 px-5 border-b border-slate-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <div>
                <CardTitle className="text-xs font-bold text-slate-900">Brand & Contact Details</CardTitle>
                <CardDescription>Printed on quotations, invoices, and dispatch documents</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              {/* Brand Logo Banner */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 text-white p-4.5 rounded-2xl shadow-sm border border-slate-800">
                <div className="flex items-center gap-4">
                  <img
                    src={formData.logoUrl || settings.logoUrl || '/logo.png'}
                    alt="MKM Logo"
                    className="w-16 h-16 rounded-full object-cover shadow-sm ring-2 ring-amber-400 shrink-0 bg-white"
                  />
                  <div>
                    <h3 className="font-extrabold text-white text-sm">Official MKM Brand Identity</h3>
                    <p className="text-slate-300 text-xs mt-0.5">
                      Embedded across all tax invoices, quotation PDFs, client WhatsApp summaries, and navigation.
                    </p>
                    <span className="inline-block mt-1.5 text-[10px] font-bold text-amber-300 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full">
                      Active on Invoices & Quotations
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isUploadingLogo}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            setIsUploadingLogo(true);
                            const url = await uploadLogo(file);
                            setFormData((prev) => ({ ...prev, logoUrl: url }));
                            success('Logo Uploaded', 'Company logo uploaded to Firebase Storage.');
                          } catch (err: any) {
                            toastError('Upload Failed', err?.message || 'Unable to upload logo.');
                          } finally {
                            setIsUploadingLogo(false);
                          }
                        }
                      }}
                    />
                    <span className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold text-xs transition-colors shadow-sm">
                      <Download className="w-3.5 h-3.5 rotate-180" />
                      {isUploadingLogo ? 'Uploading...' : 'Upload New Logo'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <Input
                  label="Registered Company Name *"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Primary Phone / Hotline *"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="WhatsApp Business Number *"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Company Email Address *"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Official Website URL"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                />
                <Input
                  label="GSTIN / Tax ID Number"
                  name="gstNumber"
                  value={formData.gstNumber || ''}
                  onChange={handleChange}
                />
              </div>

              <Textarea
                label="Registered Headquarters / Dispatch Address *"
                name="address"
                rows={2}
                value={formData.address}
                onChange={handleChange}
                required
              />
            </CardContent>
          </Card>
        )}

        {/* Tab 2: Invoices & Quotations */}
        {activeTab === 'billing' && (
          <Card>
            <CardHeader className="py-3.5 px-5 border-b border-slate-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <div>
                <CardTitle className="text-xs font-bold text-slate-900">Document Numbering & Taxes</CardTitle>
                <CardDescription>Prefixes, starting sequences, and standard GST tax</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                <Input
                  label="Invoice Number Prefix"
                  name="invoicePrefix"
                  value={formData.invoicePrefix}
                  onChange={handleChange}
                  placeholder="INV-"
                  required
                />
                <Input
                  label="Invoice Starting Number"
                  name="invoiceStartNumber"
                  type="number"
                  value={formData.invoiceStartNumber.toString()}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Default GST Tax Rate (%)"
                  name="taxRate"
                  type="number"
                  value={formData.taxRate.toString()}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Quotation Number Prefix"
                  name="quotationPrefix"
                  value={formData.quotationPrefix}
                  onChange={handleChange}
                  placeholder="QT-"
                  required
                />
                <Input
                  label="Quotation Starting Number"
                  name="quotationStartNumber"
                  type="number"
                  value={formData.quotationStartNumber.toString()}
                  onChange={handleChange}
                  required
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tab 3: Service Rates */}
        {activeTab === 'services' && (
          <Card>
            <CardHeader className="py-3.5 px-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-600" />
                <div>
                  <CardTitle className="text-xs font-bold text-slate-900">Standard Service Rate Sheet</CardTitle>
                  <CardDescription>Base rates used when auto-populating quotations and invoices</CardDescription>
                </div>
              </div>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setIsAddServiceModalOpen(true)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Service Rate
              </Button>
            </CardHeader>
            <CardContent className="p-5 space-y-3 text-xs">
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                {servicePrices.map((srv) => (
                  <div key={srv.id} className="p-3 bg-white flex items-center justify-between gap-3">
                    <div>
                      <p className="font-extrabold text-slate-900 text-xs">{srv.name}</p>
                      <p className="text-[11px] text-slate-400">{srv.category || 'Standard Service'}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-black text-slate-900 text-xs">
                        {formatCurrency(srv.defaultPrice)}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Remove ${srv.name}?`)) {
                            deleteService(srv.id);
                          }
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tab 4: Terms & Conditions */}
        {activeTab === 'terms' && (
          <Card>
            <CardHeader className="py-3.5 px-5 border-b border-slate-100 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-indigo-600" />
              <div>
                <CardTitle className="text-xs font-bold text-slate-900">Document Terms & Conditions</CardTitle>
                <CardDescription>Printed at the bottom of customer documents</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              <Textarea
                label="Standard Quotation & Booking Terms"
                name="terms"
                rows={4}
                value={formData.terms}
                onChange={handleChange}
                placeholder="Enter moving terms..."
              />
            </CardContent>
          </Card>
        )}

        {/* Tab 5: PWA Installation */}
        {activeTab === 'pwa' && (
          <Card>
            <CardHeader className="py-3.5 px-5 border-b border-slate-100 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-slate-500" />
              <div>
                <CardTitle className="text-xs font-bold text-slate-900">Progressive Web App (PWA)</CardTitle>
                <CardDescription>Install MKM Packers & Movers on your Desktop, Laptop, or Phone</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black text-base shrink-0">
                    MKM
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white leading-snug">MKM Logistics App</h4>
                    <p className="text-xs text-slate-300 font-normal">
                      Standalone desktop window • Works offline • Fast navigation
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="accent"
                  size="sm"
                  onClick={() => setIsPwaModalOpen(true)}
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                >
                  Open Install Guide
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tab 6: Data Management & Zero State Reset */}
        {activeTab === 'database' && (
          <Card>
            <CardHeader className="py-3.5 px-5 border-b border-slate-100 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-indigo-600" />
              <div>
                <CardTitle className="text-xs font-bold text-slate-900">Database & Production Setup</CardTitle>
                <CardDescription>Reset test data before production handoff or reload demo data</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Production Zero State Mode</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-800">
                  When preparing this platform for real customer use, click below to wipe all mock demo customers, leads, bookings, invoices, and payments.
                </p>
                <div className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResetToClean}
                    leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-600" />}
                    className="text-rose-600 border-rose-200 hover:bg-rose-50 font-bold"
                  >
                    Clear All Test Data (Zero State)
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 text-xs">Reload Demo Dataset</div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Reset the database with complete demo moving orders, invoices, and quotation records for presentation.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResetToDemo}
                  leftIcon={<RotateCcw className="w-3.5 h-3.5 text-slate-700" />}
                  className="font-bold"
                >
                  Reload Demo Records
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end pt-3">
          <Button variant="primary" size="md" type="submit" leftIcon={<Save className="w-4 h-4 text-white" />}>
            Save Settings
          </Button>
        </div>
      </form>

      {/* Add Service Rate Modal */}
      <Modal
        isOpen={isAddServiceModalOpen}
        onClose={() => setIsAddServiceModalOpen(false)}
        title="Add Service Rate"
        subtitle="Add a new standard moving service and default rate"
        maxWidth="md"
      >
        <form onSubmit={handleCreateService} className="space-y-3.5 text-xs">
          <Input
            label="Service Title *"
            placeholder="e.g. Storage & Warehousing (Per Month)"
            value={newServiceName}
            onChange={(e) => setNewServiceName(e.target.value)}
            required
          />
          <Input
            label="Default Price (₹) *"
            type="number"
            value={newServicePrice}
            onChange={(e) => setNewServicePrice(e.target.value)}
            required
          />
          <Input
            label="Category"
            placeholder="e.g. Handling / Packing / Freight"
            value={newServiceCategory}
            onChange={(e) => setNewServiceCategory(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddServiceModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Add Service
            </Button>
          </div>
        </form>
      </Modal>

      <PwaInstallModal isOpen={isPwaModalOpen} onClose={() => setIsPwaModalOpen(false)} />
    </div>
  );
};
