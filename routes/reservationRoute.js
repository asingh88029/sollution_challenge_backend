const express = require("express");
const router = express.Router();

const ReservationController = require("../controller/reservationController");
let reservationController = new ReservationController()

let authenticateUser = require("../middleware/authenticateUser");

router.post(
  "/getSlot/:hospitalId/:doctorId",
  authenticateUser,
  reservationController.getAvailableSlot
);

router.post(
  "/getSlot/doctor/:hospitalId/:doctorId",
  reservationController.getAvailableSlot
);

router.post(
  "/bookSlot/:hospitalId/:doctorId/:reservationId/:slotId",
  authenticateUser,
  reservationController.bookSlot
);

module.exports = router;