import AccountPage from '../../src/components/AccountPage.js';

export const metadata = {
  title: 'My profile',
  robots: { index: false, follow: false }
};

export default function Page() {
  return <AccountPage />;
}
