const express = require("express");
const router = express.Router();

let appointments = {}; 

// Book Appointment
router.post("/", (req, res) => {
  const { email, date, time, doctor } = req.body;
  if (!appointments[email]) appointments[email] = [];

  appointments[email].push({ date, time, doctor });
  res.status(201).json({ message: "Appointment booked successfully" });
});

router.get("/:email", (req, res) => {
  const { email } = req.params;
  if (!appointments[email]) return res.status(404).json({ message: "No appointments found" });

  res.status(200).json(appointments[email]);
});

module.exports = router;
