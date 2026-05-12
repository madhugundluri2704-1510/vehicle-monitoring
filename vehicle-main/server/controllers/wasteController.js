const WasteCollection = require('../models/WasteCollection');

exports.getWasteCollections = async (req, res) => {
  try {
    const { wasteType, zone, status, search, page = 1, limit = 50 } = req.query;
    const query = {};

    if (wasteType) query.wasteType = wasteType;
    if (zone) query.cleaningZone = zone;
    if (status) query.collectionStatus = status;
    if (search) {
      query.$or = [
        { collectionId: { $regex: search, $options: 'i' } },
        { cleaningZone: { $regex: search, $options: 'i' } },
        { dumpingYard: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await WasteCollection.countDocuments(query);
    const collections = await WasteCollection.find(query)
      .populate('vehicleId', 'vehicleNumber vehicleType driverName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ collections, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getWasteCollection = async (req, res) => {
  try {
    const collection = await WasteCollection.findById(req.params.id)
      .populate('vehicleId', 'vehicleNumber vehicleType driverName');
    if (!collection) return res.status(404).json({ message: 'Record not found' });
    res.json(collection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createWasteCollection = async (req, res) => {
  try {
    const collection = await WasteCollection.create(req.body);
    res.status(201).json(collection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateWasteCollection = async (req, res) => {
  try {
    const collection = await WasteCollection.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!collection) return res.status(404).json({ message: 'Record not found' });
    res.json(collection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteWasteCollection = async (req, res) => {
  try {
    const collection = await WasteCollection.findByIdAndDelete(req.params.id);
    if (!collection) return res.status(404).json({ message: 'Record not found' });
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getWasteStats = async (req, res) => {
  try {
    const statusStats = await WasteCollection.aggregate([
      { $group: { _id: '$collectionStatus', count: { $sum: 1 }, totalWeight: { $sum: '$loadWeight' } } }
    ]);

    const typeStats = await WasteCollection.aggregate([
      { $group: { _id: '$wasteType', count: { $sum: 1 }, totalWeight: { $sum: '$loadWeight' } } }
    ]);

    const zoneStats = await WasteCollection.aggregate([
      { $group: { _id: '$cleaningZone', count: { $sum: 1 }, totalWeight: { $sum: '$loadWeight' } } },
      { $sort: { _id: 1 } }
    ]);

    const containerStats = await WasteCollection.aggregate([
      { $group: { _id: '$containerType', count: { $sum: 1 } } }
    ]);

    const totalCollected = await WasteCollection.aggregate([
      { $match: { collectionStatus: 'completed' } },
      { $group: { _id: null, totalWeight: { $sum: '$loadWeight' }, totalHouseholds: { $sum: '$households' } } }
    ]);

    res.json({
      statusStats,
      typeStats,
      zoneStats,
      containerStats,
      totalCollected: totalCollected[0]?.totalWeight || 0,
      totalHouseholds: totalCollected[0]?.totalHouseholds || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
