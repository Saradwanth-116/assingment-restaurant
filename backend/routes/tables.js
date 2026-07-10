const express = require("express");
const router = express.Router();
const Table = require("../models/Table");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

// @route   GET /api/tables
// @desc    Get all tables
// @access  Private
router.get("/", authMiddleware, async (req, res) => {
  try {
    const tables = await Table.find().sort({ name: 1 });
    res.json(tables);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST /api/tables
// @desc    Create a table
// @access  Private/Admin
router.post("/", [authMiddleware, adminMiddleware], async (req, res) => {
  const { name, capacity } = req.body;

  try {
    let table = await Table.findOne({ name });
    if (table) {
      return res.status(400).json({ message: "Table already exists" });
    }

    table = new Table({
      name,
      capacity,
    });

    await table.save();
    res.json(table);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   DELETE /api/tables/:id
// @desc    Delete a table
// @access  Private/Admin
router.delete("/:id", [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    await table.deleteOne();
    res.json({ message: "Table removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
