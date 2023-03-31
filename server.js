const express = require("express");
const connect = require("./config/connect");
const cors = require("cors");
require("dotenv").config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const hospitalRoutes = require("./routes/hospitalRoutes");
const userRoutes = require("./routes/userRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const reservationRoutes = require("./routes/reservationRoute");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");

app.use("/admin/", adminRoutes);
app.use("/hospital/", hospitalRoutes);
app.use("/hospital/", doctorRoutes);
app.use("/user/", userRoutes);
app.use("/chatbot/", chatbotRoutes);
app.use("/hospital/", reservationRoutes);
app.use("/auth/", authRoutes);

const department = require("./data/departmentList");
const speciality = require("./data/specialityList");

app.get("/department", async (req, res) => {
  res.status(200).json({ success: true, department });
});
app.get("/speciality", async (req, res) => {
  res.status(200).json({ success: true, speciality });
});

const start = async () => {
  await connect();
  app.listen(4000, () => {
    console.log("listening on 4000");
  });
};

start();
