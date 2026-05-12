const mongoose = require('mongoose');

const trackingSchema = new mongoose.Schema({
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true,
    index: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  speed: {
    type: Number,
    default: 0
  },
  heading: {
    type: Number,
    default: 0
  },
  fuelLevel: {
    type: Number,
    default: 100
  },
  wasteWeight: {
    type: Number, // current load in kg
    default: 0
  },
  cleaningZone: {
    type: String,
    default: ''
  },
  eventType: {
    type: String,
    enum: ['position', 'stop', 'start', 'alert', 'checkpoint', 'collection', 'dumping'],
    default: 'position'
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: false
});

// Index for efficient querying
trackingSchema.index({ vehicleId: 1, timestamp: -1 });

module.exports = mongoose.model('Tracking', trackingSchema);
