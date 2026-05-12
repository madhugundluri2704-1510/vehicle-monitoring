import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '../services/api';
import useVehicleStore from '../store/useVehicleStore';
import { formatDate, getStatusColor, getVehicleIcon, formatWeight } from '../utils/formatters';
import './ReportsPage.css';

const COLORS = ['#059669','#10b981','#0d9488','#0ea5e9','#f59e0b','#ef4444'];

export default function ReportsPage() {
  const { vehicles, fetchVehicles } = useVehicleStore();
  const [report, setReport] = useState(null);
  const [reportType, setReportType] = useState('fleet');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
    api.get('/reports/performance').then(r => { setReport(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const alertData = report?.alertsByType?.map(a => ({ name: a._id, count: a.count })) || [];
  const wasteByZone = report?.wasteByZone?.map(w => ({ name: w._id, weight: Math.round(w.totalWeight/1000) })) || [];

  const exportCSV = () => {
    const headers = ['Vehicle','Driver','Type','Zone','Status','Speed','Fuel','Load (kg)','Mileage'];
    const rows = vehicles.map(v => [v.vehicleNumber,v.driverName,v.vehicleType,v.cleaningZone,v.status,v.speed,v.fuelLevel,v.currentLoadWeight||0,v.mileage]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `kmc_report_${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  const tooltipStyle = { background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' };

  return (
    <div className="reports-page">
      <div className="reports-header">
        <div><h2>Reports & Export</h2><p className="reports-sub">Generate and download municipal cleaning reports</p></div>
        <div className="export-btns"><button className="btn btn-secondary btn-sm" onClick={exportCSV}>📄 Export CSV</button></div>
      </div>
      <div className="tabs" style={{alignSelf:'flex-start'}}>
        <button className={`tab ${reportType==='fleet'?'active':''}`} onClick={()=>setReportType('fleet')}>Fleet Summary</button>
        <button className={`tab ${reportType==='waste'?'active':''}`} onClick={()=>setReportType('waste')}>Waste Collection</button>
        <button className={`tab ${reportType==='alerts'?'active':''}`} onClick={()=>setReportType('alerts')}>Alerts</button>
        <button className={`tab ${reportType==='drivers'?'active':''}`} onClick={()=>setReportType('drivers')}>Drivers</button>
      </div>

      {reportType === 'fleet' && (<>
        <div className="report-stats-row">
          <div className="report-stat-card"><span className="rs-icon">🚛</span><span className="rs-value">{vehicles.length}</span><span className="rs-label">Total Vehicles</span></div>
          <div className="report-stat-card"><span className="rs-icon">♻️</span><span className="rs-value">{formatWeight(vehicles.reduce((s,v)=>s+(v.currentLoadWeight||0),0))}</span><span className="rs-label">Current Load</span></div>
          <div className="report-stat-card"><span className="rs-icon">⛽</span><span className="rs-value">{vehicles.length?(vehicles.reduce((s,v)=>s+(v.fuelLevel||0),0)/vehicles.length).toFixed(0):0}%</span><span className="rs-label">Avg Fuel</span></div>
          <div className="report-stat-card"><span className="rs-icon">⚡</span><span className="rs-value">{vehicles.filter(v=>v.status==='active').length?(vehicles.filter(v=>v.status==='active').reduce((s,v)=>s+v.speed,0)/vehicles.filter(v=>v.status==='active').length).toFixed(0):0}</span><span className="rs-label">Avg Speed</span></div>
        </div>
        <div className="card"><div className="card-header"><h3 className="card-title">All Vehicles</h3></div>
          <div className="data-table-wrapper"><table className="data-table"><thead><tr><th>#</th><th>Vehicle</th><th>Driver</th><th>Type</th><th>Zone</th><th>Status</th><th>Speed</th><th>Fuel</th><th>Load</th></tr></thead><tbody>
            {vehicles.map((v,i)=>(<tr key={v._id}><td>{i+1}</td><td><strong>{v.vehicleNumber}</strong></td><td>{v.driverName}</td><td>{getVehicleIcon(v.vehicleType)} {v.vehicleType}</td><td>{v.cleaningZone}</td><td><span className={`badge ${getStatusColor(v.status)}`}>{v.status}</span></td><td>{v.speed} km/h</td><td>{v.fuelLevel}%</td><td>{formatWeight(v.currentLoadWeight||0)}</td></tr>))}
          </tbody></table></div>
        </div>
      </>)}

      {reportType === 'waste' && (
        <div className="reports-grid-2">
          <div className="card chart-card"><div className="card-header"><h3 className="card-title">Waste by Zone (Tonnes)</h3></div>
            <ResponsiveContainer width="100%" height={320}><BarChart data={wasteByZone}><CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" /><XAxis dataKey="name" tick={{fill:'var(--text-tertiary)',fontSize:10}} /><YAxis tick={{fill:'var(--text-tertiary)',fontSize:11}} /><Tooltip contentStyle={tooltipStyle} /><Bar dataKey="weight" name="Tonnes" radius={[6,6,0,0]}>{wasteByZone.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}</Bar></BarChart></ResponsiveContainer>
          </div>
          <div className="card"><div className="card-header"><h3 className="card-title">Zone Summary</h3></div>
            <div className="alert-summary-list">{wasteByZone.map((w,i)=>(<div key={w.name} className="alert-summary-item"><span className="as-color" style={{background:COLORS[i%COLORS.length]}}></span><span className="as-name">{w.name}</span><span className="as-count">{w.weight}T</span></div>))}</div>
          </div>
        </div>
      )}

      {reportType === 'alerts' && (
        <div className="reports-grid-2">
          <div className="card chart-card"><div className="card-header"><h3 className="card-title">Alerts by Type</h3></div>
            <ResponsiveContainer width="100%" height={320}><BarChart data={alertData}><CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" /><XAxis dataKey="name" tick={{fill:'var(--text-tertiary)',fontSize:10}} angle={-25} textAnchor="end" height={60} /><YAxis tick={{fill:'var(--text-tertiary)',fontSize:11}} /><Tooltip contentStyle={tooltipStyle} /><Bar dataKey="count" name="Count" radius={[6,6,0,0]}>{alertData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}</Bar></BarChart></ResponsiveContainer>
          </div>
          <div className="card"><div className="card-header"><h3 className="card-title">Alert Summary</h3></div>
            <div className="alert-summary-list">{alertData.map((a,i)=>(<div key={a.name} className="alert-summary-item"><span className="as-color" style={{background:COLORS[i%COLORS.length]}}></span><span className="as-name">{a.name}</span><span className="as-count">{a.count}</span></div>))}</div>
          </div>
        </div>
      )}

      {reportType === 'drivers' && (
        <div className="card"><div className="card-header"><h3 className="card-title">Top Drivers by Performance</h3></div>
          <div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Rank</th><th>Driver</th><th>Score</th><th>Trips</th><th>Waste Collected</th></tr></thead><tbody>
            {report?.driverPerformance?.map((d,i)=>(<tr key={d._id||i}><td><span className="rank-badge">#{i+1}</span></td><td><strong>{d.driverName}</strong></td><td>{d.performanceScore}%</td><td>{d.totalTrips}</td><td>{formatWeight(d.totalWasteCollected)}</td></tr>))}
          </tbody></table></div>
        </div>
      )}
    </div>
  );
}
