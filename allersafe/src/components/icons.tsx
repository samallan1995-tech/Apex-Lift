import type { SVGProps } from 'react';

function Base({ children, className = '', ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconShield = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></Base>
);

export const IconOverview = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></Base>
);

export const IconIngredients = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" /><path d="M2 21c0-3 1.85-5.36 5.08-6" /></Base>
);

export const IconDishes = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3.2" /></Base>
);

export const IconMatrix = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}><rect x="3" y="3" width="18" height="18" rx="1.5" /><path d="M3 9h18 M3 15h18 M9 3v18 M15 3v18" /></Base>
);

export const IconLabels = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}><path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4z" /><path d="M7.5 7.5h.01" /></Base>
);

export const IconQr = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3 M20 14v.01 M17 20v.01 M20 17v4" /></Base>
);

export const IconBilling = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></Base>
);

export const IconWarning = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}><path d="M10.3 3.2 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.2a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4 M12 17h.01" /></Base>
);

export const IconCheck = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}><path d="M20 6 9 17l-5-5" /></Base>
);
