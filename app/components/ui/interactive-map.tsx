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

interface InteractiveMapProps {
  latitude?: number;
  longitude?: number;
  zoom?: number;
  height?: string;
  width?: string;
  className?: string;
  markerTitle?: string;
  address?: string;
  showPopup?: boolean;
  onLocationSelect?: (lat: number, lng: number) => void;
  isClickable?: boolean;
}

const InteractiveMap = ({
  latitude = 30.0444, // Default to Cairo
  longitude = 31.2357,
  zoom = 13,
  height = '300px',
  width = '100%',
  className = '',
  markerTitle = 'Click to set location',
  address,
  showPopup = true,
  onLocationSelect,
  isClickable = false,
}: InteractiveMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize the map
    const map = L.map(mapRef.current, {
      maxBoundsViscosity: 1.0,
    }).setView([latitude, longitude], zoom);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Create marker if coordinates are provided
    if (latitude && longitude) {
      const marker = L.marker([latitude, longitude]).addTo(map);
      markerRef.current = marker;

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

        marker.bindPopup(popupContent);
        if (latitude && longitude) {
          marker.openPopup();
        }
      }
    }

    // Add click handler if map is clickable
    if (isClickable && onLocationSelect) {
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;

        // Remove existing marker
        if (markerRef.current) {
          map.removeLayer(markerRef.current);
        }

        // Add new marker at clicked location
        const newMarker = L.marker([lat, lng]).addTo(map);
        markerRef.current = newMarker;

        // Add popup
        if (showPopup) {
          const popupContent = `<div class="text-center">
            <strong class="block text-sm font-semibold">Selected Location</strong>
            <span class="text-xs text-gray-600">Lat: ${lat.toFixed(
              6
            )}, Lng: ${lng.toFixed(6)}</span>
          </div>`;
          newMarker.bindPopup(popupContent).openPopup();
        }

        // Call the callback
        onLocationSelect(lat, lng);
      });
    }

    mapInstanceRef.current = map;

    // Ensure proper map bounds calculation
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 100);

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [
    latitude,
    longitude,
    zoom,
    markerTitle,
    address,
    showPopup,
    onLocationSelect,
    isClickable,
  ]);

  // Update map center and marker when coordinates change
  useEffect(() => {
    if (mapInstanceRef.current && latitude && longitude) {
      mapInstanceRef.current.setView([latitude, longitude], zoom);

      // Ensure proper map bounds calculation after updates
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 100);

      // Update marker position
      if (markerRef.current) {
        markerRef.current.setLatLng([latitude, longitude]);

        if (showPopup) {
          const popupContent = address
            ? `<div class="text-center">
                <strong class="block text-sm font-semibold">${markerTitle}</strong>
                <span class="text-xs text-gray-600">${address}</span>
              </div>`
            : `<div class="text-center">
                <strong class="text-sm font-semibold">${markerTitle}</strong>
              </div>`;

          markerRef.current.bindPopup(popupContent);
        }
      } else if (mapInstanceRef.current) {
        // Create new marker if it doesn't exist
        const marker = L.marker([latitude, longitude]).addTo(
          mapInstanceRef.current
        );
        markerRef.current = marker;

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
      }
    }
  }, [latitude, longitude, zoom, markerTitle, address, showPopup]);

  return (
    <div className="relative">
      <div
        ref={mapRef}
        className={`rounded-lg border border-border overflow-hidden relative ${className}`}
        style={{
          height,
          width,
          zIndex: 1,
          contain: 'layout style',
          position: 'relative',
        }}
      />
      {isClickable && (
        <div className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-muted-foreground border border-border z-10">
          Click on map to set location
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;
