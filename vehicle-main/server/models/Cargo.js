const mongoose = require('mongoose');

const cargoSchema = new mongoose.Schema({
  cargoId: {
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
  containerType: {
    type: String,
    enum: ['standard', 'refrigerated', 'tanker', 'flatbed', 'open-top'],
    default: 'standard'
  },
  cargoCategory: {
    type: String,
    enum: ['general', 'hazardous', 'perishable', 'fragile', 'bulk'],
    default: 'general'
  },
  loadWeight: {
    type: Number, // tons
    required: true
  },
  maxCapacity: {
    type: Number,
    default: 20
  },
  description: {
    type: String,
    trim: true
  },
  deliveryStatus: {
    type: String,
    enum: ['pending', 'in-transit', 'delivered', 'delayed', 'returned'],
    default: 'pending'
  },
  pickupTime: {
    type: Date,
    default: Date.now
  },
  deliveryTime: {
    type: Date
  },
  senderName: {
    type: String,
    trim: true
  },
  receiverName: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Cargo', cargoSchema);
