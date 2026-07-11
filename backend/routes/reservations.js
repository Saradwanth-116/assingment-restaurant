const express = require("express");
const router = express.Router();
const Reservation = require("../models/Reservation");
const Table = require("../models/Table");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

// @route   GET /api/reservations
// @desc    Get reservations (User gets own, Admin gets all)
// @access  Private
router.get("/", authMiddleware, async (req, res) => {
  try {
    let reservations;
    if (req.user.role === "admin") {
      reservations = await Reservation.find()
        .populate("user", "name email")
        .populate({
          path: "table",
          select: "name capacity restaurant",
          populate: { path: "restaurant", select: "name location" },
        });
    } else {
      reservations = await Reservation.find({ user: req.user.id }).populate({
        path: "table",
        select: "name capacity restaurant",
        populate: { path: "restaurant", select: "name location" },
      });
    }
    res.json(reservations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST /api/reservations
// @desc    Create a reservation
// @access  Private
router.post("/", authMiddleware, async (req, res) => {
  const { tableId, reservationDate, timeSlot, guests } = req.body;

  try {
    // Check if table exists
    const table = await Table.findById(tableId);
    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    // Validation: Check table capacity
    if (guests > table.capacity) {
      return res
        .status(400)
        .json({ message: `Guest count (${guests}) exceeds table capacity (${table.capacity})` });
    }

    // Validation: Prevent overlapping reservations exceeding table quantity
    const activeReservationsCount = await Reservation.countDocuments({
      table: tableId,
      reservationDate,
      timeSlot,
      status: "active",
    });

    const quantity = table.quantity || 1;
    if (activeReservationsCount >= quantity) {
      return res
        .status(400)
        .json({ message: "All tables of this type are already booked for the selected time slot" });
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
    res.status(500).send("Server Error");
  }
});

// @route   PATCH /api/reservations/:id/cancel
// @desc    Cancel a reservation
// @access  Private
router.patch("/:id/cancel", authMiddleware, async (req, res) => {
  try {
    let reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    // Check authorization: Must be admin or the user who created it
    if (reservation.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({ message: "User not authorized" });
    }

    reservation.status = "cancelled";
    await reservation.save();

    res.json(reservation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   PUT /api/reservations/:id
// @desc    Update a reservation (Admin only)
// @access  Private
router.put("/:id", [authMiddleware, adminMiddleware], async (req, res) => {
  const { tableId, reservationDate, timeSlot, guests } = req.body;

  try {
    let reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    // Check if table exists
    const table = await Table.findById(tableId);
    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    // Validation: Check table capacity
    if (guests > table.capacity) {
      return res
        .status(400)
        .json({ message: `Guest count (${guests}) exceeds table capacity (${table.capacity})` });
    }

    // Validation: Prevent overlapping reservations exceeding table quantity
    // Exclude the current reservation from the count
    const activeReservationsCount = await Reservation.countDocuments({
      _id: { $ne: req.params.id },
      table: tableId,
      reservationDate,
      timeSlot,
      status: "active",
    });

    const quantity = table.quantity || 1;
    if (activeReservationsCount >= quantity) {
      return res
        .status(400)
        .json({ message: "All tables of this type are already booked for the selected time slot" });
    }

    // Update reservation
    reservation.table = tableId;
    reservation.reservationDate = reservationDate;
    reservation.timeSlot = timeSlot;
    reservation.guests = guests;
    reservation.isModifiedByAdmin = true;

    await reservation.save();
    res.json(reservation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   DELETE /api/reservations/:id
// @desc    Delete a reservation (Admin only)
// @access  Private
router.delete("/:id", [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }
    await reservation.deleteOne();
    res.json({ message: "Reservation removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
