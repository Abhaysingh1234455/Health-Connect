// const nodemailer = require("nodemailer");
// require("dotenv").config();
// const express = require("express");
// const axios = require("axios");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const BodyMetrics = require("./models/BodyMetrics");
// const Health_Connect_Model = require("./models/Health_Connect");

// const app = express();
// app.use(express.json());
// app.use(cors());

// // Connect to MongoDB
// mongoose.connect("mongodb://127.0.0.1:27017/Health_Connect")
//   .then(() => console.log("Database connected successfully!"))
//   .catch((err) => console.error("Database connection error: ", err));

// // Login route
// app.post("/login", (req, res) => {
//   const { Email, Password } = req.body;

//   Health_Connect_Model.findOne({ Email })
//     .then(user => {
//       if (user) {
//         if (user.Password === Password) {
//           res.json({ message: "success", userId: user._id }); // ✅ Now sending an object
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

// // Signup route
// app.post('/SignupPage', async (req, res) => {
//   try {
//     const { Email, Password } = req.body;

//     // ✅ Check if the email is a valid Gmail address
//     const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
//     if (!gmailRegex.test(Email)) {
//       return res.status(400).json({ success: false, message: "Only valid Gmail addresses are allowed" });
//     }
    
//     // Create new user in the database
//     const newUser = await Health_Connect_Model.create({ Email, Password });
//     res.json({ success: true, user: newUser });

//   } catch (error) {
//     res.status(400).json({ success: false, message: "Error creating user", error });
//   }
// });

// // Save or Update User Body Metrics
// app.post("/save-metrics", async (req, res) => {
//   try {
//     const { userId, metrics } = req.body;

//     if (!userId) {
//       return res.status(400).json({ message: "User ID is required" });
//     }

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

// // Get User-Specific Metrics
// app.get("/get-metrics/:userId", async (req, res) => {
//   try {
//     const { userId } = req.params;

//     const userMetrics = await BodyMetrics.findOne({ userId });

//     if (!userMetrics) {
//       return res.json({ metrics: {} });  // Return empty object if no metrics found
//     }

//     res.json({ metrics: userMetrics.metrics });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// });


// const GOOGLE_API_KEY = "AIzaSyBXJrAiZu4ee7hYREDhXYUCYsvuqMbGtx0";

// app.get("/api/nearby-hospitals", async (req, res) => {
//   const { lat, lng } = req.query;

//   if (!lat || !lng) {
//     return res.status(400).json({ error: "Latitude and longitude required" });
//   }

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

// require("dotenv").config();

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
//       <p>Your appointment with <strong>${doctor}</strong> is confirmed.</p>
//       <p><strong>Date & Time:</strong> ${date}</p>
//       <p>Thank you for using Health Connect!</p>
//     `,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     res.status(200).json({ message: "Email sent successfully" });
//   } catch (error) {
//     console.error("Error sending email:", error);
//     res.status(500).json({ error: "Failed to send email" });
//   }
// });
// // Start the server
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

// Login route
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

// Signup route
app.post('/SignupPage', async (req, res) => {
  try {
    const { Email, Password } = req.body;

    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(Email)) {
      return res.status(400).json({ success: false, message: "Only valid Gmail addresses are allowed" });
    }

    const newUser = await Health_Connect_Model.create({ Email, Password });
    res.json({ success: true, user: newUser });
  } catch (error) {
    res.status(400).json({ success: false, message: "Error creating user", error });
  }
});

// Save or Update User Body Metrics
app.post("/save-metrics", async (req, res) => {
  try {
    const { userId, metrics } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

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

// Get User-Specific Metrics
app.get("/get-metrics/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const userMetrics = await BodyMetrics.findOne({ userId });

    if (!userMetrics) {
      return res.json({ metrics: {} });
    }

    res.json({ metrics: userMetrics.metrics });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

const GOOGLE_API_KEY = "AIzaSyBXJrAiZu4ee7hYREDhXYUCYsvuqMbGtx0";

app.get("/api/nearby-hospitals", async (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: "Latitude and longitude required" });
  }

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

// Send appointment confirmation email
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
      <p>Your appointment with <strong>${doctor}</strong> is confirmed.</p>
      <p><strong>Date & Time:</strong> ${date}</p>
      <p>Thank you for using Health Connect!</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});
