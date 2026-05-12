const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  routeName: {
    type: String,
    required: true,
    trim: true
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
  routeType: {
    type: String,
    enum: ['garbage-collection', 'street-cleaning', 'drain-cleaning'],
    default: 'garbage-collection'
  },
  source: {
    name: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  destination: {
    name: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  dumpingYard: {
    name: { type: String, default: 'Kurnool Municipal Dumping Yard' },
    lat: { type: Number, default: 15.8450 },
    lng: { type: Number, default: 78.0650 }
  },
  checkpoints: [{
    name: { type: String },
    lat: { type: Number },
    lng: { type: Number },
    estimatedTime: { type: Date }
  }],
  waypoints: [[Number]], // Array of [lat, lng]
  distance: {
    type: Number, // km
    default: 0
  },
  estimatedDuration: {
    type: Number, // minutes
    default: 0
  },
  trafficCondition: {
    type: String,
    enum: ['clear', 'moderate', 'heavy'],
    default: 'clear'
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'planned'],
    default: 'planned'
  },
  assignedVehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Route', routeSchema);
