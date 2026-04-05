'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Property } from '../lib/types';
import { formatPrice, getPropertyTypeIcon } from '../lib/propertyData';
import styles from './PropertySwipeCard.module.css';

interface PropertySwipeCardProps {
  properties: Property[];
  onLike: (property: Property) => void;
  onPass: () => void;
}

export default function PropertySwipeCard({ properties, onLike, onPass }: PropertySwipeCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentProperty = properties[currentIndex];

  const handleSwipe = (direction: 'left' | 'right') => {
    if (isAnimating || !currentProperty) return;

    setIsAnimating(true);
    setSwipeDirection(direction);

    setTimeout(() => {
      if (direction === 'right') {
        onLike(currentProperty);
      } else {
        onPass();
      }

      if (currentIndex < properties.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex(0); // Reiniciar cuando llega al final
      }

      setSwipeDirection(null);
      setIsAnimating(false);
    }, 300);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setTouchEnd(e.changedTouches[0].clientX);

    const distance = touchStart - touchEnd;
    if (Math.abs(distance) > 50) {
      if (distance > 0) {
        handleSwipe('left');
      } else {
        handleSwipe('right');
      }
    }
  };

  if (properties.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏠</div>
        <h2>No hay propiedades disponibles</h2>
        <p>Vuelve más tarde para ver nuevas oportunidades de inversión</p>
      </div>
    );
  }

  return (
    <div className={styles.swipeContainer} ref={containerRef}>
      <div className={styles.cardStack}>
        {/* Background cards para preview */}
        {properties.slice(currentIndex + 1, currentIndex + 3).map((prop, idx) => (
          <div key={prop.id} className={styles.backgroundCard} style={{ zIndex: 10 - idx }}>
            <Image
              src={prop.images[0] || '/hero-bg.png'}
              alt={prop.title}
              fill
              className={styles.cardImage}
            />
          </div>
        ))}

        {/* Main card */}
        <div
          className={`${styles.card} ${swipeDirection ? styles[`swipe${swipeDirection.charAt(0).toUpperCase() + swipeDirection.slice(1)}`] : ''}`}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          ref={containerRef}
        >
          <div className={styles.imageContainer}>
            <Image
              src={currentProperty.images[0] || '/hero-bg.png'}
              alt={currentProperty.title}
              fill
              className={styles.cardImage}
            />
            <span className={styles.badge}>
              {getPropertyTypeIcon(currentProperty.type)} {currentProperty.type}
            </span>
            {currentProperty.featured && (
              <span className={styles.featuredBadge}>⭐ Destacada</span>
            )}
          </div>

          <div className={styles.content}>
            <div className={styles.price}>{formatPrice(currentProperty.price)}</div>
            <h2 className={styles.title}>{currentProperty.title}</h2>
            <p className={styles.location}>📍 {currentProperty.location}</p>

            <div className={styles.specs}>
              {currentProperty.bedrooms > 0 && (
                <div className={styles.spec}>
                  <span>🛏️</span>
                  <span>{currentProperty.bedrooms} Rec.</span>
                </div>
              )}
              {currentProperty.bathrooms > 0 && (
                <div className={styles.spec}>
                  <span>🚿</span>
                  <span>{currentProperty.bathrooms} Baños</span>
                </div>
              )}
              <div className={styles.spec}>
                <span>📐</span>
                <span>{currentProperty.sqMeters} m²</span>
              </div>
            </div>

            <p className={styles.description}>{currentProperty.description}</p>

            <div className={styles.actions}>
              <button onClick={() => handleSwipe('left')} className={styles.btnPass} title="Pasar">
                ✕ Pasar
              </button>
              <button onClick={() => handleSwipe('right')} className={styles.btnLike} title="Me interesa">
                ❤️ Me interesa
              </button>
            </div>
          </div>

          <div className={styles.counter}>
            {currentIndex + 1} / {properties.length}
          </div>
        </div>
      </div>

      {/* Mobile hint */}
      <div className={styles.hint}>
        👈 Desliza izquierda/derecha o toca los botones 👉
      </div>
    </div>
  );
}
