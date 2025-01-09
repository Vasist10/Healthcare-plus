
const express = require("express");
const router = express.Router();

let healthRecords = []; // Array to store all records

// Fetch all health records
router.get("/", (req, res) => {
  if (healthRecords.length === 0) {
    return res.status(404).json({ message: "No records found" });
  }

  res.status(200).json(healthRecords);
});

// Add a new health record
router.post("/", (req, res) => {
  const record = req.body;

  // Validate record
  if (!record || Object.keys(record).length === 0) {
    return res.status(400).json({ message: "Invalid record" });
  }

  healthRecords.push(record);

  res.status(201).json({
    message: "Record added successfully",
    record: record,
  });
});

module.exports = router;
