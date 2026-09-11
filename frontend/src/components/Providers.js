'use client';

import { AuthProvider } from '../context/AuthContext.js';

export default function Providers({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
