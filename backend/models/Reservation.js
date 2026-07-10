const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  table: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    required: true,
  },
  reservationDate: {
    type: String, // Storing as YYYY-MM-DD
    required: true,
  },
  timeSlot: {
    type: String, // Storing as HH:MM
    required: true,
  },
  guests: {
    type: Number,
    required: true,
    min: 1,
  },
  status: {
    type: String,
    enum: ['active', 'cancelled'],
    default: 'active',
  },
}, { timestamps: true });

module.exports = mongoose.model('Reservation', ReservationSchema);
