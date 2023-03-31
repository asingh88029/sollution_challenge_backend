const express = require("express");
const router = express.Router();
const AdminController = require("./../controller/adminController");
const adminController  = new AdminController()

const adminAuth = require("../middleware/authenticateAdmin")

router.post("/login", adminController.login);
router.post("/verifyOtp", adminController.verifyOTP);
router.post("/verifyHospital", adminAuth, adminController.verifyHospitals);

module.exports = router;
