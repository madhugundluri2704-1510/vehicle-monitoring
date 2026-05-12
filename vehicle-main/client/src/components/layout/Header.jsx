import { useState } from 'react';
import useAlertStore from '../../store/useAlertStore';
import useThemeStore from '../../store/useThemeStore';
import { formatTimeAgo, getSeverityIcon } from '../../utils/formatters';
import './Header.css';

export default function Header({ title, onMobileMenuToggle }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const { alerts, unacknowledgedCount, acknowledgeAlert } = useAlertStore();
  const { theme, toggleTheme } = useThemeStore();
  const recentAlerts = alerts.filter(a => !a.acknowledged).slice(0, 8);

  return (
    <header className="header">
      <div className="header-left">
        <button className="mobile-menu-btn" onClick={onMobileMenuToggle}>☰</button>
        <div className="header-title-wrap">
          <h1 className="header-title">{title}</h1>
          <span className="header-subtitle">Kurnool Municipal Corporation</span>
        </div>
      </div>
      <div className="header-right">
        <div className="header-search">
          <span className="search-icon-h">🔍</span>
          <input type="text" placeholder="Search vehicles, zones..." className="header-search-input" />
        </div>
        <button className="header-theme-btn" onClick={toggleTheme} title="Toggle theme">{theme === 'dark' ? '☀️' : '🌙'}</button>
        <div className="notification-wrapper">
          <button className="notification-btn" onClick={() => setShowNotifications(!showNotifications)}>
            🔔
            {unacknowledgedCount > 0 && (<span className="notification-badge">{unacknowledgedCount > 99 ? '99+' : unacknowledgedCount}</span>)}
          </button>
          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <span className="notification-title">Alerts</span>
                <span className="notification-count">{unacknowledgedCount} new</span>
              </div>
              <div className="notification-list">
                {recentAlerts.length === 0 ? (
                  <div className="notification-empty">No new alerts</div>
                ) : (
                  recentAlerts.map((alert) => (
                    <div key={alert._id} className="notification-item" onClick={() => acknowledgeAlert(alert._id)}>
                      <span className="notification-icon">{getSeverityIcon(alert.severity)}</span>
                      <div className="notification-content">
                        <p className="notification-message">{alert.message}</p>
                        <span className="notification-time">{formatTimeAgo(alert.createdAt)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
