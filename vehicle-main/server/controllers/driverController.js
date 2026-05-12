const Driver = require('../models/Driver');

exports.getDrivers = async (req, res) => {
  try {
    const { status, shift, search, page = 1, limit = 50 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (shift) query.shiftTime = shift;
    if (search) {
      query.$or = [
        { driverName: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Driver.countDocuments(query);
    const drivers = await Driver.find(query)
      .populate('assignedVehicle', 'vehicleNumber vehicleType cleaningZone status')
      .sort({ driverName: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ drivers, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id)
      .populate('assignedVehicle', 'vehicleNumber vehicleType cleaningZone status');
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.json(driver);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createDriver = async (req, res) => {
  try {
    const driver = await Driver.create(req.body);
    res.status(201).json(driver);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.json(driver);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.json({ message: 'Driver deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDriverStats = async (req, res) => {
  try {
    const [total, active, onLeave] = await Promise.all([
      Driver.countDocuments(),
      Driver.countDocuments({ status: 'active' }),
      Driver.countDocuments({ status: 'on-leave' })
    ]);

    const shiftDistribution = await Driver.aggregate([
      { $group: { _id: '$shiftTime', count: { $sum: 1 } } }
    ]);

    const topPerformers = await Driver.find({ status: 'active' })
      .sort({ performanceScore: -1 })
      .limit(10)
      .select('driverName performanceScore totalTrips totalWasteCollected');

    const avgPerformance = await Driver.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, avg: { $avg: '$performanceScore' } } }
    ]);

    res.json({
      total, active, onLeave,
      terminated: total - active - onLeave,
      shiftDistribution,
      topPerformers,
      avgPerformance: avgPerformance[0]?.avg || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
