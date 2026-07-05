'use client';
import { useState } from 'react';
import Link from 'next/link';
import type { Venue } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Modal } from './ui/Modal';

interface Props {
  venues: Venue[];
  activeVenueId: string | null;
  onSwitch: (venueId: string) => void;
  onCreated: (venue: Venue) => void;
}

export function VenueSwitcher({ venues, activeVenueId, onSwitch, onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [needsUpgrade, setNeedsUpgrade] = useState(false);

  const active = venues.find(v => v.id === activeVenueId);

  async function handleCreate() {
    if (!name.trim()) return;
    setLoading(true);
    setError('');
    setNeedsUpgrade(false);
    try {
      const res = await fetch('/api/venues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, address }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 402) {
          setNeedsUpgrade(true);
          throw new Error(data.message ?? 'You have reached your venue limit.');
        }
        throw new Error(data.message ?? data.error ?? 'Failed to create venue');
      }
      const venue: Venue = await res.json();
      onCreated(venue);
      setCreating(false);
      setName('');
      setAddress('');
      setOpen(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create venue');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-800 hover:bg-green-700 text-white text-sm font-medium transition-colors"
      >
        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" />
        </svg>
        <span className="max-w-[140px] truncate">{active?.name ?? 'Select venue'}</span>
        <svg className="w-4 h-4 ml-auto" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      <Modal open={open} onClose={() => { setOpen(false); setCreating(false); }} title="Switch Venue" size="sm">
        {!creating ? (
          <div className="space-y-2">
            {venues.map(v => (
              <button
                key={v.id}
                onClick={() => { onSwitch(v.id); setOpen(false); }}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors',
                  v.id === activeVenueId
                    ? 'bg-green-50 border border-green-500 text-green-900'
                    : 'border border-gray-200 hover:bg-gray-50 text-gray-800'
                )}
              >
                <span className="text-lg">🏪</span>
                <div>
                  <p className="font-medium text-sm">{v.name}</p>
                  {v.address && <p className="text-xs text-gray-500">{v.address}</p>}
                </div>
                {v.id === activeVenueId && (
                  <svg className="w-4 h-4 ml-auto text-green-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
            <Button variant="secondary" className="w-full mt-2" onClick={() => setCreating(true)}>
              + Add new venue
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Input label="Venue name" value={name} onChange={e => setName(e.target.value)} placeholder="The Green Plate" />
            <Input label="Address (optional)" value={address} onChange={e => setAddress(e.target.value)} placeholder="123 High Street, London" />
            {error && <p className="text-sm text-red-600">{error}</p>}
            {needsUpgrade && (
              <Link
                href="/dashboard/billing"
                onClick={() => setOpen(false)}
                className="block text-center text-sm font-medium text-white bg-green-700 hover:bg-green-800 rounded-lg px-4 py-2.5"
              >
                View plans &amp; pricing →
              </Link>
            )}
            <div className="flex gap-2">
              <Button onClick={handleCreate} loading={loading} disabled={!name.trim()}>Create</Button>
              <Button variant="secondary" onClick={() => setCreating(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
