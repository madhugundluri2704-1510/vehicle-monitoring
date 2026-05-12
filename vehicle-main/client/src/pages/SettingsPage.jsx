import { useState } from 'react';
import useThemeStore from '../store/useThemeStore';
import useAuthStore from '../store/useAuthStore';
import './SettingsPage.css';

export default function SettingsPage() {
  const { theme, toggleTheme } = useThemeStore();
  const { user } = useAuthStore();
  const [settings, setSettings] = useState({
    speedLimit: 40, overloadAlert: 90, fuelAlert: 15, missedAreaAlert: true,
    notifications: { overspeed: true, overload: true, fuelLow: true, routeDeviation: true, missedArea: true, vehicleOffline: true },
    language: 'en',
  });
  const [saved, setSaved] = useState(false);
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="settings-page">
      <h2>Settings</h2>
      <div className="settings-grid">
        <div className="card settings-card">
          <h3 className="card-title">👤 Profile</h3>
          <div className="settings-section">
            <div className="input-group"><label className="input-label">Name</label><input className="input" type="text" value={user?.username||'KMC Admin'} readOnly /></div>
            <div className="input-group"><label className="input-label">Email</label><input className="input" type="email" value={user?.email||'admin@kmc.gov.in'} readOnly /></div>
            <div className="input-group"><label className="input-label">Role</label><input className="input" type="text" value={user?.role||'admin'} readOnly style={{textTransform:'capitalize'}} /></div>
            <div className="input-group"><label className="input-label">Department</label><input className="input" type="text" value="Sanitation - KMC" readOnly /></div>
          </div>
        </div>
        <div className="card settings-card">
          <h3 className="card-title">🎨 Appearance</h3>
          <div className="settings-section">
            <div className="setting-row"><div><span className="setting-name">Dark Mode</span><span className="setting-desc">Toggle between dark and light themes</span></div><button className={`toggle-switch ${theme==='dark'?'active':''}`} onClick={toggleTheme}><span className="toggle-knob"></span></button></div>
            <div className="input-group"><label className="input-label">Language</label>
              <select className="select" value={settings.language} onChange={(e)=>setSettings({...settings,language:e.target.value})}>
                <option value="en">English</option><option value="te">తెలుగు (Telugu)</option><option value="hi">हिंदी (Hindi)</option><option value="ur">اردو (Urdu)</option>
              </select>
            </div>
          </div>
        </div>
        <div className="card settings-card">
          <h3 className="card-title">⚡ Alert Thresholds</h3>
          <div className="settings-section">
            <div className="input-group"><label className="input-label">Speed Limit (km/h)</label><input className="input" type="number" value={settings.speedLimit} onChange={(e)=>setSettings({...settings,speedLimit:+e.target.value})} /></div>
            <div className="input-group"><label className="input-label">Overload Alert (%)</label><input className="input" type="number" value={settings.overloadAlert} onChange={(e)=>setSettings({...settings,overloadAlert:+e.target.value})} /></div>
            <div className="input-group"><label className="input-label">Low Fuel Alert (%)</label><input className="input" type="number" value={settings.fuelAlert} onChange={(e)=>setSettings({...settings,fuelAlert:+e.target.value})} /></div>
          </div>
        </div>
        <div className="card settings-card">
          <h3 className="card-title">🔔 Notifications</h3>
          <div className="settings-section">
            {Object.entries(settings.notifications).map(([key,val])=>(
              <div key={key} className="setting-row"><div><span className="setting-name">{key.replace(/([A-Z])/g,' $1').replace(/^./,s=>s.toUpperCase())}</span><span className="setting-desc">Alert for {key.replace(/([A-Z])/g,' $1').toLowerCase()}</span></div>
              <button className={`toggle-switch ${val?'active':''}`} onClick={()=>setSettings({...settings,notifications:{...settings.notifications,[key]:!val}})}><span className="toggle-knob"></span></button></div>
            ))}
          </div>
        </div>
      </div>
      <div className="settings-actions">
        <button className="btn btn-primary" onClick={handleSave}>{saved ? '✅ Saved!' : 'Save Settings'}</button>
        <button className="btn btn-secondary">Reset to Defaults</button>
      </div>
    </div>
  );
}
