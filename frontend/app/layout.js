import './globals.css';
import Header from '../src/components/Header.js';
import Footer from '../src/components/Footer.js';
import Preloader from '../src/components/Preloader.js';
import HashRedirect from '../src/components/HashRedirect.js';
import Providers from '../src/components/Providers.js';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://muis.bd'),
  title: {
    default: 'Metropolitan University Islamic Society (MUIS)',
    template: '%s | Metropolitan University Islamic Society (MUIS)'
  },
  description: 'Official platform of Metropolitan University Islamic Society (MUIS). Empowering students through Quranic education, Seerah conferences, campus halaqas, youth leadership, and community service at Metropolitan University, Sylhet.',
  keywords: [
    'MUIS',
    'muis',
    'muis.bd',
    'metropolitan university islamic society',
    'metropolitan university islamic society sylhet',
    'metro islamic society',
    'metro islamic society sylhet',
    'islamic society',
    'metro society',
    'muis platform',
    'metropolitan university sylhet',
    'metropolitan university bangladesh',
    'muis seerah 2026',
    'seerah competition sylhet',
    'campus musalla metropolitan university',
    'muslim student association sylhet',
    'msa metropolitan university',
    'islamic courses sylhet',
    'student halaqas sylhet',
    'sisters sanctuary muis',
    'quran recitation qirat sylhet',
    'tajweed workshops',
    'islamic youth leadership bangladesh'
  ],
  authors: [{ name: 'Metropolitan University Islamic Society (MUIS)', url: 'https://muis.bd' }],
  creator: 'Metropolitan University Islamic Society',
  publisher: 'Metropolitan University Islamic Society',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Metropolitan University Islamic Society (MUIS) | Faith, Character & Excellence',
    description: 'Welcome to Metropolitan University Islamic Society (MUIS). Providing prayer facilities, educational halaqas, Seerah events, charity drives, and a warm sanctuary for students at Metropolitan University, Sylhet.',
    url: 'https://muis.bd',
    siteName: 'Metropolitan University Islamic Society (MUIS)',
    images: [
      {
        url: '/MUIIS_cvr-02.png',
        width: 1200,
        height: 630,
        alt: 'Metropolitan University Islamic Society (MUIS)',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Metropolitan University Islamic Society (MUIS)',
    description: 'Empowering faith, character, academic excellence, and campus leadership at Metropolitan University, Sylhet.',
    images: ['/MUIIS_cvr-02.png'],
  },
  verification: {
    google: 'zLQ4oXk4h6qWsEAbf9ntTmXKLykAKzg5zt8rUiTwHpc'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window !== 'undefined') {
                  var filterMsg = function(args) {
                    if (!args || !args[0]) return false;
                    var str = String(args[0]);
                    return str.indexOf('powerPreference') !== -1 || str.indexOf('369219127') !== -1;
                  };
                  ['warn', 'log', 'error', 'info'].forEach(function(method) {
                    var orig = console[method];
                    if (orig) {
                      console[method] = function() {
                        if (filterMsg(arguments)) return;
                        orig.apply(console, arguments);
                      };
                    }
                  });
                  if (typeof navigator !== 'undefined' && navigator.gpu && navigator.gpu.requestAdapter) {
                    var origAdapter = navigator.gpu.requestAdapter.bind(navigator.gpu);
                    navigator.gpu.requestAdapter = function(opts) {
                      if (opts && opts.powerPreference) {
                        delete opts.powerPreference;
                      }
                      return origAdapter(opts);
                    };
                  }
                }
              })();
            `
          }}
        />
        <meta name="keywords" content="muis, metropolitan university islamic society, metro islamic society, islamic society, metro society, muis sylhet, metropolitan university sylhet, metropolitan university bangladesh, muslim student association, seerah 2026, campus musalla, islamic courses sylhet, tajweed, halaqas" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="google-site-verification" content="zLQ4oXk4h6qWsEAbf9ntTmXKLykAKzg5zt8rUiTwHpc" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'EducationalOrganization',
                  '@id': 'https://muis.bd/#organization',
                  'name': 'Metropolitan University Islamic Society',
                  'alternateName': ['MUIS', 'Metro Islamic Society', 'Metro Society', 'MUIS Sylhet'],
                  'url': 'https://muis.bd',
                  'logo': 'https://muis.bd/muis_logo_white.png',
                  'image': 'https://muis.bd/MUIIS_cvr-02.png',
                  'description': 'Student-led organization empowering spiritual growth, academic excellence, Quranic education, and community service at Metropolitan University, Sylhet, Bangladesh.',
                  'address': {
                    '@type': 'PostalAddress',
                    'addressLocality': 'Sylhet',
                    'addressCountry': 'Bangladesh'
                  },
                  'parentOrganization': {
                    '@type': 'CollegeOrUniversity',
                    'name': 'Metropolitan University'
                  }
                },
                {
                  '@type': 'WebSite',
                  '@id': 'https://muis.bd/#website',
                  'url': 'https://muis.bd',
                  'name': 'Metropolitan University Islamic Society',
                  'alternateName': 'MUIS Platform',
                  'publisher': {
                    '@id': 'https://muis.bd/#organization'
                  },
                  'inLanguage': 'en-US'
                }
              ]
            })
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600;700&family=Noto+Naskh+Arabic:wght@400;700&family=Noto+Sans+Bengali:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Great+Vibes&display=swap" rel="stylesheet" />
        <link href="https://fonts.maateen.me/solaiman-lipi/font.css" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>
        <Providers>
          <HashRedirect />
          <Preloader />
          <Header />
          <main style={{ minHeight: '70vh' }}>
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
