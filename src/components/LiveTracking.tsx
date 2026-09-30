import React from 'react';
import LiveTrackingV2 from './LiveTrackingV2';
import { AppScreen } from '../types';

interface LiveTrackingProps {
  onTransition: (target: AppScreen) => void;
  bookingTime?: string;
}

export default function LiveTracking(props: LiveTrackingProps) {
  return <LiveTrackingV2 onTransition={props.onTransition} bookingTime={props.bookingTime} />;
}
