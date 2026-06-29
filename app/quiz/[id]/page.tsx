'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function QuizByIdPage() {
  const params = useParams();

  useEffect(() => {
    const id = params?.id;
    if (id) {
      window.location.replace(`/quiz?id=${id}`);
    } else {
      window.location.replace('/quiz');
    }
  }, [params]);

  return (
    <div className="min-h-screen bg-[#0F0A07] flex items-center justify-center">
      <div className="text-[#EDE0D4]/60 text-sm">Redirecting…</div>
    </div>
  );
}
