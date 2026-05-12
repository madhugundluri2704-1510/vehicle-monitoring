const Vehicle = require('../models/Vehicle');
const Alert = require('../models/Alert');
const Tracking = require('../models/Tracking');

const cleaningZones = ['Zone 1','Zone 2','Zone 3','Zone 4','Zone 5','Zone 6','Zone 7','Zone 8','Zone 9','Zone 10'];
let simulationInterval = null;

const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);
    socket.on('join:dashboard', () => { socket.join('dashboard'); });
    socket.on('track:vehicle', (vid) => { socket.join(`vehicle:${vid}`); });
    socket.on('untrack:vehicle', (vid) => { socket.leave(`vehicle:${vid}`); });
    socket.on('disconnect', () => { console.log(`❌ Disconnected: ${socket.id}`); });
  });
  if (!simulationInterval) startSimulation(io);
};

const startSimulation = (io) => {
  console.log('🚛 Starting Kurnool cleaning vehicle simulation...');
  simulationInterval = setInterval(async () => {
    try {
      const vehicles = await Vehicle.find({ status: 'active' });
      for (const vehicle of vehicles) {
        const speed = 10 + Math.random() * 25;
        const heading = vehicle.heading + (Math.random() - 0.5) * 30;
        const dist = (speed / 3600) * 3;
        const latC = (dist / 111) * Math.cos(heading * Math.PI / 180) * (Math.random() > 0.5 ? 1 : -1) * 0.008;
        const lngC = (dist / 111) * Math.sin(heading * Math.PI / 180) * (Math.random() > 0.5 ? 1 : -1) * 0.008;
        const newLat = Math.max(15.78, Math.min(15.86, vehicle.currentLocation.lat + latC));
        const newLng = Math.max(77.99, Math.min(78.09, vehicle.currentLocation.lng + lngC));
        const fuelDrop = (speed / 1000) * 0.04;
        const newFuel = Math.max(0, vehicle.fuelLevel - fuelDrop);
        const wastePickup = Math.random() > 0.7 ? Math.floor(Math.random() * 50) : 0;
        const newLoad = Math.min(vehicle.loadCapacity, vehicle.currentLoadWeight + wastePickup);

        await Vehicle.findByIdAndUpdate(vehicle._id, {
          currentLocation: { lat: newLat, lng: newLng }, speed: Math.round(speed),
          fuelLevel: Math.round(newFuel * 10) / 10, heading: heading % 360,
          mileage: vehicle.mileage + dist, currentLoadWeight: newLoad
        });
        await Tracking.create({
          vehicleId: vehicle._id, latitude: newLat, longitude: newLng,
          speed: Math.round(speed), heading: heading % 360, fuelLevel: newFuel,
          wasteWeight: newLoad, cleaningZone: vehicle.cleaningZone,
          eventType: wastePickup > 0 ? 'collection' : 'position'
        });

        // Alerts
        if (speed > 35) {
          const ex = await Alert.findOne({ vehicleId: vehicle._id, type: 'overspeed', acknowledged: false, createdAt: { $gte: new Date(Date.now() - 60000) } });
          if (!ex) { const a = await Alert.create({ vehicleId: vehicle._id, type: 'overspeed', severity: speed > 45 ? 'critical' : 'high', message: `${vehicle.vehicleNumber} speeding at ${Math.round(speed)} km/h in ${vehicle.cleaningZone}`, location: { lat: newLat, lng: newLng }, cleaningZone: vehicle.cleaningZone }); io.to('dashboard').emit('alert:new', a); }
        }
        if (newFuel < 15) {
          const ex = await Alert.findOne({ vehicleId: vehicle._id, type: 'fuel-low', acknowledged: false, createdAt: { $gte: new Date(Date.now() - 300000) } });
          if (!ex) { const a = await Alert.create({ vehicleId: vehicle._id, type: 'fuel-low', severity: newFuel < 5 ? 'critical' : 'medium', message: `${vehicle.vehicleNumber} fuel low at ${Math.round(newFuel)}%`, location: { lat: newLat, lng: newLng }, cleaningZone: vehicle.cleaningZone }); io.to('dashboard').emit('alert:new', a); }
        }
        if (newLoad > vehicle.loadCapacity * 0.9) {
          const ex = await Alert.findOne({ vehicleId: vehicle._id, type: 'overload', acknowledged: false, createdAt: { $gte: new Date(Date.now() - 300000) } });
          if (!ex) { const a = await Alert.create({ vehicleId: vehicle._id, type: 'overload', severity: newLoad >= vehicle.loadCapacity ? 'critical' : 'high', message: `${vehicle.vehicleNumber} load ${newLoad}kg / ${vehicle.loadCapacity}kg`, location: { lat: newLat, lng: newLng }, cleaningZone: vehicle.cleaningZone }); io.to('dashboard').emit('alert:new', a); }
        }

        io.to('dashboard').emit('vehicle:update', {
          _id: vehicle._id, vehicleNumber: vehicle.vehicleNumber,
          currentLocation: { lat: newLat, lng: newLng }, speed: Math.round(speed),
          fuelLevel: Math.round(newFuel * 10) / 10, heading: heading % 360,
          status: vehicle.status, currentLoadWeight: newLoad,
          cleaningZone: vehicle.cleaningZone, wasteType: vehicle.wasteType
        });
        io.to(`vehicle:${vehicle._id}`).emit('tracking:live', {
          latitude: newLat, longitude: newLng, speed: Math.round(speed),
          fuelLevel: newFuel, wasteWeight: newLoad, timestamp: new Date()
        });
      }

      const totalV = await Vehicle.countDocuments();
      const activeV = await Vehicle.countDocuments({ status: 'active' });
      const unack = await Alert.countDocuments({ acknowledged: false });
      const wl = await Vehicle.aggregate([{ $match: { status: 'active' } }, { $group: { _id: null, total: { $sum: '$currentLoadWeight' } } }]);
      io.to('dashboard').emit('dashboard:stats', { totalVehicles: totalV, activeVehicles: activeV, unacknowledgedAlerts: unack, totalWasteLoad: wl[0]?.total || 0, timestamp: new Date() });
    } catch (error) { console.error('Simulation error:', error.message); }
  }, 3000);
};

module.exports = { initializeSocket };
