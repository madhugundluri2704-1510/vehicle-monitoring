const Vehicle = require('../models/Vehicle');
const Route = require('../models/Route');
const WasteCollection = require('../models/WasteCollection');
const Alert = require('../models/Alert');
const Driver = require('../models/Driver');
const Tracking = require('../models/Tracking');

exports.getDashboardSummary = async (req, res) => {
  try {
    const [vehicleStats, routeStats, wasteStats, alertStats] = await Promise.all([
      Vehicle.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Route.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      WasteCollection.aggregate([
        { $group: { _id: '$collectionStatus', count: { $sum: 1 }, totalWeight: { $sum: '$loadWeight' } } }
      ]),
      Alert.countDocuments({ acknowledged: false })
    ]);

    const totalVehicles = await Vehicle.countDocuments();
    const totalRoutes = await Route.countDocuments();
    const totalDrivers = await Driver.countDocuments({ status: 'active' });
    const totalDistance = await Route.aggregate([
      { $group: { _id: null, total: { $sum: '$distance' } } }
    ]);

    const avgFuel = await Vehicle.aggregate([
      { $group: { _id: null, avg: { $avg: '$fuelLevel' } } }
    ]);

    const totalWasteToday = await WasteCollection.aggregate([
      { $match: { collectionStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$loadWeight' }, count: { $sum: 1 } } }
    ]);

    const zoneWaste = await WasteCollection.aggregate([
      { $match: { collectionStatus: 'completed' } },
      { $group: { _id: '$cleaningZone', totalWeight: { $sum: '$loadWeight' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      vehicles: { total: totalVehicles, byStatus: vehicleStats },
      routes: { total: totalRoutes, byStatus: routeStats },
      waste: { total: totalWasteToday[0]?.count || 0, byStatus: wasteStats, totalWeight: totalWasteToday[0]?.total || 0 },
      drivers: { active: totalDrivers },
      alerts: { unacknowledged: alertStats },
      totalDistance: totalDistance[0]?.total || 0,
      avgFuelLevel: Math.round(avgFuel[0]?.avg || 0),
      zoneWaste,
      lastUpdated: new Date()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPerformanceReport = async (req, res) => {
  try {
    const fuelData = await Vehicle.find({}, 'vehicleNumber fuelLevel speed mileage vehicleType cleaningZone currentLoadWeight loadCapacity');

    const wasteByType = await WasteCollection.aggregate([
      { $group: { _id: '$wasteType', count: { $sum: 1 }, totalWeight: { $sum: '$loadWeight' } } }
    ]);

    const wasteByZone = await WasteCollection.aggregate([
      { $group: { _id: '$cleaningZone', count: { $sum: 1 }, totalWeight: { $sum: '$loadWeight' } } },
      { $sort: { _id: 1 } }
    ]);

    const alertsByType = await Alert.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const topVehicles = await Vehicle.find({ status: 'active' })
      .sort({ mileage: -1 })
      .limit(10)
      .select('vehicleNumber driverName mileage fuelLevel speed cleaningZone currentLoadWeight');

    const driverPerformance = await Driver.find({ status: 'active' })
      .sort({ performanceScore: -1 })
      .limit(10)
      .select('driverName performanceScore totalTrips totalWasteCollected attendanceCount absentCount');

    res.json({
      fuelData,
      wasteByType,
      wasteByZone,
      alertsByType,
      topVehicles,
      driverPerformance,
      generatedAt: new Date()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
