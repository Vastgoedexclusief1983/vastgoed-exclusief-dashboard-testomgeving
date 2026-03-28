'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LegalAcceptanceModal } from '@/components/legal/LegalAcceptanceModal';

type Props = {
  needsAcceptance: boolean;
};

export function LegalClickGate({ needsAcceptance }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (needsAcceptance && !completed) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [needsAcceptance, completed]);

  function handleAccepted() {
    setCompleted(true);
    setOpen(false);
    router.refresh();
  }

  if (!needsAcceptance && !open) return null;

  return <LegalAcceptanceModal open={open} onAccepted={handleAccepted} />;
}
