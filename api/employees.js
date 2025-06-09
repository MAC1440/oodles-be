const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const employeePath = path.join(__dirname, "../data/employees.json");
const devicePath = path.join(__dirname, "../data/devices.json");

function readEmployees() {
  if (!fs.existsSync(employeePath)) return [];
  return JSON.parse(fs.readFileSync(employeePath, "utf-8"));
}

function writeEmployees(data) {
  fs.writeFileSync(employeePath, JSON.stringify(data, null, 2));
}

function readDevices() {
  if (!fs.existsSync(devicePath)) return [];
  return JSON.parse(fs.readFileSync(devicePath, "utf-8"));
}

function writeDevices(data) {
  fs.writeFileSync(devicePath, JSON.stringify(data, null, 2));
}

// GET /employees
router.get("/", (req, res) => {
  const employees = readEmployees();
  res.json({ employees });
});

// POST /employees
router.post("/", (req, res) => {
  const { name, role, location, assignedDevice } = req.body;

  if (!name || !role || !location || !assignedDevice) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const devices = readDevices();
  const device = devices.find((d) => d.id === assignedDevice);

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
    return res
      .status(400)
      .json({
        error: "Device does not meet the requirements for the selected role.",
      });
  }

  // Update device status and user
  device.status = "in use";
  device.user = {
    name,
    role,
    location,
    assignedAt: new Date().toISOString(),
  };

  // Save updated devices list
  const updatedDevices = devices.map((d) => (d.id === device.id ? device : d));
  writeDevices(updatedDevices);

  // Save new employee
  const employees = readEmployees();
  const newEmployee = {
    id: uuidv4(),
    name,
    role,
    location,
    assignedDevice: device,
    createdAt: new Date().toISOString(),
  };
  employees.push(newEmployee);
  writeEmployees(employees);

  return res.status(201).json(newEmployee);
});

module.exports = router;
