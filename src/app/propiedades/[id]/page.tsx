'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Link2, Share2 } from 'lucide-react';
import Header from '../../../components/Header';
import PropertyCard from '../../../components/properties/PropertyCard';
import { formatPrice, getPropertyTypeIcon, getWhatsAppLink } from '../../../lib/propertyData';
import { PROPERTY_TYPE_LABELS, OHB_WHATSAPP_DISPLAY, OHB_DOMAIN } from '../../../lib/types';
import { getAllPublicProperties, getPublicPropertyById } from '../../../lib/propertyAdapter';
import { savePublicLead } from '../../../lib/leadBridge';
import styles from './propertyDetail.module.css';

export default function PropertyDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [allProperties, setAllProperties] = useState<ReturnType<typeof getAllPublicProperties>>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setAllProperties(getAllPublicProperties());
  }, []);

  const property = useMemo(() => {
    if (!mounted) return getPublicPropertyById(id);
    return allProperties.find(p => p.id === id) || getPublicPropertyById(id);
  }, [id, mounted, allProperties]);

  const [activeImage, setActiveImage] = useState(0);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const similar = useMemo(() => {
    if (!property) return [];
    const source = mounted ? allProperties : [];
    return source
      .filter(p => p.id !== property.id && p.status === 'activa' && (p.type === property.type || p.colonia === property.colonia))
      .slice(0, 3);
  }, [property, mounted, allProperties]);

  if (!property) {
    return (
      <div className={styles.page}>
        <Header />
        <div className={styles.container}>
          <div className={styles.notFound}>
            <div className={styles.notFoundIcon}>🏠</div>
            <h2 className={styles.notFoundTitle}>Propiedad no encontrada</h2>
            <p className={styles.notFoundText}>
              La propiedad que buscas no existe o ya no está disponible.
            </p>
            <Link href="/propiedades" className="btn btn-primary">
              ← Ver todas las propiedades
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    savePublicLead({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      message: formData.message,
      propertyId: property.id,
      propertyTitle: property.title,
      source: 'portal web',
    });
    setSubmitted(true);
    setFormData({ name: '', phone: '', email: '', message: '' });
    setTimeout(() => setSubmitted(false), 8000);
  };

  const handlePrevImage = () => {
    setActiveImage(prev => (prev === 0 ? property.images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImage(prev => (prev === property.images.length - 1 ? 0 : prev + 1));
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`Mira esta propiedad: ${property.title} - ${formatPrice(property.price)} MXN\n${window.location.href}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // Schema.org JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description,
    url: `${OHB_DOMAIN}/propiedades/${property.id}`,
    image: property.images,
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: 'MXN',
      availability: property.status === 'activa'
        ? 'https://schema.org/InStock'
        : 'https://schema.org/SoldOut',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Ciudad Juárez',
      addressRegion: 'Chihuahua',
      addressCountry: 'MX',
      streetAddress: property.address,
    },
    ...(property.lat && property.lng ? {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: property.lat,
        longitude: property.lng,
      },
    } : {}),
  };

  return (
    <div className={styles.page}>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className={styles.container}>
        {/* Breadcrumbs */}
        <nav className={styles.breadcrumbs}>
          <Link href="/">Inicio</Link>
          <span className={styles.breadcrumbSep}>›</span>
          <Link href="/propiedades">Propiedades</Link>
          <span className={styles.breadcrumbSep}>›</span>
          <span className={styles.breadcrumbCurrent}>{property.title}</span>
        </nav>

        <div className={styles.layout}>
          {/* Main Column */}
          <div>
            {/* Gallery */}
            <div className={styles.gallery}>
              <div className={styles.mainImage}>
                <Image
                  src={property.images[activeImage] || '/hero-bg.png'}
                  alt={`${property.title} - Foto ${activeImage + 1}`}
                  fill
                  sizes="(max-width: 968px) 100vw, 65vw"
                  style={{ objectFit: 'cover' }}
                  priority
                />
                {property.images.length > 1 && (
                  <>
                    <button
                      className={`${styles.galleryArrow} ${styles.galleryArrowLeft}`}
                      onClick={handlePrevImage}
                      aria-label="Imagen anterior"
                    >
                      <ChevronLeft size={22} />
                    </button>
                    <button
                      className={`${styles.galleryArrow} ${styles.galleryArrowRight}`}
                      onClick={handleNextImage}
                      aria-label="Imagen siguiente"
                    >
                      <ChevronRight size={22} />
                    </button>
                  </>
                )}
              </div>
              {property.images.length > 1 && (
                <div className={styles.thumbs}>
                  {property.images.map((img, i) => (
                    <button
                      key={i}
                      className={`${styles.thumb} ${i === activeImage ? styles.thumbActive : ''}`}
                      onClick={() => setActiveImage(i)}
                    >
                      <Image src={img} alt={`Foto ${i + 1}`} fill sizes="80px" style={{ objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className={styles.info}>
              <div className={styles.typeBadge}>
                {getPropertyTypeIcon(property.type)} {PROPERTY_TYPE_LABELS[property.type]}
                {property.featured && <> · ⭐ Destacada</>}
              </div>

              {/* Share buttons */}
              <div className={styles.shareBar}>
                <button
                  className={`${styles.shareBtn} ${linkCopied ? styles.shareCopied : ''}`}
                  onClick={handleCopyLink}
                >
                  <Link2 size={14} />
                  {linkCopied ? 'Enlace copiado' : 'Copiar enlace'}
                </button>
                <button
                  className={`${styles.shareBtn} ${styles.shareBtnWhatsapp}`}
                  onClick={handleShareWhatsApp}
                >
                  <Share2 size={14} />
                  Compartir por WhatsApp
                </button>
              </div>

              <div className={styles.priceRow}>
                <span className={styles.price}>{formatPrice(property.price)}</span>
                <span className={styles.priceCurrency}>MXN</span>
              </div>

              <h1 className={styles.title}>{property.title}</h1>
              <div className={styles.location}>
                📍 {property.address} · {property.location}
              </div>

              {/* Specs */}
              <div className={styles.specsRow}>
                {property.bedrooms > 0 && (
                  <div className={styles.specItem}>
                    <span className={styles.specIcon}>🛏️</span>
                    <span className={styles.specVal}>{property.bedrooms}</span>
                    <span className={styles.specLabel}>Recámaras</span>
                  </div>
                )}
                {property.bathrooms > 0 && (
                  <div className={styles.specItem}>
                    <span className={styles.specIcon}>🚿</span>
                    <span className={styles.specVal}>{property.bathrooms}</span>
                    <span className={styles.specLabel}>Baños</span>
                  </div>
                )}
                <div className={styles.specItem}>
                  <span className={styles.specIcon}>📐</span>
                  <span className={styles.specVal}>{property.sqMeters}</span>
                  <span className={styles.specLabel}>m²</span>
                </div>
                {property.parking > 0 && (
                  <div className={styles.specItem}>
                    <span className={styles.specIcon}>🚗</span>
                    <span className={styles.specVal}>{property.parking}</span>
                    <span className={styles.specLabel}>Estac.</span>
                  </div>
                )}
                {property.floors && (
                  <div className={styles.specItem}>
                    <span className={styles.specIcon}>🏗️</span>
                    <span className={styles.specVal}>{property.floors}</span>
                    <span className={styles.specLabel}>Niveles</span>
                  </div>
                )}
                {property.yearBuilt && (
                  <div className={styles.specItem}>
                    <span className={styles.specIcon}>📅</span>
                    <span className={styles.specVal}>{property.yearBuilt}</span>
                    <span className={styles.specLabel}>Año</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className={styles.descSection}>
                <h2 className={styles.sectionTitle}>📋 Descripción</h2>
                <p className={styles.description}>{property.description}</p>
              </div>

              {/* Amenities */}
              {property.amenities.length > 0 && (
                <div>
                  <h2 className={styles.sectionTitle}>✨ Características y Amenidades</h2>
                  <div className={styles.amenitiesGrid}>
                    {property.amenities.map((am, i) => (
                      <span key={i} className={styles.amenity}>
                        ✓ {am}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Map */}
              {property.lat && property.lng && (
                <div>
                  <h2 className={styles.sectionTitle}>📍 Ubicación</h2>
                  <div className={styles.mapWrapper}>
                    <iframe
                      src={`https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d3393!2d${property.lng}!3d${property.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1ses!2smx`}
                      width="100%"
                      height="300"
                      style={{ border: 0, display: 'block' }}
                      allowFullScreen={false}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Similar Properties */}
            {similar.length > 0 && (
              <div className={styles.similarSection}>
                <h2 className={styles.sectionTitle}>🏠 Propiedades Similares</h2>
                <div className={styles.similarGrid}>
                  {similar.map(p => (
                    <PropertyCard key={p.id} property={p} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className={styles.sidebar}>
            {/* Contact Card */}
            <div className={styles.contactCard}>
              <h3 className={styles.contactCardTitle}>¿Te interesa esta propiedad?</h3>
              <p className={styles.contactCardSub}>
                Déjanos tus datos y un asesor especializado te contactará para agendar una visita.
              </p>

              {submitted ? (
                <div className={styles.successMsg}>
                  ✅ ¡Gracias! Un asesor se comunicará contigo pronto.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className={styles.contactForm}>
                  <input
                    type="text"
                    placeholder="Tu nombre completo"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className={styles.formInput}
                    required
                    id="lead-name"
                  />
                  <input
                    type="tel"
                    placeholder="Tu teléfono"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className={styles.formInput}
                    required
                    id="lead-phone"
                  />
                  <input
                    type="email"
                    placeholder="Tu email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className={styles.formInput}
                    required
                    id="lead-email"
                  />
                  <textarea
                    placeholder="Mensaje (opcional): ej. Quiero agendar una visita..."
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    className={`${styles.formInput} ${styles.formTextarea}`}
                    id="lead-message"
                  />
                  <button type="submit" className={styles.submitBtn}>
                    📩 Solicitar Información
                  </button>
                </form>
              )}

              <div className={styles.divider} style={{ margin: '1rem 0' }}>o</div>

              <a
                href={getWhatsAppLink(property.title)}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.whatsappFullBtn}
              >
                💬 Escribir por WhatsApp
              </a>
            </div>

            {/* Quick Info */}
            <div className={styles.directContact}>
              <h4 className={styles.contactCardTitle}>📞 Contacto Directo</h4>
              <div className={styles.directContactItem}>
                <span>📱</span> <strong>{OHB_WHATSAPP_DISPLAY}</strong>
              </div>
              <div className={styles.directContactItem}>
                <span>📧</span> contacto@ohbasesoriasyconsultorias.com
              </div>
              <div className={styles.directContactItem}>
                <span>🕐</span> Lun-Vie 9:00-18:00 | Sáb 9:00-14:00
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
