"use client";

import styles from './PropertyModal.module.css';

interface Property {
  id: number;
  title: string;
  location: string;
  price: string;
  status: string;
  statusColor: string;
  image: string;
  description?: string;
  amenities?: string[];
  roi?: string;
  rooms?: number;
  area?: string;
}

interface PropertyModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PropertyModal({ property, isOpen, onClose }: PropertyModalProps) {
  if (!isOpen || !property) return null;

  return (
    <div className={styles.overlay}>
      <div className={`glass-panel ${styles.modal}`}>
        <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        
        <div className={styles.contentLayout}>
          <div className={styles.imageColumn}>
            <div 
              className={styles.mainImage} 
              style={{ backgroundImage: `url(${property.image})` }}
            >
              <div className={`${styles.statusBadge} ${styles[property.statusColor]}`}>
                {property.status}
              </div>
            </div>
          </div>
          
          <div className={styles.detailsColumn}>
            <div className={styles.header}>
              <h2>{property.title}</h2>
              <p className={styles.location}>📍 {property.location}</p>
            </div>

            <div className={styles.priceRow}>
              <span className={styles.price}>{property.price}</span>
            </div>

            <div className={styles.aiPrediction}>
              <div className={styles.aiBadge}>✨ AVA Predicts</div>
              <p>Revalorización proyectada del <strong>{property.roi || "12%"} a 24 meses</strong> debido al desarrollo comercial de la zona.</p>
            </div>

            <div className={styles.specsRow}>
              <div className={styles.spec}>
                <span className={styles.specLabel}>Habitaciones</span>
                <span className={styles.specValue}>{property.rooms || 4}</span>
              </div>
              <div className={styles.spec}>
                <span className={styles.specLabel}>Superficie</span>
                <span className={styles.specValue}>{property.area || "450 m²"}</span>
              </div>
            </div>

            <div className={styles.description}>
              <h3>Descripción</h3>
              <p>{property.description || "Propiedad exclusiva con diseño arquitectónico moderno, amplios ventanales y vistas panorámicas. Ideal para inversionistas que buscan alta rentabilidad."}</p>
            </div>

            <div className={styles.utilityActions}>
              <button 
                className={styles.iconBtn} 
                onClick={() => alert('¡Propiedad guardada en Favoritos 📌!')}
              >
                ❤️ Guardar
              </button>
              <button 
                className={styles.iconBtn}
                onClick={() => alert('📥 Descargando Folleto Comercial (PDF)...')}
              >
                📄 Brochures
              </button>
              <button 
                className={styles.iconBtn}
                onClick={() => alert('🔗 Enlace de propiedad copiado al portapapeles')}
              >
                🔗 Compartir
              </button>
            </div>

            <div className={styles.actions}>
              <button className={`${styles.btn} ${styles.btnPrimary}`}>Agendar Visita Virtual (IA)</button>
              <button className={`${styles.btn} ${styles.btnSecondary}`}>Contactar Asesor</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
