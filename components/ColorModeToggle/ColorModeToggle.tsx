'use client';

import { IconButton } from '@chakra-ui/react';
import { useTheme } from 'next-themes';
import { ReactNode, useEffect, useState } from 'react';
import { IoContrastOutline, IoMoon, IoSunny } from 'react-icons/io5';

type Mode = 'system' | 'light' | 'dark';

const nextMode: Record<Mode, Mode> = {
  system: 'light',
  light: 'dark',
  dark: 'system',
};

const modeIcon: Record<Mode, ReactNode> = {
  system: <IoContrastOutline />,
  light: <IoSunny />,
  dark: <IoMoon />,
};

const modeLabel: Record<Mode, string> = {
  system: 'Using system colour mode -- tap for light mode',
  light: 'Using light mode -- tap for dark mode',
  dark: 'Using dark mode -- tap for system mode',
};

interface ColorModeToggleProps {
  className?: string;
}

export const ColorModeToggle = ({ className }: ColorModeToggleProps) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // next-themes resolves the real theme synchronously on the client (via a
    // blocking script) before hydration finishes, so the first client render
    // can already differ from the server-rendered "system" fallback below.
    // Stay on that fallback until mounted so hydration always matches, then
    // switch to the live value.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const current: Mode = mounted ? ((theme as Mode) ?? 'system') : 'system';

  return (
    <IconButton
      className={className}
      onClick={() => setTheme(nextMode[current])}
      aria-label={modeLabel[current]}
      size="lg"
      rounded="full"
    >
      {modeIcon[current]}
    </IconButton>
  );
};
