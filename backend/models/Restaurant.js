const mongoose = require("mongoose");

const MenuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
});

const RestaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    location: {
      address: { type: String, required: true },
      googleMapsLink: { type: String },
    },
    images: {
      type: [String],
      default: [],
    },
    cuisine: {
      type: String,
      required: true,
    },
    costForTwo: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    isTrending: { type: Boolean, default: false },
    isTopRated: { type: Boolean, default: false },
    isPremium: { type: Boolean, default: false },
    menuLink: { type: String, default: "" },
    menu: {
      starters: [MenuItemSchema],
      mainCourse: [MenuItemSchema],
      desserts: [MenuItemSchema],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Restaurant", RestaurantSchema);
