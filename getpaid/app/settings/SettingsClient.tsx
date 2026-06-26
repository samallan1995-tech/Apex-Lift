'use client';

import { useEffect, useState } from 'react';
import { lsGetSettings, lsSaveSettings, DEFAULT_SETTINGS } from '@/lib/localStorage';
import type { CompanySettings } from '@/lib/types';
import { DEFAULT_BOE_BASE_RATE } from '@/lib/interest';

export default function SettingsClient({ userEmail }: { userEmail: string }) {
  const [settings, setSettings] = useState<CompanySettings>({
    ...DEFAULT_SETTINGS,
    email: userEmail,
  });
  const [saved, setSaved] = useState(false);
  const [licenseInput, setLicenseInput] = useState('');
  const [licenseMsg, setLicenseMsg] = useState('');

  useEffect(() => {
    const s = lsGetSettings();
    setSettings({ ...DEFAULT_SETTINGS, ...s, email: s.email || userEmail });
  }, [userEmail]);

  function save(e: React.FormEvent) {
    e.preventDefault();
    lsSaveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function set(field: keyof CompanySettings, value: string | number) {
    setSettings((prev) => ({ ...prev, [field]: value }));
  }

  function activateLicense() {
    // Minimal local license key validation
    if (licenseInput.length < 8) {
      setLicenseMsg('Invalid license key format.');
      return;
    }
    const tier = licenseInput.startsWith('SOLO-')
      ? 'solo'
      : licenseInput.startsWith('BIZ-')
      ? 'business'
      : licenseInput.startsWith('ONE-')
      ? 'oneoff'
      : null;

    if (!tier) {
      setLicenseMsg('Unrecognised key prefix. Keys begin with SOLO-, BIZ-, or ONE-.');
      return;
    }

    const updated: CompanySettings = {
      ...settings,
      licenseKey: licenseInput,
      licenseTier: tier as 'solo' | 'business' | 'oneoff',
      licenseEmail: userEmail,
    };
    lsSaveSettings(updated);
    setSettings(updated);
    setLicenseMsg(`License activated: ${tier.toUpperCase()} plan.`);
  }

  return (
    <form onSubmit={save} className="space-y-6">
      {/* Company details */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-gray-900">Company details</h2>
        <p className="text-sm text-gray-500">Used in all chaser letters and PDF downloads.</p>

        <Field label="Company name" required>
          <input className="input" value={settings.companyName} onChange={(e) => set('companyName', e.target.value)} placeholder="Acme Digital Ltd" />
        </Field>

        <Field label="Address">
          <textarea className="input" rows={3} value={settings.address} onChange={(e) => set('address', e.target.value)} placeholder="123 High Street, London, EC1A 1BB" />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Contact name">
            <input className="input" value={settings.contactName} onChange={(e) => set('contactName', e.target.value)} placeholder="Jane Smith" />
          </Field>
          <Field label="Email">
            <input className="input" type="email" value={settings.email} onChange={(e) => set('email', e.target.value)} />
          </Field>
          <Field label="Phone">
            <input className="input" value={settings.phone ?? ''} onChange={(e) => set('phone', e.target.value)} placeholder="+44 20 1234 5678" />
          </Field>
          <Field label="Website">
            <input className="input" value={settings.website ?? ''} onChange={(e) => set('website', e.target.value)} placeholder="https://yourcompany.co.uk" />
          </Field>
        </div>
      </div>

      {/* Bank details */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-gray-900">Payment details</h2>
        <p className="text-sm text-gray-500">Appear in letters so clients know where to send payment.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Bank name">
            <input className="input" value={settings.bankName ?? ''} onChange={(e) => set('bankName', e.target.value)} placeholder="Barclays" />
          </Field>
          <Field label="Account name">
            <input className="input" value={settings.accountName ?? ''} onChange={(e) => set('accountName', e.target.value)} placeholder="Acme Digital Ltd" />
          </Field>
          <Field label="Account number">
            <input className="input" value={settings.accountNumber ?? ''} onChange={(e) => set('accountNumber', e.target.value)} placeholder="12345678" />
          </Field>
          <Field label="Sort code">
            <input className="input" value={settings.sortCode ?? ''} onChange={(e) => set('sortCode', e.target.value)} placeholder="12-34-56" />
          </Field>
          <Field label="Payment reference">
            <input className="input" value={settings.paymentReference ?? ''} onChange={(e) => set('paymentReference', e.target.value)} placeholder="Invoice number" />
          </Field>
          <Field label="Stripe Payment Link (optional)">
            <input className="input" type="url" value={settings.stripePaymentLink ?? ''} onChange={(e) => set('stripePaymentLink', e.target.value)} placeholder="https://buy.stripe.com/..." />
          </Field>
        </div>
      </div>

      {/* Calculation defaults */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-gray-900">Calculation defaults</h2>

        <Field label="Bank of England base rate (%)">
          <input
            className="input"
            type="number"
            min="0"
            max="20"
            step="0.01"
            value={settings.defaultBoeRate}
            onChange={(e) => set('defaultBoeRate', parseFloat(e.target.value) || DEFAULT_BOE_BASE_RATE)}
          />
          <p className="mt-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
            ⚠ Check the current rate at <strong>bankofengland.co.uk</strong> — it changes. Statutory rate = 8% + base rate.
          </p>
        </Field>
      </div>

      {/* License */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-gray-900">License</h2>
        {settings.licenseTier ? (
          <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
            ✓ Active license: <strong>{settings.licenseTier?.toUpperCase()}</strong> plan — {settings.licenseEmail}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No license activated. The calculator is always free; upgrade for the full tracker and letters.</p>
        )}
        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="SOLO-XXXX-XXXX or BIZ-XXXX-XXXX"
            value={licenseInput}
            onChange={(e) => setLicenseInput(e.target.value.toUpperCase())}
          />
          <button type="button" onClick={activateLicense} className="btn-secondary whitespace-nowrap">
            Activate
          </button>
        </div>
        {licenseMsg && (
          <p className={`text-sm ${licenseMsg.includes('activated') ? 'text-green-600' : 'text-red-600'}`}>
            {licenseMsg}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" className="btn-primary px-8">
          {saved ? '✓ Saved!' : 'Save settings'}
        </button>
      </div>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
