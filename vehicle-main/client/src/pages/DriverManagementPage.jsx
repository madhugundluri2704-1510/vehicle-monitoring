import { useEffect, useState } from 'react';
import useDriverStore from '../store/useDriverStore';
import { getStatusColor, formatWeight, formatDate } from '../utils/formatters';
import './DriverManagementPage.css';

const emptyForm = { driverName:'', phoneNumber:'', aadharLast4:'', shiftTime:'morning', status:'active', address:'Kurnool', emergencyContact:'', performanceScore:75 };

export default function DriverManagementPage() {
  const { drivers, fetchDrivers, createDriver, updateDriver, deleteDriver, stats, fetchStats } = useDriverStore();
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterShift, setFilterShift] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchDrivers(); fetchStats(); }, []);

  const filtered = drivers.filter(d => {
    const ms = !search || d.driverName?.toLowerCase().includes(search.toLowerCase()) || d.phoneNumber?.includes(search);
    const fs = !filterStatus || d.status === filterStatus;
    const fsh = !filterShift || d.shiftTime === filterShift;
    return ms && fs && fsh;
  });

  const openAdd = () => { setEditId(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (d) => { setEditId(d._id); setForm({ driverName:d.driverName, phoneNumber:d.phoneNumber||'', aadharLast4:d.aadharLast4||'', shiftTime:d.shiftTime||'morning', status:d.status, address:d.address||'', emergencyContact:d.emergencyContact||'', performanceScore:d.performanceScore||75 }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editId) await updateDriver(editId, form);
      else await createDriver(form);
      setShowModal(false); fetchDrivers(); fetchStats();
    } catch (err) { alert(err.message); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this driver?')) return;
    try { await deleteDriver(id); fetchStats(); } catch (err) { alert(err.message); }
  };

  const getShiftBadge = (shift) => {
    const map = { morning: 'badge-active', afternoon: 'badge-idle', night: 'badge-maintenance' };
    return map[shift] || 'badge-pending';
  };

  return (
    <div className="mgmt-page">
      <div className="mgmt-header">
        <div><h2>Driver Management</h2><p className="mgmt-sub">Manage sanitation vehicle drivers</p></div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Driver</button>
      </div>

      <div className="mgmt-filters">
        <div className="search-bar"><span className="search-icon">🔍</span><input type="text" className="input" placeholder="Search drivers..." value={search} onChange={(e)=>setSearch(e.target.value)} /></div>
        <select className="select" value={filterStatus} onChange={(e)=>setFilterStatus(e.target.value)}><option value="">All Status</option><option value="active">Active</option><option value="on-leave">On Leave</option><option value="terminated">Terminated</option></select>
        <select className="select" value={filterShift} onChange={(e)=>setFilterShift(e.target.value)}><option value="">All Shifts</option><option value="morning">Morning</option><option value="afternoon">Afternoon</option><option value="night">Night</option></select>
      </div>

      <div className="mgmt-stats">
        <div className="mgmt-stat"><span className="ms-val">{stats?.total||drivers.length}</span><span className="ms-label">Total</span></div>
        <div className="mgmt-stat"><span className="ms-val" style={{color:'var(--success)'}}>{stats?.active||0}</span><span className="ms-label">Active</span></div>
        <div className="mgmt-stat"><span className="ms-val" style={{color:'var(--warning)'}}>{stats?.onLeave||0}</span><span className="ms-label">On Leave</span></div>
        <div className="mgmt-stat"><span className="ms-val" style={{color:'var(--accent-primary)'}}>{stats?.avgPerformance ? Math.round(stats.avgPerformance) : 0}%</span><span className="ms-label">Avg Score</span></div>
      </div>

      <div className="card">
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead><tr><th>#</th><th>Name</th><th>Phone</th><th>Shift</th><th>Vehicle</th><th>Status</th><th>Score</th><th>Trips</th><th>Waste</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map((d,i)=>(
                <tr key={d._id}>
                  <td>{i+1}</td>
                  <td><strong>{d.driverName}</strong></td>
                  <td style={{fontSize:'0.82rem'}}>{d.phoneNumber}</td>
                  <td><span className={`badge ${getShiftBadge(d.shiftTime)}`}>{d.shiftTime}</span></td>
                  <td style={{fontSize:'0.82rem'}}>{d.assignedVehicle?.vehicleNumber || '-'}</td>
                  <td><span className={`badge ${getStatusColor(d.status)}`}>{d.status}</span></td>
                  <td>
                    <div className="score-cell">
                      <div className="progress-bar" style={{width:60}}><div className={`progress-fill ${d.performanceScore>70?'green':d.performanceScore>40?'yellow':'red'}`} style={{width:`${d.performanceScore}%`}}></div></div>
                      <span>{d.performanceScore}%</span>
                    </div>
                  </td>
                  <td>{d.totalTrips||0}</td>
                  <td>{formatWeight(d.totalWasteCollected||0)}</td>
                  <td>
                    <div className="action-btns">
                      <button className="btn btn-ghost btn-sm" onClick={()=>openEdit(d)}>✏️</button>
                      <button className="btn btn-ghost btn-sm" onClick={()=>handleDelete(d._id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length===0 && <div className="empty-state"><span className="empty-state-icon">👷</span><span className="empty-state-text">No drivers found</span></div>}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal-content" onClick={(e)=>e.stopPropagation()}>
            <div className="modal-header"><h3 className="modal-title">{editId ? 'Edit Driver' : 'Add Driver'}</h3><button className="modal-close" onClick={()=>setShowModal(false)}>✕</button></div>
            <form onSubmit={handleSave} className="modal-form">
              <div className="form-grid">
                <div className="input-group"><label className="input-label">Driver Name *</label><input className="input" value={form.driverName} onChange={(e)=>setForm({...form,driverName:e.target.value})} required /></div>
                <div className="input-group"><label className="input-label">Phone Number *</label><input className="input" value={form.phoneNumber} onChange={(e)=>setForm({...form,phoneNumber:e.target.value})} required /></div>
                <div className="input-group"><label className="input-label">Aadhar Last 4</label><input className="input" value={form.aadharLast4} onChange={(e)=>setForm({...form,aadharLast4:e.target.value})} maxLength={4} /></div>
                <div className="input-group"><label className="input-label">Shift</label><select className="select" value={form.shiftTime} onChange={(e)=>setForm({...form,shiftTime:e.target.value})}><option value="morning">Morning</option><option value="afternoon">Afternoon</option><option value="night">Night</option></select></div>
                <div className="input-group"><label className="input-label">Status</label><select className="select" value={form.status} onChange={(e)=>setForm({...form,status:e.target.value})}><option value="active">Active</option><option value="on-leave">On Leave</option><option value="terminated">Terminated</option></select></div>
                <div className="input-group"><label className="input-label">Performance Score</label><input className="input" type="number" min="0" max="100" value={form.performanceScore} onChange={(e)=>setForm({...form,performanceScore:+e.target.value})} /></div>
                <div className="input-group" style={{gridColumn:'1/-1'}}><label className="input-label">Address</label><input className="input" value={form.address} onChange={(e)=>setForm({...form,address:e.target.value})} /></div>
                <div className="input-group"><label className="input-label">Emergency Contact</label><input className="input" value={form.emergencyContact} onChange={(e)=>setForm({...form,emergencyContact:e.target.value})} /></div>
              </div>
              <div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : (editId ? 'Update' : 'Add Driver')}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
