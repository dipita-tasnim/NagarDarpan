import { useState, useCallback } from 'react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';

const DEFAULT_CENTER = { lat: 23.8103, lng: 90.4125 }; // Dhaka

export default function LocationPicker({ value, onChange }) {
  const [markerPos, setMarkerPos] = useState(
    value?.lat ? { lat: value.lat, lng: value.lng } : null
  );

  const handleMapClick = useCallback((e) => {
    const lat = e.detail.latLng.lat;
    const lng = e.detail.latLng.lng;
    setMarkerPos({ lat, lng });
    onChange({ lat, lng });
  }, [onChange]);

  if (!GOOGLE_MAPS_KEY) {
    return (
      <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center text-sm text-gray-500">
        <p className="mb-2">Google Maps API key not configured.</p>
        <p>Add <code className="bg-gray-100 px-1 rounded">VITE_GOOGLE_MAPS_KEY</code> to your <code className="bg-gray-100 px-1 rounded">.env</code> file.</p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={GOOGLE_MAPS_KEY}>
      <div className="rounded-lg overflow-hidden border border-gray-300" style={{ height: 300 }}>
        <Map
          defaultCenter={markerPos || DEFAULT_CENTER}
          defaultZoom={markerPos ? 15 : 12}
          gestureHandling="greedy"
          mapId="location-picker"
          onClick={handleMapClick}
          style={{ width: '100%', height: '100%' }}
        >
          {markerPos && (
            <AdvancedMarker position={markerPos} />
          )}
        </Map>
      </div>
      {markerPos && (
        <p className="text-xs text-gray-500 mt-1">
          📍 {markerPos.lat.toFixed(6)}, {markerPos.lng.toFixed(6)}
        </p>
      )}
    </APIProvider>
  );
}
