import { useEffect, useState } from 'react';

interface Property {
  _id: string;
  name: string;
  address: string;
  price: number;
  lat?: number;
  lng?: number;
}

export default function PropertyMap({ properties }: { properties: Property[] }) {
  const [MapComponents, setMapComponents] = useState<any>(null);

  useEffect(() => {
    // Solo cargar en el cliente
    Promise.all([
      import('react-leaflet'),
      import('leaflet'),
      import('leaflet/dist/leaflet.css'),
    ]).then(([ReactLeaflet, L, _]) => {
      // Configurar iconos
      const markerIcon = new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href;
      const markerIconRetina = new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href;
      const markerShadow = new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href;

      const DefaultIcon = L.default.icon({
        iconUrl: markerIcon,
        iconRetinaUrl: markerIconRetina,
        shadowUrl: markerShadow,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      L.default.Marker.prototype.options.icon = DefaultIcon;

      setMapComponents({
        MapContainer: ReactLeaflet.MapContainer,
        TileLayer: ReactLeaflet.TileLayer,
        Marker: ReactLeaflet.Marker,
        Popup: ReactLeaflet.Popup,
        useMap: ReactLeaflet.useMap,
      });
    });
  }, []);

  if (!MapComponents) return <div className="w-full h-[600px] bg-gray-100 animate-pulse rounded-[3rem]"></div>;

  const { MapContainer, TileLayer, Marker, Popup } = MapComponents;

  const validProperties = properties.filter(p => p.lat !== undefined && p.lng !== undefined);
  const center: [number, number] = validProperties.length > 0 
    ? [validProperties[0].lat!, validProperties[0].lng!] 
    : [19.4326, -99.1332]; // CDMX default

  return (
    <div className="w-full h-[600px] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white/50 relative z-0">
      <MapContainer 
        center={center} 
        zoom={12} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {validProperties.map((p) => (
          <Marker key={p._id} position={[p.lat!, p.lng!]}>
            <Popup>
              <div className="p-2">
                <h4 className="font-black text-blue-950 text-sm leading-tight">{p.name}</h4>
                <p className="text-[10px] text-blue-600 font-bold uppercase mt-1">{p.address}</p>
                <div className="mt-3 text-lg font-black text-blue-800">
                  ${p.price.toLocaleString()} MXN
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
