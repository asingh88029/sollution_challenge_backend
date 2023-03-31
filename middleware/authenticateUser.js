const { UnauthenticatedError } = require("../errors");
const { verifyJwtToken } = require("../utils/JwtTokens");

const authenticateUser = async (req, res, next) => {
  try {
    let { authorization } = req.headers;
    if (!authorization) throw new UnauthenticatedError("User not logged In");

    const tokenDetails = authorization.split(" ");
    const tokenType = tokenDetails[0];
    const token = tokenDetails[1];

    const decodedData = await verifyJwtToken(token);
    console.log(decodedData);
    let id = decodedData.loginDetails._id;
    console.log(id);
    req.id = id;
    console.log(req.id);
    next();
  } catch (error) {
    console.log(error.message);
    res.status(error.statusCode || 400).send({success:false,message:error.message});
  }
};

module.exports = authenticateUser;
