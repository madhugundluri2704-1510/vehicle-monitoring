const mongoose = require('mongoose');

const wasteCollectionSchema = new mongoose.Schema({
  collectionId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  routeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    default: null
  },
  wasteType: {
    type: String,
    enum: ['wet', 'dry', 'hazardous', 'construction', 'mixed'],
    default: 'mixed'
  },
  loadWeight: {
    type: Number, // kg
    required: true
  },
  containerType: {
    type: String,
    enum: ['240L-bin', '660L-bin', 'dumpster', 'open-container', 'compactor-bin'],
    default: 'dumpster'
  },
  collectionStatus: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'missed'],
    default: 'pending'
  },
  cleaningZone: {
    type: String,
    trim: true,
    default: 'Zone 1'
  },
  wardNumber: {
    type: Number,
    min: 1,
    max: 50,
    default: 1
  },
  households: {
    type: Number,
    default: 0
  },
  collectedAt: {
    type: Date,
    default: null
  },
  dumpedAt: {
    type: Date,
    default: null
  },
  dumpingYard: {
    type: String,
    default: 'Kurnool Municipal Dumping Yard'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('WasteCollection', wasteCollectionSchema);
