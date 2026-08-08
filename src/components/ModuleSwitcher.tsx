import React from 'react';
import { AppScreen } from '../types';

interface ModuleSwitcherProps {
  currentScreen?: AppScreen;
  onTransition?: (target: AppScreen) => void;
  showNotification?: (message: string) => void;
}

export default function ModuleSwitcher(_props: ModuleSwitcherProps) {
  return null;
}

