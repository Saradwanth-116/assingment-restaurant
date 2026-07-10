const express = require("express");
const router = express.Router();
const Restaurant = require("../models/Restaurant");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

// @route   GET /api/restaurants
// @desc    Get all restaurants
// @access  Private
router.get("/", authMiddleware, async (req, res) => {
  try {
    const restaurants = await Restaurant.find().sort({ name: 1 });
    res.json(restaurants);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET /api/restaurants/available
// @desc    Get available restaurants for date, time, and guests
// @access  Private
router.get("/available", authMiddleware, async (req, res) => {
  const { date, time, guests } = req.query;
  try {
    const restaurants = await Restaurant.find().sort({ name: 1 });
    if (!date || !time || !guests) {
      return res.json(restaurants);
    }
    
    // For each restaurant, check if it has at least one table with capacity >= guests
    // that is NOT fully booked at this date and time.
    const Table = require("../models/Table");
    const Reservation = require("../models/Reservation");
    
    const availableRestaurants = [];
    
    for (const r of restaurants) {
      const tables = await Table.find({ restaurant: r._id, capacity: { $gte: Number(guests) } });
      let hasAvailableTable = false;
      
      for (const t of tables) {
        const activeCount = await Reservation.countDocuments({
          table: t._id,
          reservationDate: date,
          timeSlot: time,
          status: "active"
        });
        
        if (activeCount < (t.quantity || 1)) {
          hasAvailableTable = true;
          break;
        }
      }
      
      if (hasAvailableTable) {
        availableRestaurants.push(r);
      }
    }
    
    res.json(availableRestaurants);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET /api/restaurants/:id
// @desc    Get restaurant by id
// @access  Private
router.get("/:id", authMiddleware, async (req, res) => {
  const mongoose = require("mongoose");
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
    res.json(restaurant);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST /api/restaurants
// @desc    Create a restaurant
// @access  Private/Admin
router.post("/", [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    let restaurant = await Restaurant.findOne({ name: req.body.name });
    if (restaurant) {
      return res.status(400).json({ message: "Restaurant already exists" });
    }

    restaurant = new Restaurant(req.body);
    await restaurant.save();
    res.json(restaurant);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   PUT /api/restaurants/:id
// @desc    Update a restaurant
// @access  Private/Admin
router.put("/:id", [authMiddleware, adminMiddleware], async (req, res) => {
  const mongoose = require("mongoose");
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    res.json(restaurant);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   DELETE /api/restaurants/:id
// @desc    Delete a restaurant
// @access  Private/Admin
router.delete("/:id", [authMiddleware, adminMiddleware], async (req, res) => {
  const mongoose = require("mongoose");
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    await restaurant.deleteOne();
    res.json({ message: "Restaurant removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
