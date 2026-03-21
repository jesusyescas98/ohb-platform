"use client";

import { useState, useMemo } from 'react';
import Image from 'next/image';
import styles from './Portfolio.module.css';
import PropertyModal from './PropertyModal';

const properties = [
  {
    id: 1,
    title: "Villa Oceana - Lux",
    location: "Costa del Sol",
    price: 2500000,
    priceStr: "$2,500,000",
    status: "Disponible",
    statusColor: "green",
    category: "Casa",
    image: "/hero-bg.png"
  },
  {
    id: 2,
    title: "Penthouse Horizon",
    location: "Centro Financiero",
    price: 1200000,
    priceStr: "$1,200,000",
    status: "En Progreso (8 Interesados)",
    statusColor: "yellow",
    category: "Departamento",
    image: "/hero-bg.png"
  },
  {
    id: 3,
    title: "Mansion Serene",
    location: "Valle Verde",
    price: 4800000,
    priceStr: "$4,800,000",
    status: "Vendido",
    statusColor: "red",
    category: "Casa",
    image: "/hero-bg.png"
  },
  {
    id: 4,
    title: "Local Comercial Centro",
    location: "Av. Principal",
    price: 850000,
    priceStr: "$850,000",
    status: "Disponible",
    statusColor: "green",
    category: "Comercial",
    image: "/hero-bg.png"
  }
];

export default function Portfolio() {
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [filterCategory, setFilterCategory] = useState<string>("Todos");
  const [maxPrice, setMaxPrice] = useState<number>(5000000);

  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      const matchCategory = filterCategory === "Todos" || p.category === filterCategory;
      const matchPrice = p.price <= maxPrice;
      return matchCategory && matchPrice;
    });
  }, [filterCategory, maxPrice]);

  return (
    <section className={styles.portfolioSection} id="proyectos">
      <div className={styles.header}>
        <h2 className={styles.title}>Portafolio <span className="text-gradient-silver">Premium</span></h2>
        <p className={styles.subtitle}>Inversiones seguras con alta rentabilidad, seleccionadas por nuestros expertos y analizadas en tiempo real.</p>
      </div>

      <div className={styles.filterSection} style={{ display: 'flex', gap: '2rem', marginBottom: '3rem', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <label style={{ color: 'var(--text-secondary)' }}>Categoría:</label>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--glass-border)', outline: 'none' }}>
            <option value="Todos" style={{color: '#0B0F19'}}>Todos</option>
            <option value="Casa" style={{color: '#0B0F19'}}>Casas</option>
            <option value="Departamento" style={{color: '#0B0F19'}}>Departamentos</option>
            <option value="Comercial" style={{color: '#0B0F19'}}>Comercial</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label style={{ color: 'var(--text-secondary)' }}>Precio Máximo: <strong>${maxPrice.toLocaleString()}</strong></label>
          <input type="range" min="500000" max="5000000" step="100000" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} style={{ width: '200px' }} />
        </div>
      </div>

      <div className={styles.grid}>
        {filteredProperties.length > 0 ? filteredProperties.map((prop) => (
          <div key={prop.id} className={`glass-panel ${styles.card}`}>
            <div className={styles.imageContainer}>
              <div className={`${styles.statusBadge} ${styles[prop.statusColor]}`}>
                {prop.status}
              </div>
            </div>
            <div className={styles.details}>
              <h3>{prop.title}</h3>
              <p className={styles.location}>{prop.location}</p>
              <div className={styles.priceRow}>
                <span className={styles.price}>{prop.priceStr}</span>
                <button 
                  className={styles.actionBtn}
                  onClick={() => setSelectedProperty(prop)}
                >
                  Ver Detalles
                </button>
              </div>
            </div>
          </div>
        )) : (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', gridColumn: '1 / -1' }}>No se encontraron propiedades con estos filtros.</p>
        )}
      </div>

      <PropertyModal 
        property={selectedProperty} 
        isOpen={!!selectedProperty} 
        onClose={() => setSelectedProperty(null)} 
      />
    </section>
  );
}
