const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  type: {
    type: String,
    enum: ['overspeed', 'overload', 'route-deviation', 'missed-area', 'delayed-collection', 'vehicle-breakdown', 'fuel-low', 'vehicle-offline', 'overweight', 'zone-boundary-breach', 'maintenance-due'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  message: {
    type: String,
    required: true
  },
  location: {
    lat: Number,
    lng: Number
  },
  cleaningZone: {
    type: String,
    default: ''
  },
  acknowledged: {
    type: Boolean,
    default: false
  },
  acknowledgedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  resolvedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Alert', alertSchema);
