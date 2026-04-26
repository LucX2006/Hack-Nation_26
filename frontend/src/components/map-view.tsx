'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MockResponse } from '../lib/mock-data';

// Helper to get thematic red color scale for Regional Gaps
const getRedColor = (score: number) => {
  if (score > 0.9) return '#7f0000'; // Deep Red
  if (score > 0.8) return '#b30000'; // Dark Red
  if (score > 0.6) return '#e34a33'; // Medium Red
  if (score > 0.4) return '#fc8d59'; // Orange-Red
  if (score > 0.2) return '#fdbb84'; // Light Orange
  return '#fef0d9'; // Pale Yellow/Red
};

// Internal component to handle view changes
function MapController({ data }: { data: MockResponse }) {
  const map = useMap();

  useEffect(() => {
    if (data.ranking && data.ranking.length > 0) {
      const bounds = L.latLngBounds(data.ranking.map(f => [f.lat, f.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    } else if (data.query_type === 'regional_gap') {
      map.setView([22.5937, 78.9629], 5);
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

  const [geoJsonData, setGeoJsonData] = useState<any>(null);

  useEffect(() => {
    if (!geoJsonData) {
      fetch('/india-states.geojson')
        .then(res => res.json())
        .then(data => setGeoJsonData(data))
        .catch(err => console.error("Failed to load India GeoJSON", err));
    }
  }, [geoJsonData]);

  const getFeatureStyle = (feature: any) => {
    const stateName = feature.properties.NAME_1;
    const regionData = data.regions?.find(r => 
      r.name === stateName || 
      (stateName === "Jammu and Kashmir" && r.name === "Ladakh")
    );
    
    if (regionData) {
      const isHovered = hoveredId === regionData.region_id;
      return {
        fillColor: getRedColor(regionData.risk_score),
        weight: isHovered ? 2 : 0,
        opacity: isHovered ? 1 : 0,
        color: '#1e40af',
        fillOpacity: isHovered ? 0.9 : 0.75
      };
    }
    
    return {
      fillColor: '#cbd5e1',
      weight: 0,
      opacity: 0,
      fillOpacity: 0.55
    };
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
    const stateName = feature.properties.NAME_1;
    const regionData = data.regions?.find(r => 
      r.name === stateName || 
      (stateName === "Jammu and Kashmir" && r.name === "Ladakh")
    );

    if (regionData) {
      layer.on({
        mouseover: () => onHover(regionData.region_id),
        mouseout: () => onHover(null),
      });

      layer.bindPopup(`
        <div class="text-slate-900 text-xs">
          <h3 class="font-bold text-sm border-b pb-1 mb-1">${regionData.name}</h3>
          <p><span class="text-slate-500">Primary Gap:</span> ${regionData.primary_gap}</p>
          <div class="mt-2 flex items-center justify-between">
            <span class="font-bold text-red-600">Risk: ${(regionData.risk_score * 100).toFixed(0)}%</span>
            <span class="text-[9px] px-1 bg-slate-100 rounded text-slate-400">Confidence: ${(regionData.confidence * 100).toFixed(0)}%</span>
          </div>
        </div>
      `);
    }
  };

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
      
      {geoJsonData && (
        <GeoJSON 
          key={data.query_type + (hoveredId || 'base')} 
          data={geoJsonData} 
          style={getFeatureStyle}
          onEachFeature={onEachFeature}
        />
      )}

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
                <h3 className="font-bold border-b border-slate-100 pb-1 mb-1">${facility.facility_name}</h3>
                <p className="text-slate-500">${facility.district}</p>
                <div className="mt-1 font-bold text-blue-600">Match: ${(facility.match_score * 100).toFixed(0)}%</div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
