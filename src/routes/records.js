const express = require("express");
const router = express.Router();

let healthRecords = {}; // In-memory storage for simplicity

// Fetch Health Records
router.get("/:email", (req, res) => {
  const { email } = req.params;
  if (!healthRecords[email]) return res.status(404).json({ message: "No records found" });

  res.status(200).json(healthRecords[email]);
});

// Update Health Records
router.post("/:email", (req, res) => {
  const { email } = req.params;
  const record = req.body;

  if (!healthRecords[email]) healthRecords[email] = [];
  healthRecords[email].push(record);

  res.status(201).json({ message: "Record added successfully" });
});

module.exports = router;