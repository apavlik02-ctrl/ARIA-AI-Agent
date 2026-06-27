'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function ARIALandingPage() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (user) {
      window.location.href = '/dashboard';
    } else {
      window.location.href = '/landing-standalone.html';
    }
  }, [user, loading]);

  return (
    <div className="min-h-screen bg-[#0F0A07] flex items-center justify-center">
      <div className="text-[#EDE0D4]/40 text-sm">Loading…</div>
    </div>
  );
}
