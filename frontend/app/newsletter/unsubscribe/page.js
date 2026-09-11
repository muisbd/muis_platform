'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PageHeader from '../../../src/components/PageHeader.js';
import { api } from '../../../src/lib/api.js';
import { Suspense } from 'react';

function UnsubscribeInner() {
  const params = useSearchParams();
  const email = params.get('email') || '';
  const [message, setMessage] = useState('Processing…');

  useEffect(() => {
    if (!email) {
      setMessage('No email provided.');
      return;
    }
    api(`/newsletter/unsubscribe?email=${encodeURIComponent(email)}`)
      .then(() => setMessage(`Unsubscribed ${email} from the MUIS newsletter.`))
      .catch((err) => setMessage(err.message));
  }, [email]);

  return (
    <div className="page-container page-fade-enter">
      <PageHeader title="Newsletter" description={message} />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="page-container"><p style={{ padding: 40 }}>Loading…</p></div>}>
      <UnsubscribeInner />
    </Suspense>
  );
}
