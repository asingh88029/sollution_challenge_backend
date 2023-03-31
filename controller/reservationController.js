const User = require("../model/userSchema");
const CustomError = require("../errors");
// const { generateOTP, sendMsg } = require("../utils/otp.util");
// const { createJwtToken } = require("../utils/JwtTokens");
// const cloudinary = require("../utils/cloudinary");
// const Document = require("../model/documentSchema");

const Reservation = require("../model/reservationSchema");

var add_minutes = function (dt, minutes) {
  return new Date(dt.getTime() + minutes * 60000);
};

class ReservationController {
  getAvailableSlot = async (req, res) => {
    let { hospitalId } = req.params;
    let { doctorId } = req.params;

    let reqDate = req.body.date;
    reqDate = reqDate.split("-");
    let reqDay = reqDate[0];
    let reqMonth = reqDate[1];
    let reqYear = reqDate[2];

    const date = new Date(reqYear, reqMonth, reqDay);
    let results = await Reservation.find({
      hospitalId,
      doctorId,
      date: {
        $lt: new Date(reqYear, reqMonth, reqDay, 23, 59),
        $gt: new Date(reqYear, reqMonth, reqDay, 0, 0),
      },
    });

    if (!results[0]) {
      let newDate = new Date(reqYear, reqMonth, reqDay, 10, 0, 0, 0);
      let workingHour = 8;
      let timePerPatient = 15;
      let slotLength = workingHour / (timePerPatient / 60);

      let slots = [];
      for (let i = 0; i < slotLength; i++) {
        let myDate = add_minutes(newDate, i * 15);
        slots.push({
          number: i,
          date: myDate,
        });
      }
      let newReservationSchema = {
        doctorId,
        hospitalId,
        date: newDate,
        slots,
      };
      let reservation = await Reservation.create(newReservationSchema);
      return res
        .status(200)
        .send({ success: true, reservation: [reservation] });
    } else {
      return res.status(200).send({ success: true, reservation: results });
    }
  };

  bookSlot = async (req, res) => {
    try {
      let user = req._id || req.id;
      let { hospitalId } = req.params;
      let { doctorId } = req.params;
      let { reservationId } = req.params;
      let { slotId } = req.params;

      let reservations = await Reservation.findOne({
        _id: reservationId,
        doctorId,
        hospitalId,
      });
      let isChanged = false;
      let slots = reservations.slots;
      for (const iterator of slots) {
        if ((iterator._id == slotId && iterator.status != "booked")) {
          iterator.userId = user;
          iterator.status = "booked";
          isChanged = true;
          iterator._id = iterator._id;
          console.log(iterator);
          break;
        }
      }

      console.log(isChanged);

      if (isChanged) {
        await reservations.save();
      } else {
        throw new CustomError.BadRequestError("Slot already Booked");
      }

      res.status(201).send({ success: true, message: "Reservation Done" });
    } catch (error) {
      console.log(error.message);
      res
        .status(error.status || 400)
        .json({ success: false, message: error.message });
    }
  };
}

module.exports = ReservationController;
