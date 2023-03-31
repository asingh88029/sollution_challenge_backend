const express = require("express");
const router = express.Router();
const AuthController = require("./../controller/authController");
const authController = new AuthController();

router.post("/checkRoles", authController.checkRoles);

module.exports = router;
