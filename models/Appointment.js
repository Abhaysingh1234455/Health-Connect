// models/Appointment.js
const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  name: String,
  email: String,
  date: String,
  time: String,
  hospital: String,
});

module.exports = mongoose.model("Appointment", appointmentSchema);