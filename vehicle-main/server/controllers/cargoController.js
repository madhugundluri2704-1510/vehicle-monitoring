const Cargo = require('../models/Cargo');

exports.getCargos = async (req, res) => {
  try {
    const { status, category, search } = req.query;
    const query = {};
    if (status) query.deliveryStatus = status;
    if (category) query.cargoCategory = category;
    if (search) {
      query.$or = [
        { cargoId: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const cargos = await Cargo.find(query)
      .populate('vehicleId', 'vehicleNumber driverName')
      .populate('routeId', 'routeName source destination')
      .sort({ updatedAt: -1 });
    res.json(cargos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCargo = async (req, res) => {
  try {
    const cargo = await Cargo.findById(req.params.id)
      .populate('vehicleId')
      .populate('routeId');
    if (!cargo) {
      return res.status(404).json({ message: 'Cargo not found' });
    }
    res.json(cargo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createCargo = async (req, res) => {
  try {
    const cargo = await Cargo.create(req.body);
    res.status(201).json(cargo);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Cargo ID already exists' });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.updateCargo = async (req, res) => {
  try {
    const cargo = await Cargo.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!cargo) {
      return res.status(404).json({ message: 'Cargo not found' });
    }
    res.json(cargo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCargo = async (req, res) => {
  try {
    const cargo = await Cargo.findByIdAndDelete(req.params.id);
    if (!cargo) {
      return res.status(404).json({ message: 'Cargo not found' });
    }
    res.json({ message: 'Cargo deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCargoStats = async (req, res) => {
  try {
    const stats = await Cargo.aggregate([
      {
        $group: {
          _id: '$deliveryStatus',
          count: { $sum: 1 },
          totalWeight: { $sum: '$loadWeight' }
        }
      }
    ]);

    const categoryStats = await Cargo.aggregate([
      { $group: { _id: '$cargoCategory', count: { $sum: 1 } } }
    ]);

    const containerStats = await Cargo.aggregate([
      { $group: { _id: '$containerType', count: { $sum: 1 } } }
    ]);

    res.json({ statusStats: stats, categoryStats, containerStats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
