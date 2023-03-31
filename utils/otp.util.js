// const fast2sms = require("fast-two-sms");
const axios = require("axios");

exports.generateOTP = (otp_length) => {
  // Declare a digits variable
  // which stores all digits
  var digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < otp_length; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
};

// exports.sendMsg = async ({ message, contactNumber }, next) => {
//   try {
//     const res = await fast2sms.sendMessage({
//       authorization: process.env.FAST2SMS,
//       message,
//       numbers: [contactNumber],
//     });
//     console.log(contactNumber);
//     console.log(res);
//   } catch (error) {
//     next(error);
//   }
// };
exports.sendMsg = async ({ otp, contactNumber }) => {
  try {
    if (process.env.ENV == "production") {
      const res = await axios.get(
        `https://instantalerts.co/api/web/send?apikey=${process.env.SPRINGEDGE}&sender=SEDEMO&to=91${contactNumber}&message=Hello%2C+${otp}++this+is+a+test+message+from+spring+edge`
      );
    } else {
      console.log(contactNumber);
      console.log(otp);
    }

    // console.log(res);
  } catch (error) {
    console.log(error.message);
  }
};
