import type { MetadataRoute } from 'next'

const BASE_URL = 'https://brickscore.de'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    { url: BASE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/preise`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/kontakt`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${BASE_URL}/impressum`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/datenschutz`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/agb`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ]
}
