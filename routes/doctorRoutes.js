const express = require("express");
const router = express.Router();

const authenticateHospital = require("../middleware/authenticateHospital");
const authenticateDoctor = require("../middleware/authenticateDoctor");

const DoctorController = require("../controller/doctorController.js");
const doctorController = new DoctorController();

router.post("/addDoctor", authenticateHospital, doctorController.addDoctor);
router.post("/doctor/login", doctorController.loginWithPhone);
router.post("/doctor/login/verifyOTP", doctorController.verifyOTP);
router.get(
  "/doctor/showMe",
  authenticateDoctor,
  doctorController.showMe
);

module.exports = router;
