import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import useVehicleStore from '../store/useVehicleStore';
import { getStatusColor, getVehicleIcon, formatSpeed, formatFuel, formatWeight } from '../utils/formatters';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import './VehicleTrackingPage.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const createVehicleIcon = (type, status) => {
  const colors = { active: '#10b981', idle: '#f59e0b', maintenance: '#0ea5e9', offline: '#ef4444', returning: '#8b5cf6' };
  const color = colors[status] || '#94a3b8';
  return L.divIcon({
    className: 'vehicle-marker-icon',
    html: `<div style="width:36px;height:36px;border-radius:50%;background:${color};border:3px solid white;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.3);cursor:pointer;">${getVehicleIcon(type)}</div>`,
    iconSize: [36, 36], iconAnchor: [18, 18],
  });
};

const dumpIcon = L.divIcon({
  className: 'dump-marker',
  html: '<div style="width:30px;height:30px;border-radius:50%;background:#ef4444;border:3px solid white;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,0.3);">🏭</div>',
  iconSize: [30, 30], iconAnchor: [15, 15],
});

const dumpingYards = [
  { name: 'Kurnool Municipal Dumping Yard', lat: 15.8450, lng: 78.0650 },
  { name: 'Orvakal Dump Site', lat: 15.7900, lng: 78.0800 },
  { name: 'Panyam Road Yard', lat: 15.8550, lng: 78.0200 },
];

function FitBounds({ vehicles }) {
  const map = useMap();
  useEffect(() => {
    if (vehicles.length > 0) {
      const bounds = vehicles.filter(v => v.currentLocation?.lat && v.currentLocation?.lng).map(v => [v.currentLocation.lat, v.currentLocation.lng]);
      if (bounds.length > 0) map.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 });
    }
  }, [vehicles.length]);
  return null;
}

export default function VehicleTrackingPage() {
  const { vehicles, fetchVehicles, filters, setFilters } = useVehicleStore();
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => { fetchVehicles(); }, []);

  const filtered = vehicles.filter(v => {
    const matchSearch = !searchTerm || v.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || v.driverName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = !filters.status || v.status === filters.status;
    const matchType = !filters.type || v.vehicleType === filters.type;
    const matchZone = !filters.zone || v.cleaningZone === filters.zone;
    return matchSearch && matchStatus && matchType && matchZone;
  });

  const selected = vehicles.find(v => v._id === selectedId);

  return (
    <div className="tracking-page">
      <div className="tracking-map-container">
        <MapContainer center={[15.83, 78.04]} zoom={13} className="tracking-map" zoomControl={true}>
          <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <FitBounds vehicles={filtered} />
          {dumpingYards.map((dy, i) => (
            <Marker key={`dy-${i}`} position={[dy.lat, dy.lng]} icon={dumpIcon}><Popup><strong>🏭 {dy.name}</strong><br/>Dumping Yard</Popup></Marker>
          ))}
          {filtered.map(v => (
            v.currentLocation?.lat && v.currentLocation?.lng && (
              <Marker key={v._id} position={[v.currentLocation.lat, v.currentLocation.lng]} icon={createVehicleIcon(v.vehicleType, v.status)} eventHandlers={{ click: () => setSelectedId(v._id) }}>
                <Popup className="vehicle-popup"><div className="popup-content"><h4>{v.vehicleNumber}</h4><p>👷 {v.driverName}</p><p>⚡ {formatSpeed(v.speed)} | ⛽ {formatFuel(v.fuelLevel)}</p><p>♻️ {formatWeight(v.currentLoadWeight || 0)} | 📍 {v.cleaningZone}</p><span className={`badge ${getStatusColor(v.status)}`}>{v.status}</span></div></Popup>
              </Marker>
            )
          ))}
          {selected?.assignedRoute?.waypoints && (<Polyline positions={selected.assignedRoute.waypoints} pathOptions={{ color: '#059669', weight: 3, opacity: 0.8, dashArray: '8,8' }} />)}
        </MapContainer>
        <div className="map-stats-overlay">
          <div className="map-stat"><span className="map-stat-val">{filtered.length}</span><span className="map-stat-label">Showing</span></div>
          <div className="map-stat"><span className="map-stat-val">{filtered.filter(v => v.status === 'active').length}</span><span className="map-stat-label">Active</span></div>
          <div className="map-stat"><span className="map-stat-val">{filtered.filter(v => v.status === 'idle').length}</span><span className="map-stat-label">Idle</span></div>
        </div>
      </div>
      <div className="tracking-sidebar">
        <div className="tracking-filters">
          <div className="search-bar"><span className="search-icon">🔍</span><input type="text" className="input" placeholder="Search vehicles..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
          <div className="filter-row">
            <select className="select" value={filters.status} onChange={(e) => setFilters({ status: e.target.value })}><option value="">All Status</option><option value="active">Active</option><option value="idle">Idle</option><option value="maintenance">Maintenance</option><option value="offline">Offline</option></select>
            <select className="select" value={filters.type} onChange={(e) => setFilters({ type: e.target.value })}><option value="">All Types</option><option value="garbage-truck">Garbage Truck</option><option value="mini-truck">Mini Truck</option><option value="auto-tipper">Auto Tipper</option><option value="compactor">Compactor</option><option value="road-sweeper">Road Sweeper</option><option value="water-tanker">Water Tanker</option></select>
          </div>
          <select className="select w-full" value={filters.zone} onChange={(e) => setFilters({ zone: e.target.value })}><option value="">All Zones</option>{[...Array(10)].map((_, i) => <option key={i} value={`Zone ${i+1}`}>Zone {i+1}</option>)}</select>
        </div>
        <div className="vehicle-list">
          {filtered.map(v => (
            <div key={v._id} className={`vehicle-list-item ${selectedId === v._id ? 'selected' : ''}`} onClick={() => setSelectedId(v._id)}>
              <div className="vli-header">
                <span className="vli-icon">{getVehicleIcon(v.vehicleType)}</span>
                <div className="vli-info"><span className="vli-number">{v.vehicleNumber}</span><span className="vli-driver">{v.driverName}</span></div>
                <span className={`badge ${getStatusColor(v.status)} badge-pulse`}><span className="badge-dot"></span> {v.status}</span>
              </div>
              <div className="vli-stats">
                <span>⚡ {v.speed} km/h</span><span>⛽ {v.fuelLevel}%</span><span>♻️ {formatWeight(v.currentLoadWeight || 0)}</span>
                <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); navigate(`/vehicle/${v._id}`); }}>Details →</button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (<div className="empty-state"><span className="empty-state-icon">🔍</span><span className="empty-state-text">No vehicles found</span></div>)}
        </div>
      </div>
    </div>
  );
}
