const Route = require('../models/Route');

exports.getRoutes = async (req, res) => {
  try {
    const { status, zone, routeType, search } = req.query;
    const query = {};

    if (status) query.status = status;
    if (zone) query.cleaningZone = zone;
    if (routeType) query.routeType = routeType;
    if (search) {
      query.$or = [
        { routeName: { $regex: search, $options: 'i' } },
        { cleaningZone: { $regex: search, $options: 'i' } }
      ];
    }

    const routes = await Route.find(query).populate('assignedVehicle', 'vehicleNumber status driverName').sort({ cleaningZone: 1 });
    res.json(routes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRoute = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id).populate('assignedVehicle');
    if (!route) return res.status(404).json({ message: 'Route not found' });
    res.json(route);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createRoute = async (req, res) => {
  try {
    const route = await Route.create(req.body);
    res.status(201).json(route);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateRoute = async (req, res) => {
  try {
    const route = await Route.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!route) return res.status(404).json({ message: 'Route not found' });
    res.json(route);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteRoute = async (req, res) => {
  try {
    const route = await Route.findByIdAndDelete(req.params.id);
    if (!route) return res.status(404).json({ message: 'Route not found' });
    res.json({ message: 'Route deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
