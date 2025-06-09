const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema({
  id: String,
  model: String,
  screenSize: Number,
  processor: String,
  ram: Number,
  availableLocations: [String],
  status: {
    type: String,
    enum: ["available", "in use"],
    default: "available",
  },
  user: {
    name: String,
    role: String,
    location: String,
    assignedAt: Date,
  },
});

module.exports = mongoose.model("Device", deviceSchema);
