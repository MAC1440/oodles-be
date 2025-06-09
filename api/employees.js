const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

const Device = require("../models/Device");
const Employee = require("../models/Employee");

// GET /employees
router.get("/", async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json({ employees });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch employees." });
  }
});

// POST /employees
router.post("/", async (req, res) => {
  const { name, role, location, assignedDevice } = req.body;

  if (!name || !role || !location || !assignedDevice) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const device = await Device.findOne({ id: assignedDevice });

    if (!device) {
      return res.status(404).json({ error: "Assigned device not found." });
    }

    if (device.status !== "available") {
      return res
        .status(400)
        .json({ error: "Device is not available for assignment." });
    }

    if (!device.availableLocations.includes(location)) {
      return res
        .status(400)
        .json({ error: "Device is not available in the selected location." });
    }

    // Role-based suitability checks
    const isSuitable = (() => {
      switch (role) {
        case "Developer":
          return device.ram >= 16;
        case "Designer":
          return device.screenSize >= 15;
        case "Marketing":
          return device.ram >= 8 && device.screenSize >= 13;
        case "Sales":
          return true;
        default:
          return false;
      }
    })();

    if (!isSuitable) {
      return res.status(400).json({
        error: "Device does not meet the requirements for the selected role.",
      });
    }

    // Update device
    device.status = "in use";
    device.user = {
      name,
      role,
      location,
      assignedAt: new Date().toISOString(),
    };
    await device.save();

    // Create employee
    const newEmployee = new Employee({
      name,
      role,
      location,
      assignedDevice: device.toObject(),
    });

    await newEmployee.save();

    res.status(201).json(newEmployee);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create employee." });
  }
});

module.exports = router;
