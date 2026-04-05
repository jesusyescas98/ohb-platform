'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PropertySwipeCard from '../../components/PropertySwipeCard';
import DiscoverMode from '../../components/DiscoverMode';
import { getAllPublicProperties } from '../../lib/propertyAdapter';
import { Property } from '../../lib/types';
import styles from './discover.module.css';

type ViewMode = 'matcher' | 'discover';

export default function DiscoverPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('discover');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load properties and favorites from localStorage
  useEffect(() => {
    const props = getAllPublicProperties();
    setProperties(props);

    const saved = localStorage.getItem('ohb_favorites');
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
    setIsLoaded(true);
  }, []);

  const handleLike = (property: Property) => {
    if (!favorites.includes(property.id)) {
      const updated = [...favorites, property.id];
      setFavorites(updated);
      localStorage.setItem('ohb_favorites', JSON.stringify(updated));
    }
  };

  const toggleFavorite = (propertyId: string) => {
    const updated = favorites.includes(propertyId)
      ? favorites.filter(id => id !== propertyId)
      : [...favorites, propertyId];
    setFavorites(updated);
    localStorage.setItem('ohb_favorites', JSON.stringify(updated));
  };

  const displayedProperties = showFavoritesOnly
    ? properties.filter(p => favorites.includes(p.id))
    : properties;

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.back}>
            <Link href="/propiedades" className={styles.backLink}>
              ← Volver al catálogo
            </Link>
          </div>

          <div className={styles.title}>
            <h1>🎯 Descubre tu Propiedad Ideal</h1>
            <p>Desliza, explora, marca tus favoritas</p>
          </div>

          <div className={styles.controls}>
            {/* View Mode Toggle */}
            <div className={styles.toggleGroup}>
              <button
                className={`${styles.toggleBtn} ${viewMode === 'discover' ? styles.active : ''}`}
                onClick={() => setViewMode('discover')}
              >
                🎬 Discover Mode
              </button>
              <button
                className={`${styles.toggleBtn} ${viewMode === 'matcher' ? styles.active : ''}`}
                onClick={() => setViewMode('matcher')}
              >
                🃏 Matcher
              </button>
            </div>

            {/* Favorites Toggle */}
            <button
              className={`${styles.favoritesBtn} ${showFavoritesOnly ? styles.active : ''}`}
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              title={`${favorites.length} favorita${favorites.length !== 1 ? 's' : ''}`}
            >
              ❤️ {favorites.length}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      {isLoaded && displayedProperties.length > 0 ? (
        <main className={styles.main}>
          {viewMode === 'matcher' && (
            <PropertySwipeCard
              properties={displayedProperties}
              onLike={handleLike}
              onPass={() => {}} // Pass action is handled by card component
            />
          )}

          {viewMode === 'discover' && (
            <DiscoverMode
              properties={displayedProperties}
              onLike={handleLike}
            />
          )}
        </main>
      ) : (
        <div className={styles.emptyState}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
            {showFavoritesOnly ? '🔍' : '🏠'}
          </div>
          <h2>
            {showFavoritesOnly
              ? 'No tienes favoritas aún'
              : 'Cargando propiedades...'}
          </h2>
          <p>
            {showFavoritesOnly
              ? 'Marca propiedades como favoritas para verlas aquí'
              : 'Por favor espera un momento'}
          </p>
          {showFavoritesOnly && (
            <button
              onClick={() => setShowFavoritesOnly(false)}
              className={styles.btnReset}
            >
              Ver todas las propiedades
            </button>
          )}
        </div>
      )}

      {/* Favorites Panel */}
      {favorites.length > 0 && (
        <div className={styles.favoritesPanel}>
          <h3>❤️ Mis Favoritas ({favorites.length})</h3>
          <div className={styles.favoritesList}>
            {properties
              .filter(p => favorites.includes(p.id))
              .map(prop => (
                <div key={prop.id} className={styles.favoriteItem}>
                  <div className={styles.favoriteInfo}>
                    <h4>{prop.title}</h4>
                    <p>💰 {new Intl.NumberFormat('es-MX', {
                      style: 'currency',
                      currency: 'MXN',
                      maximumFractionDigits: 0
                    }).format(prop.price)}</p>
                  </div>
                  <button
                    onClick={() => toggleFavorite(prop.id)}
                    className={styles.removeFavorite}
                    title="Quitar de favoritas"
                  >
                    ✕
                  </button>
                </div>
              ))}
          </div>
          <a href="tel:+526561327685" className={styles.contactBtn}>
            📞 Contactar sobre mis favoritas
          </a>
        </div>
      )}
    </div>
  );
}
