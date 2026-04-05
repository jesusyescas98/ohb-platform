'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Property, PROPERTY_TYPE_LABELS } from '../../lib/types';
import { formatPrice, getPropertyTypeIcon, getWhatsAppLink } from '../../lib/propertyData';
import styles from './PropertyCard.module.css';

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const typeClass = `badge${property.type.charAt(0).toUpperCase() + property.type.slice(1)}` as keyof typeof styles;
  const isSoldOrReserved = property.status !== 'activa';

  return (
    <Link href={`/propiedades/${property.id}`} className={styles.card} id={`property-card-${property.id}`}>
      {/* Image */}
      <div className={styles.imageWrapper}>
        <Image
          src={property.images[0] || '/hero-bg.png'}
          alt={property.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={styles.image}
        />

        {/* Type Badge */}
        <span className={`${styles.badge} ${styles[typeClass] || styles.badgeCasa}`}>
          {getPropertyTypeIcon(property.type)} {PROPERTY_TYPE_LABELS[property.type]}
        </span>

        {/* Featured Ribbon */}
        {property.featured && (
          <span className={styles.featuredRibbon}>
            ⭐ Destacada
          </span>
        )}

        {/* Sold/Reserved Overlay */}
        {isSoldOrReserved && (
          <div className={styles.statusOverlay}>
            <span className={styles.statusLabel}>
              {property.status === 'vendida' ? 'VENDIDA' : 'RESERVADA'}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.price}>{formatPrice(property.price)}</div>
        <h3 className={styles.title}>{property.title}</h3>
        <div className={styles.location}>
          <span className={styles.locationIcon}>📍</span>
          {property.location}
        </div>

        {/* Specs */}
        <div className={styles.specs}>
          {property.bedrooms > 0 && (
            <div className={styles.spec}>
              <span className={styles.specIcon}>🛏️</span>
              <span className={styles.specValue}>{property.bedrooms}</span>
              Rec.
            </div>
          )}
          {property.bathrooms > 0 && (
            <div className={styles.spec}>
              <span className={styles.specIcon}>🚿</span>
              <span className={styles.specValue}>{property.bathrooms}</span>
              Baños
            </div>
          )}
          <div className={styles.spec}>
            <span className={styles.specIcon}>📐</span>
            <span className={styles.specValue}>{property.sqMeters}</span>
            m²
          </div>
          {property.parking > 0 && (
            <div className={styles.spec}>
              <span className={styles.specIcon}>🚗</span>
              <span className={styles.specValue}>{property.parking}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <span className={styles.viewBtn}>
          Ver detalles →
        </span>
        <button
          type="button"
          className={styles.whatsappBtn}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window.open(getWhatsAppLink(property.title), '_blank', 'noopener,noreferrer');
          }}
        >
          💬 WhatsApp
        </button>
      </div>
    </Link>
  );
}
