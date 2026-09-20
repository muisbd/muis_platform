import SirahConferencePage from '../../src/components/SirahConferencePage.js';
import { SIRAH_BANNER_URL } from '../../src/components/SirahBannerImage.js';

export const metadata = {
  title: 'Sirah Conference 2026 | MUIS',
  description: 'Register for MUIS Sirah Conference 2026 with your name, student ID, and payment TrxID.',
  openGraph: {
    images: [{ url: SIRAH_BANNER_URL, width: 1600, height: 666 }]
  }
};

export default function Page() {
  return <SirahConferencePage />;
}
