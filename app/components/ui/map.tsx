'use client';

import dynamic from 'next/dynamic';

interface MapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  height?: string;
  width?: string;
  className?: string;
  markerTitle?: string;
  address?: string;
  showPopup?: boolean;
}

// Dynamically import Leaflet only on client side
const MapClient = dynamic(() => import('./map-client'), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse bg-muted rounded-lg h-full w-full flex items-center justify-center">
      <span className="text-muted-foreground">Loading map...</span>
    </div>
  ),
}) as React.ComponentType<MapProps>;

const Map = (props: MapProps) => {
  return <MapClient {...props} />;
};

export default Map;
