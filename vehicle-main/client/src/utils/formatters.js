export const formatDistance = (km) => {
  if (km >= 1000) return `${(km / 1000).toFixed(1)}K km`;
  return `${Math.round(km)} km`;
};
export const formatSpeed = (speed) => `${Math.round(speed)} km/h`;
export const formatFuel = (level) => `${Math.round(level)}%`;
export const formatWeight = (kg) => {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)}T`;
  return `${Math.round(kg)} kg`;
};
export const formatDuration = (minutes) => {
  if (minutes < 60) return `${minutes}m`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs}h ${mins}m`;
};
export const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};
export const formatDateTime = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};
export const formatTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};
export const getStatusColor = (status) => {
  const map = {
    active: 'badge-active', idle: 'badge-idle',
    maintenance: 'badge-maintenance', offline: 'badge-offline',
    returning: 'badge-returning',
    pending: 'badge-pending', 'in-progress': 'badge-in-progress',
    completed: 'badge-completed', missed: 'badge-missed',
    planned: 'badge-pending', 'on-leave': 'badge-idle',
    terminated: 'badge-offline'
  };
  return map[status] || 'badge-pending';
};
export const getVehicleIcon = (type) => {
  const map = { 'garbage-truck': '🚛', 'mini-truck': '🚐', 'auto-tipper': '🛻', 'compactor': '🚜', 'road-sweeper': '🧹', 'water-tanker': '🚿' };
  return map[type] || '🚛';
};
export const getWasteTypeIcon = (type) => {
  const map = { wet: '💧', dry: '📦', mixed: '♻️', hazardous: '☣️', construction: '🧱' };
  return map[type] || '♻️';
};
export const getWasteTypeBadge = (type) => {
  const map = { wet: 'badge-wet', dry: 'badge-dry', mixed: 'badge-mixed', hazardous: 'badge-hazardous', construction: 'badge-construction' };
  return map[type] || 'badge-pending';
};
export const getSeverityIcon = (severity) => {
  const map = { critical: '🔴', high: '🟠', medium: '🟡', low: '🔵' };
  return map[severity] || '⚪';
};
export const getZoneColor = (zone) => {
  const colors = ['#059669','#0d9488','#0ea5e9','#8b5cf6','#f59e0b','#ef4444','#ec4899','#f97316','#14b8a6','#6366f1'];
  const idx = parseInt(zone?.replace(/\D/g, '') || '1') - 1;
  return colors[idx % colors.length];
};
