const Vehicle = require('../models/Vehicle');

exports.getVehicles = async (req, res) => {
  try {
    const { status, type, zone, search, page = 1, limit = 50 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (type) query.vehicleType = type;
    if (zone) query.cleaningZone = zone;
    if (search) {
      query.$or = [
        { vehicleNumber: { $regex: search, $options: 'i' } },
        { driverName: { $regex: search, $options: 'i' } },
        { cleaningZone: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Vehicle.countDocuments(query);
    const vehicles = await Vehicle.find(query)
      .populate('assignedRoute')
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ vehicles, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate('assignedRoute').populate('assignedDriver');
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json(vehicle);
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ message: 'Vehicle number already exists' });
    res.status(500).json({ message: error.message });
  }
};

exports.updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getVehicleStats = async (req, res) => {
  try {
    const [total, active, idle, maintenance, offline] = await Promise.all([
      Vehicle.countDocuments(),
      Vehicle.countDocuments({ status: 'active' }),
      Vehicle.countDocuments({ status: 'idle' }),
      Vehicle.countDocuments({ status: 'maintenance' }),
      Vehicle.countDocuments({ status: 'offline' })
    ]);

    const avgStats = await Vehicle.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, avgSpeed: { $avg: '$speed' }, avgFuel: { $avg: '$fuelLevel' }, totalWasteLoad: { $sum: '$currentLoadWeight' } } }
    ]);

    const typeDistribution = await Vehicle.aggregate([
      { $group: { _id: '$vehicleType', count: { $sum: 1 } } }
    ]);

    const zoneDistribution = await Vehicle.aggregate([
      { $group: { _id: '$cleaningZone', count: { $sum: 1 }, activeCount: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } } } },
      { $sort: { _id: 1 } }
    ]);

    const wasteTypeDistribution = await Vehicle.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$wasteType', count: { $sum: 1 }, totalLoad: { $sum: '$currentLoadWeight' } } }
    ]);

    res.json({
      total, active, idle, maintenance, offline,
      avgSpeed: avgStats[0]?.avgSpeed || 0,
      avgFuel: avgStats[0]?.avgFuel || 0,
      totalWasteLoad: avgStats[0]?.totalWasteLoad || 0,
      typeDistribution,
      zoneDistribution,
      wasteTypeDistribution
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
