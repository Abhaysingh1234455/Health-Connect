// const nodemailer = require("nodemailer");
// require("dotenv").config();
// const express = require("express");
// const axios = require("axios");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const BodyMetrics = require("./models/BodyMetrics");
// const Health_Connect_Model = require("./models/Health_Connect");
// const Appointment = require("./models/Appointment"); // ✅ NEW: import appointment model
// const otpStore = new Map(); // In-memory store for OTPs

// const app = express();
// app.use(express.json());
// app.use(cors());

// // Connect to MongoDB
// mongoose.connect("mongodb://127.0.0.1:27017/Health_Connect")
//   .then(() => console.log("Database connected successfully!"))
//   .catch((err) => console.error("Database connection error: ", err));

// // LOGIN (unchanged)
// app.post("/login", (req, res) => {
//   const { Email, Password } = req.body;

//   Health_Connect_Model.findOne({ Email })
//     .then(user => {
//       if (user) {
//         if (user.Password === Password) {
//           res.json({ message: "success", userId: user._id });
//         } else {
//           res.json({ message: "the password is incorrect" });
//         }
//       } else {
//         res.json({ message: "no record existed" });
//       }
//     })
//     .catch(err => {
//       res.status(500).json({ message: "Server error", error: err });
//     });
// });

// // POST /request-otp
// app.post('/request-otp', async (req, res) => {
//   const { Email } = req.body;
//   const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
//   if (!gmailRegex.test(Email)) {
//     return res.status(400).json({ success: false, message: "Only valid Gmail addresses are allowed" });
//   }

//   // Optional: Rate limiting OTP requests (e.g., one every 15 seconds)
//   const current = Date.now();
//   const existing = otpStore.get(Email);
//   if (existing && current - existing.timestamp < 15000) {
//     return res.status(429).json({ success: false, message: "Please wait before requesting a new OTP." });
//   }

//   const otp = Math.floor(100000 + Math.random() * 900000).toString();
//   otpStore.set(Email, { otp, timestamp: current });

//   const transporter = nodemailer.createTransport({
//     service: "Gmail",
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });

//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: Email,
//     subject: "OTP for Health Connect Signup",
//     html: `<p>Your OTP for Health Connect Signup is: <strong>${otp}</strong></p>`,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     res.status(200).json({ success: true, message: "OTP sent to email" });
//   } catch (error) {
//     console.error("Error sending OTP:", error);
//     res.status(500).json({ success: false, message: "Failed to send OTP" });
//   }
// });


// // POST /SignupPage
// app.post('/SignupPage', async (req, res) => {
//   try {
//     const { Email, Password, otp } = req.body;
//     const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
//     if (!gmailRegex.test(Email)) {
//       return res.status(400).json({ success: false, message: "Only valid Gmail addresses are allowed" });
//     }

//     const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
//     if (!strongPasswordRegex.test(Password)) {
//       return res.status(400).json({
//         success: false,
//         message: "Password must be at least 8 characters long, include an uppercase letter, lowercase letter, number, and special character."
//       });
//     }

//     const existing = otpStore.get(Email);
//     if (!existing || existing.otp !== otp) {
//       return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
//     }

//     const existingUser = await Health_Connect_Model.findOne({ Email });
//     if (existingUser) {
//       return res.status(400).json({ success: false, message: "User already exists" });
//     }

//     const newUser = await Health_Connect_Model.create({ Email, Password });
//     otpStore.delete(Email);
//     res.json({ success: true, user: newUser });

//   } catch (error) {
//     res.status(400).json({ success: false, message: "Error creating user", error });
//   }
// });


// // METRICS ROUTES (unchanged)
// app.post("/save-metrics", async (req, res) => {
//   try {
//     const { userId, metrics } = req.body;
//     if (!userId) return res.status(400).json({ message: "User ID is required" });

//     let userMetrics = await BodyMetrics.findOne({ userId });
//     if (userMetrics) {
//       userMetrics.metrics = metrics;
//       await userMetrics.save();
//     } else {
//       userMetrics = await BodyMetrics.create({ userId, metrics });
//     }

//     res.json({ success: true, metrics: userMetrics.metrics });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// });

// app.get("/get-metrics/:userId", async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const userMetrics = await BodyMetrics.findOne({ userId });
//     res.json({ metrics: userMetrics ? userMetrics.metrics : {} });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// });

// // HOSPITAL SEARCH (unchanged)
// const GOOGLE_API_KEY = "AIzaSyBXJrAiZu4ee7hYREDhXYUCYsvuqMbGtx0";
// app.get("/api/nearby-hospitals", async (req, res) => {
//   const { lat, lng } = req.query;
//   if (!lat || !lng) return res.status(400).json({ error: "Latitude and longitude required" });

//   try {
//     const response = await axios.get(
//       `https://maps.googleapis.com/maps/api/place/nearbysearch/json`,
//       {
//         params: {
//           location: `${lat},${lng}`,
//           radius: 5000,
//           type: "hospital",
//           key: GOOGLE_API_KEY,
//         },
//       }
//     );
//     res.json(response.data);
//   } catch (error) {
//     console.error("Error fetching hospitals:", error.response?.data || error.message);
//     res.status(500).json({ error: "Failed to fetch hospitals" });
//   }
// });

// // ✅ APPOINTMENT CONFIRMATION + SAVE TO DB
// app.post("/send-confirmation", async (req, res) => {
//   const { name, email, date, doctor } = req.body;

//   const transporter = nodemailer.createTransport({
//     service: "Gmail",
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });

//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: email,
//     subject: "Appointment Confirmation",
//     html: `
//       <h3>Appointment Confirmation</h3>
//       <p>Hello <strong>${name}</strong>,</p>
//       <p>Your appointment at <strong>${doctor}</strong> is confirmed.</p>
//       <p><strong>Date & Time:</strong> ${date}</p>
//       <p>Thank you for using Health Connect!</p>
//     `,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     await Appointment.create({ name, email, date, doctor }); // ✅ Save to DB
//     res.status(200).json({ message: "Email sent and appointment saved!" });
//   } catch (error) {
//     console.error("Error sending confirmation:", error);
//     res.status(500).json({ error: "Failed to send email" });
//   }
// });

// // Get all appointments
// app.get("/appointments", async (req, res) => {
//   try {
//     const appointment = await Appointment.find();
//     res.status(200).json(appointment);
//   } catch (error) {
//     console.error("Error fetching appointments:", error);
//     res.status(500).json({ error: "Failed to fetch appointments" });
//   }
// });

// // Save new appointment
// app.post("/appointments", async (req, res) => {
//   try {
//     const { name, email, date, doctor } = req.body;

//     const newAppointment = new Appointment({ name, email, date, doctor });
//     await newAppointment.save();

//     res.status(201).json({ success: true, appointment: newAppointment });
//   } catch (error) {
//     console.error("Error saving appointment:", error);
//     res.status(500).json({ error: "Failed to save appointment" });
//   }
// });

// // ✅ CANCEL APPOINTMENT
// app.post("/cancel-appointment", async (req, res) => {
//   const { email, date, doctor, name } = req.body;

//   const transporter = nodemailer.createTransport({
//     service: "Gmail",
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });

//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: email,
//     subject: "Appointment Cancellation",
//     html: `
//       <h3>Appointment Cancelled</h3>
//       <p>Hello <strong>${name}</strong>,</p>
//       <p>Your appointment at <strong>${doctor}</strong> on <strong>${date}</strong> has been cancelled.</p>
//       <p>We hope to see you again at Health Connect.</p>
//     `,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     await Appointment.findOneAndDelete({ email, date, doctor });
//     res.status(200).json({ message: "Appointment cancelled and email sent." });
//   } catch (error) {
//     console.error("Error cancelling appointment:", error);
//     res.status(500).json({ error: "Failed to cancel appointment" });
//   }
// });

// // START SERVER
// app.listen(3001, () => {
//   console.log("Server is running on port 3001");
// });

const nodemailer = require("nodemailer");
require("dotenv").config();
const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
const cors = require("cors");
const BodyMetrics = require("./models/BodyMetrics");
const Health_Connect_Model = require("./models/Health_Connect");
const Appointment = require("./models/Appointment"); // ✅ NEW: import appointment model
const otpStore = new Map(); // In-memory store for OTPs

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log("Database connected successfully!");
    app.listen(3001, () => {
      console.log("Server is running on port 3001");
    });
  })
  .catch((err) => console.error("Database connection error: ", err));

// LOGIN (unchanged)
app.post("/login", (req, res) => {
  const { Email, Password } = req.body;

  Health_Connect_Model.findOne({ Email })
    .then(user => {
      if (user) {
        if (user.Password === Password) {
          res.json({ message: "success", userId: user._id });
        } else {
          res.json({ message: "the password is incorrect" });
        }
      } else {
        res.json({ message: "no record existed" });
      }
    })
    .catch(err => {
      res.status(500).json({ message: "Server error", error: err });
    });
});

// POST /request-otp
app.post('/request-otp', async (req, res) => {
  const { Email } = req.body;
  const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  if (!gmailRegex.test(Email)) {
    return res.status(400).json({ success: false, message: "Only valid Gmail addresses are allowed" });
  }

  // Optional: Rate limiting OTP requests (e.g., one every 15 seconds)
  const current = Date.now();
  const existing = otpStore.get(Email);
  if (existing && current - existing.timestamp < 15000) {
    return res.status(429).json({ success: false, message: "Please wait before requesting a new OTP." });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(Email, { otp, timestamp: current });

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: Email,
    subject: "OTP for Health Connect Signup",
    html: `<p>Your OTP for Health Connect Signup is: <strong>${otp}</strong></p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});


// POST /SignupPage
app.post('/SignupPage', async (req, res) => {
  try {
    const { Email, Password, otp } = req.body;
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(Email)) {
      return res.status(400).json({ success: false, message: "Only valid Gmail addresses are allowed" });
    }

    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongPasswordRegex.test(Password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long, include an uppercase letter, lowercase letter, number, and special character."
      });
    }

    const existing = otpStore.get(Email);
    if (!existing || existing.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    const existingUser = await Health_Connect_Model.findOne({ Email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const newUser = await Health_Connect_Model.create({ Email, Password });
    otpStore.delete(Email);
    res.json({ success: true, user: newUser });

  } catch (error) {
    res.status(400).json({ success: false, message: "Error creating user", error });
  }
});


// METRICS ROUTES (unchanged)
app.post("/save-metrics", async (req, res) => {
  try {
    const { userId, metrics } = req.body;
    if (!userId) return res.status(400).json({ message: "User ID is required" });

    let userMetrics = await BodyMetrics.findOne({ userId });
    if (userMetrics) {
      userMetrics.metrics = metrics;
      await userMetrics.save();
    } else {
      userMetrics = await BodyMetrics.create({ userId, metrics });
    }

    res.json({ success: true, metrics: userMetrics.metrics });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

app.get("/get-metrics/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const userMetrics = await BodyMetrics.findOne({ userId });
    res.json({ metrics: userMetrics ? userMetrics.metrics : {} });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// HOSPITAL SEARCH (unchanged)
const GOOGLE_API_KEY = "AIzaSyBXJrAiZu4ee7hYREDhXYUCYsvuqMbGtx0";
app.get("/api/nearby-hospitals", async (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: "Latitude and longitude required" });

  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json`,
      {
        params: {
          location: `${lat},${lng}`,
          radius: 5000,
          type: "hospital",
          key: GOOGLE_API_KEY,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching hospitals:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch hospitals" });
  }
});

// ✅ APPOINTMENT CONFIRMATION + SAVE TO DB
app.post("/send-confirmation", async (req, res) => {
  const { name, email, date, doctor } = req.body;

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Appointment Confirmation",
    html: `
      <h3>Appointment Confirmation</h3>
      <p>Hello <strong>${name}</strong>,</p>
      <p>Your appointment at <strong>${doctor}</strong> is confirmed.</p>
      <p><strong>Date & Time:</strong> ${date}</p>
      <p>Thank you for using Health Connect!</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    await Appointment.create({ name, email, date, doctor }); // ✅ Save to DB
    res.status(200).json({ message: "Email sent and appointment saved!" });
  } catch (error) {
    console.error("Error sending confirmation:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

// Get all appointments
app.get("/appointments", async (req, res) => {
  try {
    const appointment = await Appointment.find();
    res.status(200).json(appointment);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

// Save new appointment
app.post("/appointments", async (req, res) => {
  try {
    const { name, email, date, doctor } = req.body;

    const newAppointment = new Appointment({ name, email, date, doctor });
    await newAppointment.save();

    res.status(201).json({ success: true, appointment: newAppointment });
  } catch (error) {
    console.error("Error saving appointment:", error);
    res.status(500).json({ error: "Failed to save appointment" });
  }
});

// ✅ CANCEL APPOINTMENT
app.post("/cancel-appointment", async (req, res) => {
  const { email, date, doctor, name } = req.body;

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Appointment Cancellation",
    html: `
      <h3>Appointment Cancelled</h3>
      <p>Hello <strong>${name}</strong>,</p>
      <p>Your appointment at <strong>${doctor}</strong> on <strong>${date}</strong> has been cancelled.</p>
      <p>We hope to see you again at Health Connect.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    await Appointment.findOneAndDelete({ email, date, doctor });
    res.status(200).json({ message: "Appointment cancelled and email sent." });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    res.status(500).json({ error: "Failed to cancel appointment" });
  }
});
