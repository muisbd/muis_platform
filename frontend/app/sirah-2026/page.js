import SirahConferencePage from '../../src/components/SirahConferencePage.js';
import { SIRAH_BANNER_URL } from '../../src/components/SirahBannerImage.js';

export const metadata = {
  title: 'Sirah Conference 2026 | MUIS',
  description: 'Register for MUIS Sirah Conference 2026. Registration fee 150 BDT. Pay, then submit your name, student ID, and TrxID.',
  openGraph: {
    images: [{ url: SIRAH_BANNER_URL, width: 1600, height: 666 }]
  }
};

export default function Page() {
  return <SirahConferencePage />;
}
