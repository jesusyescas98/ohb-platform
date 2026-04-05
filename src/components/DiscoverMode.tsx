'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Property } from '../lib/types';
import { formatPrice, getPropertyTypeIcon, getWhatsAppLink } from '../lib/propertyData';
import styles from './DiscoverMode.module.css';

interface DiscoverModeProps {
  properties: Property[];
  onLike: (property: Property) => void;
}

export default function DiscoverMode({ properties, onLike }: DiscoverModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentProperty = properties[currentIndex];

  const goToNext = () => {
    if (currentIndex < properties.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setTouchEnd(e.changedTouches[0].clientY);

    const distance = touchStart - touchEnd;
    if (Math.abs(distance) > 50) {
      if (distance > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }
  };

  if (properties.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div style={{ fontSize: '6rem', marginBottom: '2rem' }}>🏠</div>
        <h2>No hay propiedades disponibles</h2>
        <p>Vuelve más tarde para descubrir nuevas oportunidades</p>
      </div>
    );
  }

  return (
    <div
      className={styles.container}
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Property Cards Stack */}
      {properties.map((property, idx) => {
        const offset = idx - currentIndex;
        const isVisible = Math.abs(offset) <= 1;

        return (
          <div
            key={property.id}
            className={`${styles.card} ${offset === 0 ? styles.active : ''}`}
            style={{
              transform: `translateY(calc(${offset * 100}% + ${offset * 20}px))`,
              opacity: isVisible ? 1 : 0,
              pointerEvents: offset === 0 ? 'auto' : 'none',
            }}
          >
            {/* Background Image */}
            <Image
              src={property.images[0] || '/hero-bg.png'}
              alt={property.title}
              fill
              className={styles.backgroundImage}
            />

            {/* Overlay Gradient */}
            <div className={styles.gradient} />

            {/* Content */}
            <div className={styles.content}>
              {/* Badges */}
              <div className={styles.badgesRow}>
                <span className={styles.badge}>
                  {getPropertyTypeIcon(property.type)} {property.type}
                </span>
                {property.featured && (
                  <span className={styles.badge} style={{ background: 'rgba(212, 168, 67, 0.85)' }}>
                    ⭐ Destacada
                  </span>
                )}
              </div>

              {/* Main Info */}
              <div className={styles.mainInfo}>
                <div className={styles.price}>{formatPrice(property.price)}</div>
                <h1 className={styles.title}>{property.title}</h1>
                <p className={styles.location}>📍 {property.location}</p>

                {/* Specs */}
                <div className={styles.specs}>
                  {property.bedrooms > 0 && (
                    <div className={styles.specItem}>
                      <span className={styles.specIcon}>🛏️</span>
                      <span>{property.bedrooms}</span>
                    </div>
                  )}
                  {property.bathrooms > 0 && (
                    <div className={styles.specItem}>
                      <span className={styles.specIcon}>🚿</span>
                      <span>{property.bathrooms}</span>
                    </div>
                  )}
                  <div className={styles.specItem}>
                    <span className={styles.specIcon}>📐</span>
                    <span>{property.sqMeters} m²</span>
                  </div>
                </div>

                {/* Description */}
                {property.description && (
                  <p className={styles.description}>{property.description}</p>
                )}

                {/* Action Buttons */}
                <div className={styles.actions}>
                  <button
                    className={styles.btnPrimary}
                    onClick={() => onLike(property)}
                  >
                    ❤️ Me interesa
                  </button>
                  <a
                    href={getWhatsAppLink(property.title)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.btnSecondary}
                  >
                    💬 WhatsApp
                  </a>
                </div>
              </div>

              {/* Navigation Hints */}
              <div className={styles.navigationHints}>
                {currentIndex > 0 && (
                  <button onClick={goToPrevious} className={styles.hint} title="Anterior">
                    ▲ Anterior
                  </button>
                )}
                {currentIndex < properties.length - 1 && (
                  <button onClick={goToNext} className={styles.hint} title="Siguiente">
                    Siguiente ▼
                  </button>
                )}
              </div>

              {/* Counter */}
              <div className={styles.counter}>
                {currentIndex + 1} / {properties.length}
              </div>
            </div>
          </div>
        );
      })}

      {/* Swipe Indicator */}
      <div className={styles.swipeIndicator}>
        👆 Desliza para descubrir más 👇
      </div>
    </div>
  );
}
