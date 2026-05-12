const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  driverName: {
    type: String,
    required: [true, 'Driver name is required'],
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  aadharLast4: {
    type: String,
    trim: true,
    default: ''
  },
  assignedVehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    default: null
  },
  shiftTime: {
    type: String,
    enum: ['morning', 'afternoon', 'night'],
    default: 'morning'
  },
  joiningDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'on-leave', 'terminated'],
    default: 'active'
  },
  performanceScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 75
  },
  address: {
    type: String,
    trim: true,
    default: 'Kurnool'
  },
  emergencyContact: {
    type: String,
    trim: true,
    default: ''
  },
  totalTrips: {
    type: Number,
    default: 0
  },
  totalWasteCollected: {
    type: Number, // kg
    default: 0
  },
  attendanceCount: {
    type: Number,
    default: 0
  },
  absentCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Driver', driverSchema);
