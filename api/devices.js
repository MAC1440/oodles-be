const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const Device = require("../models/Device");

// GET /devices?role=Developer&location=UK&status=available
router.get("/", async (req, res) => {
  try {
    const { role, location, status } = req.query;

    let query = {};

    if (location) {
      query.availableLocations = location;
    }

    if (status === "available" || status === "in use") {
      query.status = status;
    }

    let devices = await Device.find(query);

    if (role) {
      devices = devices.filter((device) => {
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
      });
    }

    res.json({ devices });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch devices" });
  }
});

// POST /devices
router.post("/", async (req, res) => {
  try {
    const body = req.body;

    const newDevice = new Device({
      ...body,
      id: uuidv4(),
      status: "available",
      user: {},
    });

    await newDevice.save();
    res.json({ message: "Device added", device: newDevice });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add device" });
  }
});

// PATCH /devices
router.patch("/", async (req, res) => {
  try {
    const { id, status, user } = req.body;

    if (!id || !status) {
      return res.status(400).json({ error: "id and status are required" });
    }

    const device = await Device.findOne({ id });

    if (!device) {
      return res.status(404).json({ error: "Device not found" });
    }

    device.status = status;

    if (status === "in use" && user) {
      device.user = user; // { name, role, assignedAt, location }
    }

    await device.save();

    res.json({ message: "Device updated", device });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update device" });
  }
});

module.exports = router;
