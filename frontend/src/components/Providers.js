'use client';

import { useEffect } from 'react';
import { AuthProvider } from '../context/AuthContext.js';
import { registerServiceWorker } from '../lib/pwa.js';

export default function Providers({ children }) {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return <AuthProvider>{children}</AuthProvider>;
}
