const mongoose  = require("mongoose")

const Health_Connect_Schema = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
  },
  Email: {
    type: String,
    required: true,
    unique: true,
  },
  Password: {
    type: String,
    required: true,
  },
    bodyMetrics: {
        type: Object,
        default: {}
      },
    phone: { type: String },
    dob: { type: String },
    bloodGroup: { type: String }
})

const  Health_Connect_Model = mongoose.model("pateint", Health_Connect_Schema)
module.exports = Health_Connect_Model;  //exporting the model