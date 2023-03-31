const jwt = require("jsonwebtoken");

async function createJwtToken(payload) {
  var token = await jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  let expiresIn = await verifyJwtToken(token)
  expiresIn = expiresIn.exp
  let data = {token , expiresIn }

  return data;
}

async function verifyJwtToken(token) {
  let verifiedData = await jwt.verify(token, process.env.JWT_SECRET);
  return verifiedData;
}

module.exports = { createJwtToken, verifyJwtToken };
