"use client";

import { useState, useMemo } from 'react';
import Header from '@/components/Header';
import PropertyModal from '@/components/PropertyModal';
import styles from './PortfolioPage.module.css';
import {
  Search, SlidersHorizontal, Grid3X3, Map, Heart,
  MapPin, BedDouble, Bath, Ruler, TrendingUp,
  ArrowUpDown, ChevronDown, X, Eye, Share2, Building2
} from 'lucide-react';

// Mock Extended Data for the Full Portfolio
const inventory = [
  { id: 1, title: 'Villa Oceana - Lux', location: 'Costa del Sol, ESP', price: '$2,500,000', priceNum: 2500000, status: 'Disponible', statusColor: 'green', type: 'Villa', image: '/hero-bg.png', lat: 36.5, lng: -4.8, roi: '14%', bedrooms: 5, bathrooms: 4, area: '620 m²', views: 420, daysOnMarket: 12, featured: true },
  { id: 2, title: 'Penthouse Horizon', location: 'Centro Financiero, CDMX', price: '$1,200,000', priceNum: 1200000, status: 'En Progreso', statusColor: 'yellow', type: 'Apartamento', image: '/hero-bg.png', lat: 19.4, lng: -99.1, roi: '11%', bedrooms: 3, bathrooms: 2, area: '280 m²', views: 850, daysOnMarket: 5, featured: true },
  { id: 3, title: 'Mansion Serene', location: 'Valle Verde, Monterrey', price: '$4,800,000', priceNum: 4800000, status: 'Vendido', statusColor: 'red', type: 'Mansion', image: '/hero-bg.png', lat: 25.6, lng: -100.3, roi: '15%', bedrooms: 7, bathrooms: 6, area: '1200 m²', views: 1200, daysOnMarket: 0, featured: false },
  { id: 4, title: 'Torre Zafiro - Oficinas', location: 'Polanco, CDMX', price: '$850,000', priceNum: 850000, status: 'Disponible', statusColor: 'green', type: 'Oficina', image: '/hero-bg.png', lat: 19.43, lng: -99.19, roi: '9%', bedrooms: 0, bathrooms: 2, area: '350 m²', views: 315, daysOnMarket: 30, featured: false },
  { id: 5, title: 'Condo Marea Alta', location: 'Tulum, QR', price: '$450,000', priceNum: 450000, status: 'Disponible', statusColor: 'green', type: 'Apartamento', image: '/hero-bg.png', lat: 20.2, lng: -87.4, roi: '18%', bedrooms: 2, bathrooms: 2, area: '140 m²', views: 680, daysOnMarket: 3, featured: true },
  { id: 6, title: 'Residencia Las Palmas', location: 'Zona Sur, Cd. Juárez', price: '$3,400,000', priceNum: 3400000, status: 'Disponible', statusColor: 'green', type: 'Villa', image: '/hero-bg.png', lat: 31.6, lng: -106.4, roi: '12%', bedrooms: 4, bathrooms: 3, area: '480 m²', views: 512, daysOnMarket: 8, featured: false },
];

type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'newest' | 'popular';

export default function PortfolioFullPage() {
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [savedProperties, setSavedProperties] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [maxPrice, setMaxPrice] = useState(5000000);
  const [minBedrooms, setMinBedrooms] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [compareList, setCompareList] = useState<number[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  const toggleSave = (id: number) => {
    setSavedProperties(prev => prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]);
  };

  const toggleCompare = (id: number) => {
    setCompareList(prev => {
      if (prev.includes(id)) return prev.filter(cId => cId !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const filteredInventory = useMemo(() => {
    let result = inventory.filter(i => {
      const matchType = filterType === 'All' || i.type === filterType;
      const matchStatus = filterStatus === 'All' || i.status === filterStatus;
      const matchSearch = i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          i.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchPrice = i.priceNum <= maxPrice;
      const matchBedrooms = i.bedrooms >= minBedrooms;
      return matchType && matchStatus && matchSearch && matchPrice && matchBedrooms;
    });

    switch (sortBy) {
      case 'price-asc': result.sort((a, b) => a.priceNum - b.priceNum); break;
      case 'price-desc': result.sort((a, b) => b.priceNum - a.priceNum); break;
      case 'newest': result.sort((a, b) => a.daysOnMarket - b.daysOnMarket); break;
      case 'popular': result.sort((a, b) => b.views - a.views); break;
      default: result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)); break;
    }
    return result;
  }, [filterType, filterStatus, searchTerm, sortBy, maxPrice, minBedrooms]);

  const compareProperties = inventory.filter(p => compareList.includes(p.id));

  const totalAvailable = inventory.filter(i => i.status === 'Disponible').length;
  const avgROI = (inventory.reduce((acc, i) => acc + parseFloat(i.roi), 0) / inventory.length).toFixed(1);

  return (
    <>
      <Header />
      <main className={styles.main}>
        {/* 15. Hero con stats agregadas */}
        <div className={styles.heroSection}>
          <div className={styles.heroGlow}></div>
          <div className={styles.heroContent}>
            <h1 className={styles.title}>Inventario <span className="text-gradient">Premium</span></h1>
            <p className={styles.subtitle}>Explora propiedades con métricas en tiempo real, análisis de AVA y herramientas de comparación.</p>
            {/* 14. KPI Counters */}
            <div className={styles.kpiRow}>
              <div className={styles.kpiCard}>
                <span className={styles.kpiValue}>{inventory.length}</span>
                <span className={styles.kpiLabel}>Propiedades Totales</span>
              </div>
              <div className={styles.kpiCard}>
                <span className={styles.kpiValue}>{totalAvailable}</span>
                <span className={styles.kpiLabel}>Disponibles</span>
              </div>
              <div className={styles.kpiCard}>
                <span className={styles.kpiValue}>{avgROI}%</span>
                <span className={styles.kpiLabel}>ROI Promedio</span>
              </div>
            </div>
          </div>
        </div>

        {/* 1, 2, 3. Search + Quick Filters + Sort */}
        <div className={styles.controlsBar}>
          <div className={styles.searchBar}>
            <Search size={20} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar por nombre, ubicación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.controlActions}>
            <button className={styles.filterToggleBtn} onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal size={18} /> Filtros {showFilters ? <ChevronDown size={16} style={{transform:'rotate(180deg)'}} /> : <ChevronDown size={16} />}
            </button>

            <div className={styles.sortWrapper}>
              <ArrowUpDown size={16} className={styles.sortIcon} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className={styles.sortSelect}
              >
                <option value="relevance">Relevancia</option>
                <option value="price-asc">Precio: Menor a Mayor</option>
                <option value="price-desc">Precio: Mayor a Menor</option>
                <option value="newest">Más Recientes</option>
                <option value="popular">Más Populares</option>
              </select>
            </div>

            <div className={styles.viewToggle}>
              <button
                className={`${styles.toggleBtn} ${viewMode === 'grid' ? styles.activeToggle : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 size={18} />
              </button>
              <button
                className={`${styles.toggleBtn} ${viewMode === 'map' ? styles.activeToggle : ''}`}
                onClick={() => setViewMode('map')}
              >
                <Map size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* 4. Advanced Filters Panel */}
        {showFilters && (
          <div className={`glass-panel ${styles.filtersPanel}`}>
            <div className={styles.filterGrid}>
              <div className={styles.filterItem}>
                <label>Tipo de Propiedad</label>
                <div className={styles.selectWrapper}>
                  <select className={styles.filterSelect} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                    <option value="All">Todos los Tipos</option>
                    <option value="Villa">Villas</option>
                    <option value="Mansion">Mansiones</option>
                    <option value="Apartamento">Apartamentos</option>
                    <option value="Oficina">Oficinas Comerciales</option>
                  </select>
                  <ChevronDown size={16} className={styles.selectIcon} />
                </div>
              </div>

              <div className={styles.filterItem}>
                <label>Estatus</label>
                <div className={styles.selectWrapper}>
                  <select className={styles.filterSelect} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="All">Todos</option>
                    <option value="Disponible">Disponible</option>
                    <option value="En Progreso">En Progreso</option>
                    <option value="Vendido">Vendido</option>
                  </select>
                  <ChevronDown size={16} className={styles.selectIcon} />
                </div>
              </div>

              <div className={styles.filterItem}>
                <label>Precio máx: <strong>${maxPrice.toLocaleString()}</strong></label>
                <input type="range" min="300000" max="5000000" step="100000" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className={styles.rangeInput} />
              </div>

              <div className={styles.filterItem}>
                <label>Recámaras mínimas: <strong>{minBedrooms}</strong></label>
                <input type="range" min="0" max="7" step="1" value={minBedrooms} onChange={(e) => setMinBedrooms(Number(e.target.value))} className={styles.rangeInput} />
              </div>
            </div>
            <button className={styles.resetFiltersBtn} onClick={() => {setFilterType('All'); setFilterStatus('All'); setMaxPrice(5000000); setMinBedrooms(0); setSearchTerm(''); setSortBy('relevance');}}>
              <X size={16} /> Limpiar Filtros
            </button>
          </div>
        )}

        {/* 13. Compare Bar */}
        {compareList.length > 0 && (
          <div className={styles.compareBar}>
            <span>{compareList.length}/3 seleccionadas para comparar</span>
            <div className={styles.compareActions}>
              <button className={styles.compareClearBtn} onClick={() => setCompareList([])}>Limpiar</button>
              {compareList.length >= 2 && (
                <button className={styles.compareOpenBtn} onClick={() => setShowCompare(true)}>
                  Comparar Ahora
                </button>
              )}
            </div>
          </div>
        )}

        {/* 5. Results count */}
        <div className={styles.resultsInfo}>
          <span>{filteredInventory.length} propiedad{filteredInventory.length !== 1 ? 'es' : ''} encontrada{filteredInventory.length !== 1 ? 's' : ''}</span>
        </div>

        {viewMode === 'grid' ? (
          <div className={styles.grid}>
            {filteredInventory.length > 0 ? filteredInventory.map(prop => (
              <div key={prop.id} className={`glass-panel ${styles.card} ${prop.featured ? styles.featuredCard : ''}`}>
                {/* 11. Featured badge */}
                {prop.featured && <div className={styles.featuredBadge}>⭐ Destacado</div>}
                <div
                  className={styles.image}
                  style={{ backgroundImage: `url(${prop.image})` }}
                  onClick={() => setSelectedProperty(prop)}
                >
                  <div className={`${styles.badge} ${styles[prop.statusColor]}`}>{prop.status}</div>
                  
                  {/* 6. Save Button */}
                  <button
                    className={`${styles.saveBtn} ${savedProperties.includes(prop.id) ? styles.saved : ''}`}
                    onClick={(e) => { e.stopPropagation(); toggleSave(prop.id); }}
                  >
                    <Heart size={18} fill={savedProperties.includes(prop.id) ? "currentColor" : "none"} />
                  </button>

                  {/* 12. Compare checkbox */}
                  <button
                    className={`${styles.compareBtn} ${compareList.includes(prop.id) ? styles.compareActive : ''}`}
                    onClick={(e) => { e.stopPropagation(); toggleCompare(prop.id); }}
                    title="Agregar a comparación"
                  >
                    {compareList.includes(prop.id) ? '✓' : '+'}
                  </button>

                  {/* 7. Quick stats overlay */}
                  <div className={styles.imageOverlay}>
                    <div className={styles.overlayStats}>
                      <span><Eye size={14} /> {prop.views}</span>
                      <span><TrendingUp size={14} /> ROI {prop.roi}</span>
                    </div>
                  </div>
                </div>
                <div className={styles.info}>
                  <h3>{prop.title}</h3>
                  <p className={styles.location}><MapPin size={14} /> {prop.location}</p>
                  
                  {/* 8. Property specs row */}
                  <div className={styles.specsRow}>
                    {prop.bedrooms > 0 && <span className={styles.specItem}><BedDouble size={14} /> {prop.bedrooms}</span>}
                    <span className={styles.specItem}><Bath size={14} /> {prop.bathrooms}</span>
                    <span className={styles.specItem}><Ruler size={14} /> {prop.area}</span>
                  </div>

                  {/* 9. Days on market */}
                  {prop.daysOnMarket > 0 && (
                    <div className={styles.daysOnMarket}>
                      {prop.daysOnMarket <= 7 ? '🔥 Nuevo — ' : ''}{prop.daysOnMarket} días en el mercado
                    </div>
                  )}

                  <div className={styles.row}>
                    <span className={styles.price}>{prop.price}</span>
                    <div className={styles.cardBtns}>
                      <button onClick={(e) => { e.stopPropagation(); alert('🔗 Enlace copiado'); }} className={styles.iconBtn}><Share2 size={16} /></button>
                      <button onClick={() => setSelectedProperty(prop)} className={styles.detailsBtn}>Ver Detalles</button>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className={styles.noResults}>
                <Building2 size={48} className={styles.noResultsIcon} />
                <p>No se encontraron propiedades con estos filtros.</p>
                <button onClick={() => { setFilterType('All'); setFilterStatus('All'); setMaxPrice(5000000); setMinBedrooms(0); setSearchTerm(''); }} className={styles.resetBtn}>Limpiar Filtros</button>
              </div>
            )}
          </div>
        ) : (
          /* 10. Map view enhanced */
          <div className={`glass-panel ${styles.mapContainer}`}>
            <div className={styles.mapMock}>
              <div className={styles.mapOverlayText}><Map size={16} /> Mapa Satelital Global Activo</div>
              <div className={styles.mapGrid}></div>
              {filteredInventory.map(prop => (
                <div
                  key={prop.id}
                  className={styles.mapPin}
                  style={{
                    top: `${(Math.abs(prop.lat) / 40) * 100}%`,
                    left: `${(Math.abs(prop.lng) / 120) * 100}%`
                  }}
                  onClick={() => setSelectedProperty(prop)}
                >
                  <div className={`${styles.pinDot} ${styles[`pin${prop.statusColor}`]}`}></div>
                  <div className={styles.pinTooltip}>
                    <strong>{prop.title}</strong>
                    <span>{prop.price}</span>
                    <div className={styles.pinSpecs}>
                      {prop.bedrooms > 0 && <span><BedDouble size={12} /> {prop.bedrooms}</span>}
                      <span><Ruler size={12} /> {prop.area}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Compare Modal */}
      {showCompare && compareProperties.length >= 2 && (
        <div className={styles.compareOverlay}>
          <div className={`glass-panel ${styles.compareModal}`}>
            <div className={styles.compareHeader}>
              <h2>Comparar Propiedades</h2>
              <button className={styles.closeBtn} onClick={() => setShowCompare(false)}><X size={24} /></button>
            </div>
            <div className={styles.compareGrid}>
              {compareProperties.map(prop => (
                <div key={prop.id} className={styles.compareColumn}>
                  <div className={styles.compareImage} style={{ backgroundImage: `url(${prop.image})` }}></div>
                  <h3>{prop.title}</h3>
                  <div className={styles.compareDetail}><MapPin size={14} /> {prop.location}</div>
                  <div className={styles.compareDetail}><strong>Precio:</strong> {prop.price}</div>
                  <div className={styles.compareDetail}><BedDouble size={14} /> {prop.bedrooms} Recámaras</div>
                  <div className={styles.compareDetail}><Bath size={14} /> {prop.bathrooms} Baños</div>
                  <div className={styles.compareDetail}><Ruler size={14} /> {prop.area}</div>
                  <div className={styles.compareDetail}><TrendingUp size={14} /> ROI: {prop.roi}</div>
                  <div className={styles.compareDetail}><Eye size={14} /> {prop.views} vistas</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <PropertyModal
        property={selectedProperty}
        isOpen={!!selectedProperty}
        onClose={() => setSelectedProperty(null)}
      />
    </>
  );
}
