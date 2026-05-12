import { useEffect, useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import api from '../services/api';
import useVehicleStore from '../store/useVehicleStore';
import { getWasteTypeIcon } from '../utils/formatters';
import './AnalyticsDashboardPage.css';

const COLORS = ['#059669','#10b981','#0d9488','#0ea5e9','#f59e0b','#ef4444','#8b5cf6','#14b8a6'];

export default function AnalyticsDashboardPage() {
  const { vehicles, fetchVehicles } = useVehicleStore();
  const [report, setReport] = useState(null);
  const [wasteStats, setWasteStats] = useState(null);
  const [period, setPeriod] = useState('weekly');

  useEffect(() => {
    fetchVehicles();
    api.get('/reports/performance').then(r => setReport(r.data)).catch(() => {});
    api.get('/waste/stats').then(r => setWasteStats(r.data)).catch(() => {});
  }, []);

  const wasteByType = wasteStats?.typeStats?.map(s => ({ name: s._id, count: s.count, weight: Math.round(s.totalWeight / 1000) })) || [];
  const wasteByZone = wasteStats?.zoneStats?.map(s => ({ name: s._id, weight: Math.round(s.totalWeight / 1000), count: s.count })) || [];
  const containerData = wasteStats?.containerStats?.map(s => ({ name: s._id, count: s.count })) || [];
  const statusData = wasteStats?.statusStats?.map(s => ({ name: s._id, value: s.count })) || [];

  const radarData = [
    { metric: 'Collection Rate', value: 85 }, { metric: 'Route Coverage', value: 78 },
    { metric: 'Fuel Efficiency', value: 72 }, { metric: 'On-Time Pickup', value: 90 },
    { metric: 'Load Optimization', value: 65 }, { metric: 'Zone Coverage', value: 82 },
  ];

  const tooltipStyle = { background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' };

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h2>Waste Collection Analytics</h2>
        <div className="tabs">
          <button className={`tab ${period==='daily'?'active':''}`} onClick={()=>setPeriod('daily')}>Daily</button>
          <button className={`tab ${period==='weekly'?'active':''}`} onClick={()=>setPeriod('weekly')}>Weekly</button>
          <button className={`tab ${period==='monthly'?'active':''}`} onClick={()=>setPeriod('monthly')}>Monthly</button>
        </div>
      </div>
      <div className="kpi-grid">
        <div className="kpi-card"><span className="kpi-icon">♻️</span><div className="kpi-data"><span className="kpi-value">{wasteStats?.totalCollected ? Math.round(wasteStats.totalCollected/1000) : 0}T</span><span className="kpi-label">Total Collected</span></div></div>
        <div className="kpi-card"><span className="kpi-icon">💧</span><div className="kpi-data"><span className="kpi-value">{wasteByType.find(w=>w.name==='wet')?.count||0}</span><span className="kpi-label">Wet Waste</span></div></div>
        <div className="kpi-card"><span className="kpi-icon">📦</span><div className="kpi-data"><span className="kpi-value">{wasteByType.find(w=>w.name==='dry')?.count||0}</span><span className="kpi-label">Dry Waste</span></div></div>
        <div className="kpi-card warn"><span className="kpi-icon">☣️</span><div className="kpi-data"><span className="kpi-value">{wasteByType.find(w=>w.name==='hazardous')?.count||0}</span><span className="kpi-label">Hazardous</span></div></div>
      </div>
      <div className="analytics-grid">
        <div className="card chart-card"><div className="card-header"><h3 className="card-title">Waste by Zone (Tonnes)</h3></div>
          <ResponsiveContainer width="100%" height={280}><BarChart data={wasteByZone}><CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" /><XAxis dataKey="name" tick={{fill:'var(--text-tertiary)',fontSize:10}} /><YAxis tick={{fill:'var(--text-tertiary)',fontSize:11}} /><Tooltip contentStyle={tooltipStyle} /><Bar dataKey="weight" name="Tonnes" radius={[6,6,0,0]}>{wasteByZone.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}</Bar></BarChart></ResponsiveContainer>
        </div>
        <div className="card chart-card"><div className="card-header"><h3 className="card-title">Waste Type Distribution</h3></div>
          <ResponsiveContainer width="100%" height={280}><PieChart><Pie data={wasteByType} cx="50%" cy="50%" outerRadius={100} dataKey="count" label={({name})=>`${getWasteTypeIcon(name)} ${name}`} labelLine={false}>{wasteByType.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}</Pie><Tooltip contentStyle={tooltipStyle} /></PieChart></ResponsiveContainer>
        </div>
        <div className="card chart-card"><div className="card-header"><h3 className="card-title">Performance Score</h3></div>
          <ResponsiveContainer width="100%" height={280}><RadarChart data={radarData}><PolarGrid stroke="var(--border-color)" /><PolarAngleAxis dataKey="metric" tick={{fill:'var(--text-tertiary)',fontSize:10}} /><PolarRadiusAxis angle={30} domain={[0,100]} tick={{fill:'var(--text-tertiary)',fontSize:9}} /><Radar name="Score" dataKey="value" stroke="#059669" fill="#059669" fillOpacity={0.2} strokeWidth={2} /></RadarChart></ResponsiveContainer>
        </div>
        <div className="card chart-card"><div className="card-header"><h3 className="card-title">Collection Status</h3></div>
          <ResponsiveContainer width="100%" height={280}><PieChart><Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value" label>{statusData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}</Pie><Tooltip contentStyle={tooltipStyle} /><Legend formatter={(v)=><span style={{color:'var(--text-secondary)',fontSize:'0.75rem'}}>{v}</span>} /></PieChart></ResponsiveContainer>
        </div>
        <div className="card chart-card span-2"><div className="card-header"><h3 className="card-title">Container Utilization</h3></div>
          <ResponsiveContainer width="100%" height={280}><BarChart data={containerData} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" /><XAxis type="number" tick={{fill:'var(--text-tertiary)',fontSize:11}} /><YAxis dataKey="name" type="category" tick={{fill:'var(--text-tertiary)',fontSize:10}} width={100} /><Tooltip contentStyle={tooltipStyle} /><Bar dataKey="count" name="Count" radius={[0,6,6,0]}>{containerData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}</Bar></BarChart></ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
