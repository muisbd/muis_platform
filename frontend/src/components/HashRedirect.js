'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HashRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (window.location.hash && window.location.hash.startsWith('#/')) {
      const cleanPath = window.location.hash.substring(1);
      router.replace(cleanPath);
    }
  }, [router]);

  return null;
}
