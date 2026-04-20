'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import PropertyCard from '../../components/properties/PropertyCard';
import PropertyMap from '../../components/PropertyMap';
import { getWhatsAppLink } from '../../lib/propertyData';
import { PROPERTY_TYPE_LABELS, COLONIAS_JUAREZ } from '../../lib/types';
import type { Property, PropertyType } from '../../lib/types';
import { getAllPublicProperties } from '../../lib/propertyAdapter';
import styles from './propiedades.module.css';

type SortOption = 'recent' | 'price-asc' | 'price-desc' | 'size';

export default function PropiedadesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [mounted, setMounted] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<PropertyType | ''>('');
  const [locationFilter, setLocationFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [bedroomFilter, setBedroomFilter] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  useEffect(() => {
    setMounted(true);
    setProperties(getAllPublicProperties());
  }, []);

  const activeProperties = useMemo(() => properties.filter(p => p.status === 'activa'), [properties]);

  const filtered = useMemo(() => {
    let result = [...activeProperties];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.colonia.toLowerCase().includes(q)
      );
    }

    if (typeFilter) {
      result = result.filter(p => p.type === typeFilter);
    }

    if (locationFilter) {
      result = result.filter(p => p.colonia === locationFilter);
    }

    if (priceFilter) {
      const [min, max] = priceFilter.split('-').map(Number);
      result = result.filter(p => {
        if (max) return p.price >= min && p.price <= max;
        return p.price >= min;
      });
    }

    if (bedroomFilter) {
      const beds = parseInt(bedroomFilter);
      if (beds === 4) {
        result = result.filter(p => p.bedrooms >= 4);
      } else {
        result = result.filter(p => p.bedrooms === beds);
      }
    }

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'size':
        result.sort((a, b) => b.sqMeters - a.sqMeters);
        break;
      case 'recent':
      default:
        result.sort((a, b) => b.createdAt - a.createdAt);
        break;
    }

    return result;
  }, [search, typeFilter, locationFilter, priceFilter, bedroomFilter, sortBy, activeProperties]);

  const hasFilters = search || typeFilter || locationFilter || priceFilter || bedroomFilter;

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('');
    setLocationFilter('');
    setPriceFilter('');
    setBedroomFilter('');
  };

  return (
    <div className={styles.page}>
      <Header />

      {/* Page Header */}
      <div className={styles.header}>
        <span className="section-label">🏠 Portafolio Inmobiliario</span>
        <h1>
          Encuentra tu <span className="text-gradient">Propiedad Ideal</span>
        </h1>
        <p className={styles.headerSub}>
          Explora nuestro portafolio exclusivo de propiedades en las mejores zonas
          de Ciudad Juárez. Casas, departamentos, terrenos y oportunidades de inversión.
        </p>
        {mounted && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div className={styles.resultCount}>
              Mostrando <strong>{filtered.length}</strong> de {activeProperties.length} propiedades disponibles
            </div>
            <Link href="/discover" style={{
              padding: '0.7rem 1.2rem',
              background: 'linear-gradient(135deg, var(--accent-blue) 0%, #1B5E8F 100%)',
              color: 'white',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              whiteSpace: 'nowrap',
              transition: 'all 0.3s ease'
            }} onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(27, 58, 107, 0.3)';
            }} onMouseLeave={(e) => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '';
            }}>
              🎬 Descubre Modo
            </Link>
          </div>
        )}
      </div>

      {/* Interactive Map Section */}
      <div style={{ padding: '0 1.5rem', marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '0.5rem', fontSize: '1.4rem', color: 'white' }}>
          Ubicación de Propiedades en <span className="text-gradient">Juárez</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Explora nuestro portafolio de manera interactiva. Haz clic en los marcadores para ver los detalles de cada propiedad.
        </p>
        {mounted && (
          <PropertyMap
            properties={activeProperties}
            onPropertyClick={(property) => {
              // Smooth scroll to property details
              const element = document.getElementById(`property-${property.id}`);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
          />
        )}
      </div>

      {/* Filters */}
      <div className={styles.filtersBar}>
        {/* Mobile toggle */}
        <button
          className={styles.filtersToggle}
          onClick={() => setFiltersOpen(!filtersOpen)}
        >
          {filtersOpen ? '✕ Cerrar Filtros' : '🔍 Filtros'}
          {hasFilters && ' (activos)'}
        </button>

        <div className={`${styles.filtersCollapsible || ''} ${filtersOpen ? styles.filtersOpen || '' : ''}`}>
          <div className={styles.filtersInner}>
            <div className={styles.filterGroup} style={{ flex: 2 }}>
              <label className={styles.filterLabel}>Buscar</label>
              <input
                type="text"
                placeholder="Buscar por nombre, colonia, descripción..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.filterInput}
                id="property-search"
              />
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Tipo</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as PropertyType | '')}
                className={styles.filterSelect}
                id="filter-type"
              >
                <option value="">Todos los tipos</option>
                {Object.entries(PROPERTY_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Ubicación</label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className={styles.filterSelect}
                id="filter-location"
              >
                <option value="">Todas las zonas</option>
                {COLONIAS_JUAREZ.map((col) => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Precio</label>
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className={styles.filterSelect}
                id="filter-price"
              >
                <option value="">Cualquier precio</option>
                <option value="0-1500000">Hasta $1.5M</option>
                <option value="1500000-3000000">$1.5M - $3M</option>
                <option value="3000000-5000000">$3M - $5M</option>
                <option value="5000000-999999999">Más de $5M</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Recámaras</label>
              <select
                value={bedroomFilter}
                onChange={(e) => setBedroomFilter(e.target.value)}
                className={styles.filterSelect}
                id="filter-bedrooms"
              >
                <option value="">Cualquier</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4+</option>
              </select>
            </div>

            {hasFilters && (
              <button onClick={clearFilters} className={styles.clearBtn}>
                ✕ Limpiar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sort Tabs + Grid */}
      <div className={styles.gridContainer}>
        <div className={styles.sortTabs} style={{ marginBottom: '1.5rem' }}>
          {([
            ['recent', '🕐 Recientes'],
            ['price-asc', '💰 Menor precio'],
            ['price-desc', '💎 Mayor precio'],
            ['size', '📐 Mayor tamaño'],
          ] as [SortOption, string][]).map(([value, label]) => (
            <button
              key={value}
              className={`${styles.sortTab} ${sortBy === value ? styles.sortTabActive : ''}`}
              onClick={() => setSortBy(value)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className={styles.grid}>
          {filtered.length > 0 ? (
            filtered.map((property) => (
              <div key={property.id} id={`property-${property.id}`}>
                <PropertyCard property={property} />
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🔍</div>
              <h3 className={styles.emptyTitle}>No encontramos propiedades</h3>
              <p className={styles.emptyText}>
                Intenta con otros filtros o contáctanos para que busquemos algo especial para ti.
              </p>
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp"
                style={{ marginTop: '1.5rem', display: 'inline-flex' }}
              >
                💬 Pedir Asesoría por WhatsApp
              </a>
            </div>
          )}
        </div>
      </div>

      {/* CTA Banner */}
      <div className={styles.ctaBanner}>
        <div className={styles.ctaInner}>
          <div className={styles.ctaText}>
            <h3>¿No encuentras lo que buscas?</h3>
            <p>Nuestro equipo tiene acceso a propiedades que no están publicadas. Contáctanos para una búsqueda personalizada.</p>
          </div>
          <div className={styles.ctaActions}>
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp"
            >
              💬 WhatsApp
            </a>
            <a
              href="/contacto"
              className="btn btn-secondary"
            >
              📧 Contacto
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
