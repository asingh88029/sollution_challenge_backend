const { UnauthenticatedError } = require("../errors");
const { verifyJwtToken } = require("../utils/JwtTokens");

const authenticateHospital = async (req, res, next) => {
  try {
    let { authorization } = req.headers;
    if (!authorization) throw new UnauthenticatedError("Session Expired");

    const tokenDetails = authorization.split(" ");
    const tokenType = tokenDetails[0];
    const token = tokenDetails[1];
    const decodedData = await verifyJwtToken(token);
    console.log(decodedData);
    req.hospital = decodedData.loginDetails;

    if (!decodedData.scope == "hospital") {
      throw new UnauthenticatedError(
        "Seems like this JWT doen't have this access"
      );
    }

    console.log("Hello");

    next();
  } catch (error) {
    console.log(error.message);
    res.status(error.statusCode || 400).send({success:false,message:error.message});
  }
};

module.exports = authenticateHospital;
