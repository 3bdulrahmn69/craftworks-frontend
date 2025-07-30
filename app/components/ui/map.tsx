'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

const Map = ({
  latitude,
  longitude,
  zoom = 15,
  height = '300px',
  width = '100%',
  className = '',
  markerTitle = 'Location',
  address,
  showPopup = true,
}: MapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize the map with custom options
    const map = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      boxZoom: true,
      keyboard: true,
      dragging: true,
      touchZoom: true,
      // Constrain the map within its container
      maxBoundsViscosity: 1.0,
    }).setView([latitude, longitude], zoom);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Create marker
    const marker = L.marker([latitude, longitude]).addTo(map);

    // Add popup if enabled
    if (showPopup) {
      const popupContent = address
        ? `<div class="text-center">
            <strong class="block text-sm font-semibold">${markerTitle}</strong>
            <span class="text-xs text-gray-600">${address}</span>
          </div>`
        : `<div class="text-center">
            <strong class="text-sm font-semibold">${markerTitle}</strong>
          </div>`;

      marker.bindPopup(popupContent).openPopup();
    }

    // Force map to fit within container bounds
    map.invalidateSize();

    mapInstanceRef.current = map;

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, zoom, markerTitle, address, showPopup]);

  // Update map center when coordinates change
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([latitude, longitude], zoom);

      // Update marker position
      mapInstanceRef.current.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          layer.setLatLng([latitude, longitude]);

          if (showPopup) {
            const popupContent = address
              ? `<div class="text-center">
                  <strong class="block text-sm font-semibold">${markerTitle}</strong>
                  <span class="text-xs text-gray-600">${address}</span>
                </div>`
              : `<div class="text-center">
                  <strong class="text-sm font-semibold">${markerTitle}</strong>
                </div>`;

            layer.bindPopup(popupContent);
          }
        }
      });

      // Force map to recalculate size and bounds
      mapInstanceRef.current.invalidateSize();
    }
  }, [latitude, longitude, zoom, markerTitle, address, showPopup]);

  return (
    <div
      ref={mapRef}
      className={`rounded-lg border border-border overflow-hidden relative isolate ${className}`}
      style={{
        height,
        width,
        zIndex: 1,
        contain: 'layout style size',
        position: 'relative',
        isolation: 'isolate',
      }}
    />
  );
};

export default Map;
