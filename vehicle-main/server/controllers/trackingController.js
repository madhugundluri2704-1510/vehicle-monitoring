const Tracking = require('../models/Tracking');
const Vehicle = require('../models/Vehicle');

exports.getTrackingHistory = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { from, to, limit = 500 } = req.query;

    const query = { vehicleId };
    if (from || to) {
      query.timestamp = {};
      if (from) query.timestamp.$gte = new Date(from);
      if (to) query.timestamp.$lte = new Date(to);
    }

    const tracking = await Tracking.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json(tracking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLatestPositions = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({}, 'vehicleNumber vehicleType driverName status currentLocation speed fuelLevel heading');
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addTrackingPoint = async (req, res) => {
  try {
    const point = await Tracking.create(req.body);
    
    // Update vehicle current location
    await Vehicle.findByIdAndUpdate(req.body.vehicleId, {
      currentLocation: { lat: req.body.latitude, lng: req.body.longitude },
      speed: req.body.speed,
      fuelLevel: req.body.fuelLevel
    });

    res.status(201).json(point);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
