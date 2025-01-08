const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Importing Routes

const recordsRoutes = require("./routes/records");
const appointmentRoutes = require("./routes/appointments");

// Register Routes

app.use("/records", recordsRoutes);
app.use("/appointments", appointmentRoutes);

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
