'use client';
import dynamic from 'next/dynamic';
import type { Venue } from '@/types';

const QRCodeSVG = dynamic(() => import('qrcode.react').then(m => m.QRCodeSVG), { ssr: false });

interface Props {
  venue: Venue;
  baseUrl: string;
}

export function QRMenuCard({ venue, baseUrl }: Props) {
  const menuUrl = `${baseUrl}/menu/${venue.slug}`;

  function downloadSVG() {
    const svg = document.getElementById(`qr-${venue.id}`);
    if (!svg) return;
    const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-menu-${venue.slug}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function copyLink() {
    navigator.clipboard.writeText(menuUrl);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col items-center gap-3 text-center max-w-xs">
      <div className="p-3 bg-white border border-gray-200 rounded-lg">
        <QRCodeSVG
          id={`qr-${venue.id}`}
          value={menuUrl}
          size={140}
          level="M"
          includeMargin={true}
        />
      </div>
      <div>
        <p className="font-semibold text-gray-900 text-sm">{venue.name}</p>
        <p className="text-xs text-gray-500 mt-0.5 break-all">{menuUrl}</p>
      </div>
      <div className="flex gap-2 w-full">
        <button
          onClick={copyLink}
          className="flex-1 text-xs py-1.5 px-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-gray-700"
        >
          Copy link
        </button>
        <button
          onClick={downloadSVG}
          className="flex-1 text-xs py-1.5 px-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-gray-700"
        >
          Download QR
        </button>
      </div>
    </div>
  );
}
