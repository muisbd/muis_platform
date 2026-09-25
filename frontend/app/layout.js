import './globals.css';
import Header from '../src/components/Header.js';
import Footer from '../src/components/Footer.js';
import Preloader from '../src/components/Preloader.js';
import HashRedirect from '../src/components/HashRedirect.js';
import Providers from '../src/components/Providers.js';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://muis.bd'),
  title: 'Metropolitan University Islamic Society (MUIS) | Community, Faith & Excellence',
  description: 'Welcome to Metropolitan University Islamic Society (MUIS). Providing prayer facilities, educational halaqas, community events, charity drives, and a warm sanctuary for students.',
  openGraph: {
    title: 'Metropolitan University Islamic Society (MUIS)',
    description: 'A warm, welcoming student community empowering spiritual growth, brotherhood, sisterhood, and service on campus.',
    images: ['/MUIIS_DP-01.png'],
    type: 'website'
  },
  icons: {
    icon: [{ url: '/muis_logo_white.png', type: 'image/png' }]
  },
  verification: {
    google: 'zLQ4oXk4h6qWsEAbf9ntTmXKLykAKzg5zt8rUiTwHpc'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="zLQ4oXk4h6qWsEAbf9ntTmXKLykAKzg5zt8rUiTwHpc" />
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
