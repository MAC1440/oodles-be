const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const filePath = path.join(__dirname, '../data/devices.json');

// Initial seed data (run once)
if (!fs.existsSync(filePath)) {
  fs.writeFileSync(
    filePath,
    JSON.stringify([
      {
        id: "1",
        model: "MacBook Pro 16 M2",
        screenSize: 16,
        processor: "Apple M2 Pro",
        ram: 32,
        availableLocations: ["Ireland", "EU"],
        status: "available",
        user: {}
      },
      {
        id: "2",
        model: "Dell XPS 13",
        screenSize: 13.3,
        processor: "Intel Core i7 12th Gen",
        ram: 16,
        availableLocations: ["UK", "Ireland"],
        status: "available",
        user: {}
      },
      {
        id: "3",
        model: "Lenovo ThinkPad X1 Carbon",
        screenSize: 14,
        processor: "Intel Core i5 11th Gen",
        ram: 8,
        availableLocations: ["UK"],
        status: "available",
        user: {}
      },
      {
        id: "4",
        model: "HP EliteBook 840 G9",
        screenSize: 14,
        processor: "Intel Core i7 12th Gen",
        ram: 8,
        availableLocations: ["UK", "EU"],
        status: "available",
        user: {}
      },
      {
        id: "5",
        model: "Microsoft Surface Laptop 5",
        screenSize: 13.5,
        processor: "Intel Core i7 12th Gen",
        ram: 8,
        availableLocations: ["UK", "EU"],
        status: "available",
        user: {}
      },
      {
        id: "6",
        model: "Asus ZenBook 14",
        screenSize: 14,
        processor: "AMD Ryzen 7 5800U",
        ram: 4,
        availableLocations: ["UK"],
        status: "available",
        user: {}
      },
      {
        id: "7",
        model: "MacBook Air 15 M2",
        screenSize: 15,
        processor: "Apple M2",
        ram: 16,
        availableLocations: ["Ireland"],
        status: "available",
        user: {}
      },
      {
        id: "8",
        model: "Acer Swift X",
        screenSize: 14,
        processor: "AMD Ryzen 7 5800U",
        ram: 16,
        availableLocations: ["UK", "Ireland", "EU"],
        status: "available",
        user: {}
      }
    ], null, 2)
  );
}

function readDevices() {
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeDevices(devices) {
  fs.writeFileSync(filePath, JSON.stringify(devices, null, 2));
}

// GET /devices?role=Developer&location=UK&status=available&recommended=true
router.get('/', (req, res) => {
  let devices = readDevices();
  const { role, location, status, recommended } = req.query;

  if (location) {
    devices = devices.filter(d => d.availableLocations.includes(location));
  }

  if (status === 'available' || status === 'in use') {
    devices = devices.filter(d => d.status === status);
  }

  // If recommended=true and role is provided, apply suitability logic
  if (recommended === 'true' && role) {
    devices = devices.filter(device => {
      const isSuitable = (() => {
        switch (role) {
          case 'Developer':
            return device.ram >= 16;
          case 'Designer':
            return device.screenSize >= 15;
          case 'Marketing':
            return device.ram >= 8 && device.screenSize >= 13;
          case 'Sales':
            return true;
          default:
            return false;
        }
      })();
      return isSuitable;
    });
  }

  return res.json({ devices });
});


// POST /devices
router.post('/', (req, res) => {
  const devices = readDevices();
  const body = req.body;

  const newDevice = {
    ...body,
    id: uuidv4(),
    status: 'available',
    user: {}
  };

  devices.push(newDevice);
  writeDevices(devices);

  return res.json({ message: 'Device added', device: newDevice });
});

// PATCH /devices
router.patch('/', (req, res) => {
  const { id, status, user } = req.body;

  if (!id || !status) {
    return res.status(400).json({ error: 'id and status are required' });
  }

  const devices = readDevices();
  const index = devices.findIndex(d => d.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Device not found' });
  }

  devices[index].status = status;

  if (status === 'in use' && user) {
    devices[index].user = user; // e.g., { name, role, assignedAt }
  }

  writeDevices(devices);

  return res.json({ message: 'Device updated', device: devices[index] });
});

module.exports = router;
