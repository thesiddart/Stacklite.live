/**
 * JSON-LD for the marketing homepage (Schema.org). No site search — SearchAction omitted.
 */
export const LANDING_PAGE_JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://stacklite.live/#website',
      url: 'https://stacklite.live',
      name: 'Stacklite',
      description: 'The freelancer operating system',
      publisher: {
        '@id': 'https://stacklite.live/#organization',
      },
    },
    {
      '@type': 'Organization',
      '@id': 'https://stacklite.live/#organization',
      name: 'Stacklite',
      url: 'https://stacklite.live',
      logo: {
        '@type': 'ImageObject',
        url: 'https://stacklite.live/logo-dark.svg',
        width: 161,
        height: 44,
      },
      founder: {
        '@type': 'Person',
        name: 'Siddhartha Dwivedi',
        url: 'https://siddart.net',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'hello@stacklite.live',
        contactType: 'customer support',
      },
      sameAs: ['https://twitter.com/the_siddart', 'https://siddart.net'],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Stacklite',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: 'https://stacklite.live',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      featureList: [
        'Contract Generator',
        'Invoice Generator',
        'Time Tracker',
        'Client Manager',
        'Income Tracker',
      ],
      screenshot: 'https://stacklite.live/og-image.png',
      author: {
        '@type': 'Person',
        name: 'Siddhartha Dwivedi',
      },
    },
  ],
} as const
