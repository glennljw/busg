'use client';

import { Button } from '@chakra-ui/react';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      style={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-montserrat), sans-serif',
      }}
    >
      <p>Something went wrong while loading Busg.</p>
      <Button colorPalette="brand" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  );
}
