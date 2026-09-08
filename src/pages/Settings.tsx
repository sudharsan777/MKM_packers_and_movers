import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';
import { PwaInstallModal } from '../components/ui/PwaInstallModal';
import { useAppContext } from '../store/AppContext';
import {
  Building2,
  FileText,
  Save,
  Download,
  FileCode,
  Smartphone,
  RefreshCw,
  CheckCircle2,
  Phone,
  Mail,
  Globe,
  MapPin,
} from 'lucide-react';

export const Settings = () => {
  const {
    settings,
    updateSettings,
    uploadLogo,
    resetToCleanState,
    resetToDemoData,
    reloadFromFirestore,
    isFirebaseActive,
  } = useAppContext();
  const { success, error: toastError } = useToast();
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const [formData, setFormData] = useState(settings);
  const [activeTab, setActiveTab] = useState<'profile' | 'billing' | 'terms' | 'pwa' | 'database'>('profile');
  const [isPwaModalOpen, setIsPwaModalOpen] = useState(false);

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
      success('Settings Saved', 'Company configurations have been saved to Cloud Firestore.');
    } catch (err: any) {
      toastError('Unable to Save', err?.message || 'Unable to save settings.');
    }
  };

  const handleResetToClean = () => {
    if (
      window.confirm(
        '⚠️ RESET TO CLEAN PRODUCTION: This will clear all test records and prepare pristine Firestore storage. Are you sure?'
      )
    ) {
      resetToCleanState();
      success('Database Cleared', 'All test transactions cleared. Ready for live business operations.');
    }
  };

  const handleResetToDemo = () => {
    if (window.confirm('Reload demonstration sample dataset?')) {
      resetToDemoData();
      success('Demo Restored', 'Sample demonstration records loaded.');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-[#EAE5DC] shadow-xs">
        <div>
          <h2 className="text-lg font-extrabold text-[#1A1D20] tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#9E7B4F]" />
            <span>Company Settings & Profiles</span>
          </h2>
          <p className="text-xs text-[#718292] font-normal mt-0.5">
            Configure official business information, contact phone numbers, addresses, and default document terms.
          </p>
        </div>

        <Button
          id="btn-save-all-settings"
          variant="primary"
          size="md"
          onClick={handleSave}
          leftIcon={<Save className="w-4 h-4 text-white" />}
          className="shrink-0 font-bold bg-[#9E7B4F] hover:bg-[#8A6A3E] text-white shadow-xs"
        >
          Save All Changes
        </Button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto gap-1.5 border-b border-[#EAE5DC] pb-1 text-xs font-bold">
        {[
          { id: 'profile', label: 'Company Profile & Contacts', icon: Building2 },
          { id: 'billing', label: 'Invoice & Quotation Setup', icon: FileText },
          { id: 'terms', label: 'Terms & Conditions', icon: FileCode },
          { id: 'pwa', label: 'App Installation (PWA)', icon: Smartphone },
          { id: 'database', label: 'Cloud Storage & Sync', icon: RefreshCw },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl cursor-pointer transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#1A1D20] text-white font-bold shadow-2xs'
                  : 'text-[#718292] hover:text-[#1A1D20] hover:bg-[#FAF8F5]'
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
              <Building2 className="w-4 h-4 text-cyan-700" />
              <div>
                <CardTitle className="text-xs font-bold text-slate-900">Brand Identity & Contacts</CardTitle>
                <CardDescription>Printed on top of all generated invoices and quotation letters</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              {/* Logo Banner */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 text-white p-4.5 rounded-2xl shadow-sm border border-slate-800">
                <div className="flex items-center gap-4">
                  <img
                    src={formData.logoUrl || settings.logoUrl || '/logo.png'}
                    alt="MKM Logo"
                    className="w-16 h-16 rounded-full object-cover shadow-sm ring-2 ring-cyan-400 shrink-0 bg-white"
                  />
                  <div>
                    <h3 className="font-extrabold text-white text-sm">Official MKM Brand Logo</h3>
                    <p className="text-slate-300 text-xs mt-0.5">
                      Included in PDF exports, print outputs, WhatsApp messages, and application headers.
                    </p>
                    <span className="inline-block mt-1.5 text-[10px] font-bold text-cyan-300 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full">
                      Active on Invoices & Quotations
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
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
                            success('Logo Uploaded', 'Company logo uploaded.');
                          } catch (err: any) {
                            toastError('Upload Failed', err?.message || 'Unable to upload logo.');
                          } finally {
                            setIsUploadingLogo(false);
                          }
                        }
                      }}
                    />
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-xs transition-colors shadow-sm cursor-pointer">
                      <Download className="w-3.5 h-3.5 rotate-180" />
                      {isUploadingLogo ? 'Uploading...' : 'Upload New Logo'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                <Input
                  label="Registered Company Name *"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Primary Phone Numbers *"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="98405 46766, 93423 06048"
                  required
                />
                <Input
                  label="WhatsApp Number *"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  placeholder="98405 46766"
                  required
                />
                <Input
                  label="Official Email Address *"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Website URL"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="www.mkmpackersandmovers.com"
                />
                <Input
                  label="GSTIN Number (Optional)"
                  name="gstNumber"
                  value={formData.gstNumber || ''}
                  onChange={handleChange}
                  placeholder="33ADVPU2567L3ZM"
                />
              </div>

              <Textarea
                label="Registered Headquarters / Dispatch Address *"
                name="address"
                rows={2}
                value={formData.address}
                onChange={handleChange}
                placeholder="NEW NO 13 OLD NO 6, VALLALAR STREET, PADMANABA NAGAR, CHOOLAIMEDU, CHENNAI 600 094."
                required
              />
            </CardContent>
          </Card>
        )}

        {/* Tab 2: Invoice & Quotation Setup */}
        {activeTab === 'billing' && (
          <Card>
            <CardHeader className="py-3.5 px-5 border-b border-slate-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-700" />
              <div>
                <CardTitle className="text-xs font-bold text-slate-900">Document Prefixes & Sequences</CardTitle>
                <CardDescription>Automatic numbering for new Invoices and Quotations</CardDescription>
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

        {/* Tab 3: Terms & Conditions */}
        {activeTab === 'terms' && (
          <Card>
            <CardHeader className="py-3.5 px-5 border-b border-slate-100 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-cyan-700" />
              <div>
                <CardTitle className="text-xs font-bold text-slate-900">Document Terms & Conditions</CardTitle>
                <CardDescription>Default terms and conditions printed on quotation letters and invoices</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              <Textarea
                label="Default Quotation Terms & Conditions (5-Point Standard List)"
                name="terms"
                rows={6}
                value={formData.terms}
                onChange={handleChange}
                placeholder="1. Payment: 100% to be paid at the time of loading.&#10;2. This quote is valid for 14 days from this day..."
              />

              <Textarea
                label="Default Invoice Terms & Conditions"
                name="invoiceTerms"
                rows={4}
                value={formData.invoiceTerms || ''}
                onChange={handleChange}
                placeholder="1. The rate is inclusive of packing material, loading and unloading charges.&#10;2. Payment is due upon delivery."
              />
            </CardContent>
          </Card>
        )}

        {/* Tab 4: PWA Installation */}
        {activeTab === 'pwa' && (
          <Card>
            <CardHeader className="py-3.5 px-5 border-b border-slate-100 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-cyan-700" />
              <div>
                <CardTitle className="text-xs font-bold text-slate-900">Install as Desktop / Mobile App (PWA)</CardTitle>
                <CardDescription>Fast, one-click access directly from your desktop or phone home screen</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4.5 rounded-2xl bg-slate-900 text-white border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500 flex items-center justify-center text-slate-950 font-black text-base shrink-0">
                    MKM
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">MKM Logistics App</h4>
                    <p className="text-xs text-slate-300 font-normal mt-0.5">
                      Standalone desktop window • Works offline • Fast invoice & quotation generation
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={() => setIsPwaModalOpen(true)}
                  leftIcon={<Download className="w-4 h-4" />}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                >
                  Install App Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tab 5: Cloud Storage & Sync */}
        {activeTab === 'database' && (
          <Card>
            <CardHeader className="py-3.5 px-5 border-b border-slate-100 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-cyan-700" />
              <div>
                <CardTitle className="text-xs font-bold text-slate-900">Cloud Storage & Data Management</CardTitle>
                <CardDescription>Firebase Firestore persistence status and maintenance</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h4 className="font-bold text-emerald-950 text-xs">Firebase Firestore Active</h4>
                    <p className="text-[11px] text-emerald-800">
                      Connected to project <span className="font-mono font-bold">mkm-packers-movers</span>. All Invoices, Quotations, and Settings are permanently synchronized in the cloud.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    await reloadFromFirestore();
                    success('Synchronized', 'All documents refreshed from Cloud Firestore.');
                  }}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Sync Now
                </button>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-2 justify-end">
                <Button type="button" variant="secondary" size="sm" onClick={handleResetToDemo}>
                  Load Sample Demo Records
                </Button>
                <Button type="button" variant="danger" size="sm" onClick={handleResetToClean}>
                  Reset to Clean Zero State
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </form>

      <PwaInstallModal isOpen={isPwaModalOpen} onClose={() => setIsPwaModalOpen(false)} />
    </div>
  );
};
