'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MockResponse } from '../lib/mock-data';

// Internal component to handle view changes
function MapController({ data }: { data: MockResponse }) {
  const map = useMap();

  useEffect(() => {
    if (data.ranking && data.ranking.length > 0) {
      const bounds = L.latLngBounds(data.ranking.map(f => [f.lat, f.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    } else if (data.regions && data.regions.length > 0) {
      // Logic for regions could be added here if they have coords
    }
  }, [data, map]);

  return null;
}

// Function to generate Custom Pin Icon with dynamic scaling
const getPinIcon = (isHovered: boolean) => {
  const scale = isHovered ? 1.4 : 1.0;
  const width = 30 * scale;
  const height = 42 * scale;

  return L.divIcon({
    className: 'custom-pin',
    html: `
      <svg width="${width}" height="${height}" viewBox="0 0 30 42" fill="none" xmlns="http://www.w3.org/2000/svg" style="transition: all 0.2s ease-out;">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M15 42c0 0 15-15.75 15-27C30 6.716 23.284 0 15 0S0 6.716 0 15c0 11.25 15 27 15 27zm0-18c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9z" fill="#2563eb" stroke="white" stroke-width="1"/>
        <path d="M15 21c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 6z" fill="transparent"/>
      </svg>
    `,
    iconSize: [width, height],
    iconAnchor: [width / 2, height],
    popupAnchor: [0, -height]
  });
};

interface MapViewProps {
  data: MockResponse;
  isDarkMode?: boolean;
  hoveredId: string | number | null;
  onHover: (id: string | number | null) => void;
}

export default function MapView({ data, isDarkMode = false, hoveredId, onHover }: MapViewProps) {
  const center: [number, number] = [22.5937, 78.9629]; // Center of India
  const zoom = 5;
  const bounds: L.LatLngBoundsExpression = [
    [-90, -180],
    [90, 180]
  ];

  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      minZoom={3}
      maxBounds={bounds}
      maxBoundsViscosity={1.0}
      zoomControl={false}
      attributionControl={false}
      className="h-full w-full z-0"
      style={{ background: '#f8fafc' }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        noWrap={true}
      />
      
      <MapController data={data} />
      
      {/* Analysis Markers (Facilities) */}
      {data.query_type !== 'regional_gap' && data.ranking.map((facility, idx) => {
        const isHovered = hoveredId === facility.rank;
        return (
          <Marker 
            key={idx} 
            position={[facility.lat, facility.lng]} 
            icon={getPinIcon(isHovered)}
            zIndexOffset={isHovered ? 1000 : 0}
            eventHandlers={{
              mouseover: () => onHover(facility.rank),
              mouseout: () => onHover(null)
            }}
          >
            <Popup>
              <div className="text-slate-900 text-xs p-1">
                <h3 className="font-bold border-b border-slate-100 pb-1 mb-1">{facility.facility_name}</h3>
                <p className="text-slate-500">{facility.district}</p>
                <div className="mt-1 font-bold text-blue-600">Match: {(facility.match_score * 100).toFixed(0)}%</div>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* Analysis Regions (Risk) */}
      {data.query_type === 'regional_gap' && data.regions.map((region, idx) => {
        const coords: Record<string, [number, number]> = {
          'IN-BR-001': [25.0961, 85.3131],
          'IN-UP-002': [26.8467, 80.9462],
        };
        const pos = coords[region.region_id] || center;
        const isHovered = hoveredId === region.region_id;
        
        return (
          <CircleMarker 
            key={idx} 
            center={pos} 
            radius={isHovered ? 30 : 25}
            pathOptions={{ 
              fillColor: region.risk_score > 0.8 ? '#ef4444' : '#f59e0b',
              fillOpacity: isHovered ? 0.8 : 0.5,
              color: 'transparent'
            }}
            eventHandlers={{
              mouseover: () => onHover(region.region_id),
              mouseout: () => onHover(null)
            }}
          >
            <Popup>
              <div className="text-slate-900 text-xs">
                <h3 className="font-bold">{region.name}</h3>
                <p>Primary Gap: {region.primary_gap}</p>
                <p className="font-bold text-red-600">Risk: {(region.risk_score * 100).toFixed(0)}%</p>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
