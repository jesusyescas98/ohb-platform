'use client';

import { useEffect, useRef, useState } from 'react';
import type { Property } from '@/lib/types';
import { getPropertyTypeIcon, formatPrice } from '@/lib/propertyData';
import styles from './PropertyMap.module.css';

interface PropertyMapProps {
  properties: Property[];
  onPropertyClick?: (property: Property) => void;
}

declare global {
  interface Window {
    L: any;
  }
}

export default function PropertyMap({ properties, onPropertyClick }: PropertyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load Leaflet CSS and JS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
    script.onload = () => {
      setIsLoaded(true);
    };
    document.body.appendChild(script);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapContainer.current || properties.length === 0) return;

    // Initialize map centered on Juárez
    const L = window.L;
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainer.current, {
        center: [31.7383, -106.4843],
        zoom: 12,
        zoomControl: true,
        attributionControl: false,
      });

      // Add tile layer with dark theme
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        opacity: 0.9,
      }).addTo(mapRef.current);
    }

    // Clear old markers
    markersRef.current.forEach((marker) => {
      mapRef.current.removeLayer(marker);
    });
    markersRef.current = [];

    // Add markers for each property
    const typeColors: Record<string, string> = {
      casa: '#FF4444', // Red for sale
      departamento: '#FF4444',
      terreno: '#FF4444',
      comercial: '#44FF44', // Green for commercial/investment
      inversion: '#4444FF', // Blue for rental
    };

    properties.forEach((property) => {
      if (!property.lat || !property.lng) return;

      const color = typeColors[property.type] || '#D4A843';

      // Create custom SVG icon
      const svgIcon = L.divIcon({
        html: `
          <div style="
            width: 32px;
            height: 40px;
            background: ${color};
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          ">
            <div style="transform: rotate(45deg); font-size: 18px; line-height: 1;">
              ${getPropertyTypeIcon(property.type as any)}
            </div>
          </div>
        `,
        iconSize: [32, 40],
        iconAnchor: [16, 40],
        popupAnchor: [0, -40],
        className: 'custom-marker',
      });

      const marker = L.marker([property.lat, property.lng], {
        icon: svgIcon,
        title: property.title,
      });

      // Create popup content
      const popupContent = `
        <div style="min-width: 200px;">
          <h4 style="margin: 0 0 0.5rem 0; color: #D4A843; font-weight: 700;">
            ${property.title}
          </h4>
          <p style="margin: 0.25rem 0; font-size: 0.9rem; color: rgba(255,255,255,0.9);">
            <strong>${formatPrice(property.price)}</strong>
          </p>
          <p style="margin: 0.25rem 0; font-size: 0.85rem; color: rgba(255,255,255,0.7);">
            ${property.bedrooms > 0 ? property.bedrooms + ' rec. • ' : ''}${property.sqMeters} m²
          </p>
          <p style="margin: 0.5rem 0 0; font-size: 0.85rem; color: #D4A843;">
            ${property.colonia}
          </p>
          <button style="
            margin-top: 0.75rem;
            padding: 0.4rem 0.8rem;
            background: #D4A843;
            color: #0B0F19;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            font-size: 0.85rem;
            width: 100%;
            transition: all 0.2s;
          " onclick="window._propertyMapClick && window._propertyMapClick('${property.id}')">
            Ver Detalles
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.addTo(mapRef.current);
      markersRef.current.push(marker);
    });

    // Store callback for popup button clicks
    (window as any)._propertyMapClick = (propertyId: string) => {
      const property = properties.find((p) => p.id === propertyId);
      if (property && onPropertyClick) {
        onPropertyClick(property);
      }
    };

    // Fit bounds to show all markers
    if (markersRef.current.length > 0) {
      const group = new L.featureGroup(markersRef.current);
      mapRef.current.fitBounds(group.getBounds(), { padding: [50, 50] });
    }
  }, [isLoaded, properties, onPropertyClick]);

  return (
    <div className={styles.mapContainer}>
      {!isLoaded && <div className={styles.mapLoading}>Cargando mapa...</div>}
      <div
        ref={mapContainer}
        className={styles.mapWrapper}
        style={{ visibility: isLoaded ? 'visible' : 'hidden' }}
      />
      {isLoaded && (
        <>
          <div className={styles.mapLegend}>
            <div className={styles.legendTitle}>Tipos de Propiedad</div>
            <div className={styles.legendItem}>
              <div
                className={styles.legendColor}
                style={{ backgroundColor: '#FF4444' }}
              />
              <span>Casa / Departamento / Terreno</span>
            </div>
            <div className={styles.legendItem}>
              <div
                className={styles.legendColor}
                style={{ backgroundColor: '#44FF44' }}
              />
              <span>Comercial</span>
            </div>
            <div className={styles.legendItem}>
              <div
                className={styles.legendColor}
                style={{ backgroundColor: '#4444FF' }}
              />
              <span>Inversión</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
