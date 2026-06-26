'use client';
import { useEffect, useState } from 'react';
import { useVenue } from '@/lib/venue-context';
import { QRMenuCard } from '@/components/QRMenuCard';

export default function QRMenuPage() {
  const { activeVenueId, venues } = useVenue();
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const venue = venues.find(v => v.id === activeVenueId);

  if (!activeVenueId || !venue) {
    return <p className="text-gray-500 text-sm">Select or create a venue first.</p>;
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">QR Allergen Menu</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Print and display this QR code — customers scan it to filter your menu by allergen.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
        <p className="text-xs text-blue-700">
          The public menu shows all <strong>available</strong> dishes with their allergen information. Customers can select allergens to avoid and see which dishes are safe for them. Mark dishes as &ldquo;Hidden&rdquo; on the Dishes page to remove them from the public menu.
        </p>
      </div>

      {baseUrl && <QRMenuCard venue={venue} baseUrl={baseUrl} />}

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="font-semibold text-gray-900 mb-2 text-sm">Tips for displaying your QR code</h2>
        <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
          <li>Print at a minimum of 3cm × 3cm for reliable scanning</li>
          <li>Include the text &ldquo;Scan for allergen information&rdquo; alongside the QR code</li>
          <li>Display on menus, table cards, or at the counter</li>
          <li>The link works on any smartphone — no app required</li>
        </ul>
      </div>
    </div>
  );
}
