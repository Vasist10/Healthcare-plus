const express = require("express");
const router = express.Router();

let appointments = {}; 
let appointmentsRecord = [];

// Book Appointment
router.post("/", (req, res) => {
  const appoint = req.body;
  if (!appoint || Object.keys(appoint).length === 0) {
    return res.status(400).json({ message: "Invalid appointment" });
  }

  appointmentsRecord.push(appoint);
  res.status(201).json({ 
    message: "Appointment booked successfully" ,
    appointment: appoint,
    
  });

});

// Fetch all appointments
router.get("/", (req, res) => {
  if (appointmentsRecord.length === 0) {
    return res.status(404).json({ message: "No appointments found" });
  }
  res.status(200).json(appointmentsRecord);
});


router.get("/:email", (req, res) => {
  const { email } = req.params;
  if (!appointments[email]) return res.status(404).json({ message: "No appointments found" });

  res.status(200).json(appointments[email]);
});

module.exports = router;
