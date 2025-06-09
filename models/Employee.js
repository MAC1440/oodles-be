const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  name: String,
  role: String,
  location: String,
  assignedDevice: Object, // Or use Schema.Types.ObjectId and populate if preferred
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Employee", employeeSchema);
