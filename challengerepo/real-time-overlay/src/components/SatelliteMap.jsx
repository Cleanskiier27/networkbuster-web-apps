import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in React Leaflet
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

export default function SatelliteMap() {
    const position = [51.505, -0.09]; // Default coordinates

    return (
        <div className="w-full h-full relative" style={{ minHeight: '300px' }}>
            <div className="absolute top-2 right-2 z-[1000] bg-black/50 px-2 py-1 text-xs text-[#00f0ff] border border-[#00f0ff]">
                SAT_LINK: ONLINE
            </div>
            <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
                <Marker position={position}>
                    <Popup>
                        TARGET ZERO. <br /> Signal Strength: 100%.
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
}
