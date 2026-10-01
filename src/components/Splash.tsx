import React, { useEffect } from 'react';
import { AppScreen } from '../types';

interface SplashProps {
  onTransition: (target: AppScreen) => void;
}

/**
 * The old marketing/landing screen was being rendered as the app splash screen.
 * PUNCHX now starts at the authentication gateway instead. Keeping this component
 * as a tiny redirect preserves existing App routing without leaving a flash of the
 * old landing page for users who arrive through the legacy splash route.
 */
export default function Splash({ onTransition }: SplashProps) {
  useEffect(() => {
    onTransition('auth');
  }, [onTransition]);

  return null;
}
