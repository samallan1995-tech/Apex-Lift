import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'AllerSafe — allergen labelling UK food businesses can trust';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: '#0E2A06',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: '#9DE26B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0E2A06',
              fontSize: 44,
              fontWeight: 700,
            }}
          >
            ✓
          </div>
          <div style={{ fontSize: 56, fontWeight: 700 }}>AllerSafe</div>
        </div>
        <div style={{ marginTop: 48, fontSize: 64, fontWeight: 700, lineHeight: 1.1, maxWidth: 950 }}>
          Allergen labelling your kitchen can trust
        </div>
        <div style={{ marginTop: 28, fontSize: 30, color: '#C0DD97', maxWidth: 900 }}>
          Natasha’s Law PPDS labels · 14-allergen matrix · QR allergen menus
        </div>
        <div style={{ marginTop: 48, fontSize: 26, color: '#9DE26B' }}>
          allersafe.org — 14-day free trial, no card required
        </div>
      </div>
    ),
    size
  );
}
