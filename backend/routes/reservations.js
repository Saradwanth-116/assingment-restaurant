const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// @route   GET /api/reservations
// @desc    Get reservations (User gets own, Admin gets all)
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    let reservations;
    if (req.user.role === 'admin') {
      reservations = await Reservation.find().populate('user', 'name email').populate('table', 'name capacity');
    } else {
      reservations = await Reservation.find({ user: req.user.id }).populate('table', 'name capacity');
    }
    res.json(reservations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/reservations
// @desc    Create a reservation
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  const { tableId, reservationDate, timeSlot, guests } = req.body;

  try {
    // Check if table exists
    const table = await Table.findById(tableId);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    // Validation: Check table capacity
    if (guests > table.capacity) {
      return res.status(400).json({ message: `Guest count (${guests}) exceeds table capacity (${table.capacity})` });
    }

    // Validation: Prevent overlapping reservations
    const existingReservation = await Reservation.findOne({
      table: tableId,
      reservationDate,
      timeSlot,
      status: 'active',
    });

    if (existingReservation) {
      return res.status(400).json({ message: 'This table is already booked for the selected time slot' });
    }

    // Create reservation
    const newReservation = new Reservation({
      user: req.user.id,
      table: tableId,
      reservationDate,
      timeSlot,
      guests,
    });

    const reservation = await newReservation.save();
    res.json(reservation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PATCH /api/reservations/:id/cancel
// @desc    Cancel a reservation
// @access  Private
router.patch('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    let reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Check authorization: Must be admin or the user who created it
    if (reservation.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'User not authorized' });
    }

    reservation.status = 'cancelled';
    await reservation.save();

    res.json(reservation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
