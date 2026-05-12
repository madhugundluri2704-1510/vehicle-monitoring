import { useEffect, useState } from 'react';
import useVehicleStore from '../store/useVehicleStore';
import { getStatusColor, getVehicleIcon, formatWeight, formatDate } from '../utils/formatters';
import './VehicleManagementPage.css';

const vehicleTypes = ['garbage-truck','mini-truck','auto-tipper','compactor','road-sweeper','water-tanker'];
const containerTypes = ['240L-bin','660L-bin','dumpster','open-container','compactor-bin'];
const wasteTypes = ['wet','dry','mixed','hazardous','construction'];
const zones = Array.from({length:10},(_,i)=>`Zone ${i+1}`);

const emptyForm = { vehicleNumber:'', vehicleType:'garbage-truck', driverName:'', driverPhone:'', cleaningZone:'Zone 1', wardNumber:1, loadCapacity:5000, containerType:'dumpster', wasteType:'mixed', status:'active', registrationYear:2023 };

export default function VehicleManagementPage() {
  const { vehicles, fetchVehicles, createVehicle, updateVehicle, deleteVehicle } = useVehicleStore();
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterZone, setFilterZone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchVehicles(); }, []);

  const filtered = vehicles.filter(v => {
    const ms = !search || v.vehicleNumber?.toLowerCase().includes(search.toLowerCase()) || v.driverName?.toLowerCase().includes(search.toLowerCase());
    const fs = !filterStatus || v.status === filterStatus;
    const fz = !filterZone || v.cleaningZone === filterZone;
    return ms && fs && fz;
  });

  const openAdd = () => { setEditId(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (v) => { setEditId(v._id); setForm({ vehicleNumber: v.vehicleNumber, vehicleType: v.vehicleType, driverName: v.driverName, driverPhone: v.driverPhone||'', cleaningZone: v.cleaningZone||'Zone 1', wardNumber: v.wardNumber||1, loadCapacity: v.loadCapacity||5000, containerType: v.containerType||'dumpster', wasteType: v.wasteType||'mixed', status: v.status, registrationYear: v.registrationYear||2023 }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editId) { await updateVehicle(editId, form); }
      else { await createVehicle(form); }
      setShowModal(false); fetchVehicles();
    } catch (err) { alert(err.message); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this vehicle?')) return;
    try { await deleteVehicle(id); } catch (err) { alert(err.message); }
  };

  return (
    <div className="mgmt-page">
      <div className="mgmt-header">
        <div><h2>Vehicle Management</h2><p className="mgmt-sub">Manage municipality cleaning fleet</p></div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Vehicle</button>
      </div>

      <div className="mgmt-filters">
        <div className="search-bar"><span className="search-icon">🔍</span><input type="text" className="input" placeholder="Search vehicles or drivers..." value={search} onChange={(e)=>setSearch(e.target.value)} /></div>
        <select className="select" value={filterStatus} onChange={(e)=>setFilterStatus(e.target.value)}><option value="">All Status</option><option value="active">Active</option><option value="idle">Idle</option><option value="maintenance">Maintenance</option><option value="offline">Offline</option></select>
        <select className="select" value={filterZone} onChange={(e)=>setFilterZone(e.target.value)}><option value="">All Zones</option>{zones.map(z=><option key={z} value={z}>{z}</option>)}</select>
      </div>

      <div className="mgmt-stats">
        <div className="mgmt-stat"><span className="ms-val">{vehicles.length}</span><span className="ms-label">Total</span></div>
        <div className="mgmt-stat"><span className="ms-val" style={{color:'var(--success)'}}>{vehicles.filter(v=>v.status==='active').length}</span><span className="ms-label">Active</span></div>
        <div className="mgmt-stat"><span className="ms-val" style={{color:'var(--warning)'}}>{vehicles.filter(v=>v.status==='idle').length}</span><span className="ms-label">Idle</span></div>
        <div className="mgmt-stat"><span className="ms-val" style={{color:'var(--info)'}}>{vehicles.filter(v=>v.status==='maintenance').length}</span><span className="ms-label">Maintenance</span></div>
        <div className="mgmt-stat"><span className="ms-val" style={{color:'var(--danger)'}}>{vehicles.filter(v=>v.status==='offline').length}</span><span className="ms-label">Offline</span></div>
      </div>

      <div className="card">
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead><tr><th>#</th><th>Vehicle</th><th>Driver</th><th>Type</th><th>Zone</th><th>Status</th><th>Load</th><th>Fuel</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map((v,i)=>(
                <tr key={v._id}>
                  <td>{i+1}</td>
                  <td><strong>{v.vehicleNumber}</strong></td>
                  <td>{v.driverName}</td>
                  <td>{getVehicleIcon(v.vehicleType)} {v.vehicleType}</td>
                  <td><span className="badge badge-in-progress">{v.cleaningZone}</span></td>
                  <td><span className={`badge ${getStatusColor(v.status)}`}>{v.status}</span></td>
                  <td>{formatWeight(v.currentLoadWeight||0)} / {formatWeight(v.loadCapacity)}</td>
                  <td>{v.fuelLevel}%</td>
                  <td>
                    <div className="action-btns">
                      <button className="btn btn-ghost btn-sm" onClick={()=>openEdit(v)}>✏️</button>
                      <button className="btn btn-ghost btn-sm" onClick={()=>handleDelete(v._id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length===0 && <div className="empty-state"><span className="empty-state-icon">🚛</span><span className="empty-state-text">No vehicles found</span></div>}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal-content" onClick={(e)=>e.stopPropagation()}>
            <div className="modal-header"><h3 className="modal-title">{editId ? 'Edit Vehicle' : 'Add Vehicle'}</h3><button className="modal-close" onClick={()=>setShowModal(false)}>✕</button></div>
            <form onSubmit={handleSave} className="modal-form">
              <div className="form-grid">
                <div className="input-group"><label className="input-label">Vehicle Number *</label><input className="input" value={form.vehicleNumber} onChange={(e)=>setForm({...form,vehicleNumber:e.target.value})} required placeholder="AP24XX0000" /></div>
                <div className="input-group"><label className="input-label">Vehicle Type</label><select className="select" value={form.vehicleType} onChange={(e)=>setForm({...form,vehicleType:e.target.value})}>{vehicleTypes.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
                <div className="input-group"><label className="input-label">Driver Name *</label><input className="input" value={form.driverName} onChange={(e)=>setForm({...form,driverName:e.target.value})} required /></div>
                <div className="input-group"><label className="input-label">Driver Phone</label><input className="input" value={form.driverPhone} onChange={(e)=>setForm({...form,driverPhone:e.target.value})} /></div>
                <div className="input-group"><label className="input-label">Cleaning Zone</label><select className="select" value={form.cleaningZone} onChange={(e)=>setForm({...form,cleaningZone:e.target.value})}>{zones.map(z=><option key={z} value={z}>{z}</option>)}</select></div>
                <div className="input-group"><label className="input-label">Ward Number</label><input className="input" type="number" min="1" max="50" value={form.wardNumber} onChange={(e)=>setForm({...form,wardNumber:+e.target.value})} /></div>
                <div className="input-group"><label className="input-label">Load Capacity (kg)</label><input className="input" type="number" value={form.loadCapacity} onChange={(e)=>setForm({...form,loadCapacity:+e.target.value})} /></div>
                <div className="input-group"><label className="input-label">Container Type</label><select className="select" value={form.containerType} onChange={(e)=>setForm({...form,containerType:e.target.value})}>{containerTypes.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
                <div className="input-group"><label className="input-label">Waste Type</label><select className="select" value={form.wasteType} onChange={(e)=>setForm({...form,wasteType:e.target.value})}>{wasteTypes.map(w=><option key={w} value={w}>{w}</option>)}</select></div>
                <div className="input-group"><label className="input-label">Status</label><select className="select" value={form.status} onChange={(e)=>setForm({...form,status:e.target.value})}><option value="active">Active</option><option value="idle">Idle</option><option value="maintenance">Maintenance</option><option value="offline">Offline</option></select></div>
              </div>
              <div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : (editId ? 'Update' : 'Add Vehicle')}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
