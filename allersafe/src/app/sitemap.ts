import type { MetadataRoute } from 'next';

const BASE = 'https://allersafe.org';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const page = (
    path: string,
    priority: number,
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] = 'monthly'
  ) => ({ url: `${BASE}${path}`, lastModified: now, changeFrequency, priority });

  return [
    page('/', 1, 'weekly'),
    page('/pricing', 0.9, 'weekly'),
    page('/signup', 0.9),
    page('/demo', 0.8),
    page('/free-allergen-matrix', 0.8),
    page('/natashas-law-labels', 0.7),
    page('/allergen-matrix-template', 0.7),
    page('/ppds-labelling-guide', 0.7),
    page('/menu-import', 0.6),
    page('/terms', 0.3, 'yearly'),
    page('/privacy', 0.3, 'yearly'),
  ];
}
