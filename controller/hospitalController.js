const DoctorToHospital = require("../model/doctorToHospitalSchema");
const Hospital = require("../model/hospitalSchema");
const hospitalCoordinates = require("../model/hospitalCoordinatesSchema");
const hospitalAssets = require("../model/hospitalAssetsSchema");
const CustomError = require("../errors");
const cloudinary = require("../utils/cloudinary");
const NodeCache = require("node-cache");
const { generateOTP, sendMsg } = require("../utils/otp.util");

const { createJwtToken } = require("../utils/JwtTokens");
const getDistanceFromLatLonInKm = require("../utils/getDistanceFromLatLonInKm");
const getDistanceMatrix = require("../utils/getDistanceMatrix");
const cacheKeyGenerator = require("../utils/cacheKeyGenerator");

const myCache = new NodeCache();
const flatDistanceCache = new NodeCache();
const hospitalDetailsCache = new NodeCache();

const cityList = require("../Filter/cityList");
const diseaseList = require("../Filter/diseaseList");
const departmentList = require("../Filter/departmentList");
const specialityList = require("../Filter/specialityList");
const tagList = require("../Filter/tagList");
const hospitalTypes = require("../Filter/hospitalType");
const stateList = require("../Filter/stateList");

const doctorToHospital = require("../model/doctorToHospitalSchema");

const bubbleSort = (arr = []) => {
  let swapped;
  do {
    swapped = false;
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i].location.distance > arr[i + 1].location.distance) {
        let temp = arr[i];
        arr[i] = arr[i + 1];
        arr[i + 1] = temp;
        swapped = true;
      }
    }
  } while (swapped);
};

class HospitalController {
  // register Hospital
  register = async (req, res) => {
    try {
      const { hospitalName, hospitalType, email, phoneNumber, contactInfo } =
        req.body;
      const hospital = {
        hospitalName,
        hospitalType,
        email,
        phoneNumber,
        contactInfo,
      };
      let registeredHospital = await Hospital.create(hospital);

      let hospitalId = registeredHospital._id;
      let { coordinates } = req.body;
      if (coordinates) {
        let { latitude, longitude } = coordinates;
        let insertedCoordinates = await hospitalCoordinates.create({
          hospitalId,
          latitude,
          longitude,
        });
        registeredHospital.location = insertedCoordinates._id;
        // console.log(hospitalcoordinates.hospitalCoordinates);
        await registeredHospital.save();
      }

      const otp = generateOTP(6);
      console.log(otp);
      // save otp to user collection
      registeredHospital.phoneOtp = otp;
      await registeredHospital.save();
      // send otp to phone number
      await sendMsg({
        otp: `${otp}`,
        contactNumber: registeredHospital.phoneNumber,
      });
      res.status(200).send({
        success: true,
        message: `A 6 digit otp is sent on ${phoneNumber}`,
      });
    } catch (error) {
      console.log(error.message);
      res
        .status(error.statusCode || 400)
        .send({ success: false, message: error.message });
    }
  };
  // verify otp
  verifyOTP = async (req, res) => {
    try {
      const { phoneNumber, phoneOtp } = req.body;
      if (!phoneNumber) {
        throw new CustomError.BadRequestError("Please provide mobile number");
      }
      if (phoneOtp.length != 6) {
        throw new CustomError.BadRequestError("Please provide mobile number");
      }
      const hospital = await Hospital.findOne({ phoneNumber, phoneOtp });
      if (!hospital) {
        throw new CustomError.BadRequestError("Something went wrong");
      }
      hospital.phoneOtp = "";
      await hospital.save();

      let loginDetails = hospital.getLoginDetails();
      let token = await createJwtToken({ loginDetails, scope: "hospital" });
      let bearerToken = {
        type: "Bearer",
        token,
        scope: "hospital",
      };
      res.status(200).send({ success: true, data: bearerToken, hospital });
    } catch (error) {
      console.log(error.message);
      res
        .status(error.statusCode || 400)
        .send({ success: false, message: error.message });
    }
  };
  // login as hospital Admin
  login = async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      if (!phoneNumber) {
        throw new CustomError.BadRequestError("Please provide phone number");
      }

      const hospital = await Hospital.findOne({ phoneNumber });

      if (!hospital) {
        throw new CustomError.UnauthenticatedError(
          "No Hospital is associated with this number"
        );
      }

      const otp = generateOTP(6);
      // save otp to user collection
      hospital.phoneOtp = otp;
      await hospital.save();
      // send otp to phone number
      await sendMsg({
        otp: `${otp}`,
        contactNumber: hospital.phoneNumber,
      });
      res.status(200).send({
        success: true,
        message: `A 6 digit otp is sent on ${phoneNumber}`,
      });
    } catch (error) {
      console.log(error.message);
      res
        .status(error.statusCode || 400)
        .send({ success: false, message: error.message });
    }
  };
  // update hospital details
  updateHospitalDetails = async (req, res) => {
    try {
      let id = req.hospital._id || req.hospital.id;
      const {
        hospitalName,
        hospitalType,
        contactInfo,
        email,
        openingTime,
        closingTime,
      } = req.body;

      const hospital = {
        email,
        hospitalName,
        hospitalType,
        contactInfo,
        openingTime,
        closingTime,
      };

      let updatedHospital = await Hospital.findByIdAndUpdate(id, hospital, {
        new: true,
      });
      res.send(updatedHospital);
    } catch (error) {
      console.log(error.message);
      res
        .status(error.statusCode || 400)
        .send({ success: false, message: error.message });
    }
  };
  // Add Hospital Assets
  addHospitalAssets = async (req, res) => {
    try {
      let hospitalId = req.hospital._id || req.hospital.id;
      console.log(hospitalId);
      let {
        numberOfDoctors,
        numberOfPatients,
        numberOfActivePatients,
        totalBeds,
        occupiedBeds,
        website,
      } = req.body;
      let hospital = await Hospital.findById(hospitalId);
      if (!hospital) throw new CustomError.NotFoundError("Hospital Not Found");
      if (hospital["assets"] !== undefined)
        throw new CustomError.BadRequestError("Assets are already defined");

      const assets = await hospitalAssets.create({
        hospitalId,
        numberOfDoctors,
        numberOfPatients,
        numberOfActivePatients,
        totalBeds,
        occupiedBeds,
        website,
      });

      hospital.assets = assets._id;
      await hospital.save();

      res.send(hospital);
    } catch (error) {
      console.log(error.message);
      res
        .status(error.statusCode || 400)
        .send({ success: false, message: error.message });
    }
  };
  // Update Hospital Assets
  updateHospitalAssets = async (req, res) => {
    // checking authorization and authentication here
    try {
      let hospitalId = req.hospital._id || req.hospital.id;
      let {
        // numberOfDoctors,
        // numberOfPatients,
        // numberOfActivePatients,
        totalBeds,
        // occupiedBeds,
        website,
      } = req.body;

      let hospital = await Hospital.findById(hospitalId);
      if (!hospital) throw new CustomError.NotFoundError("Hospital Not Found");
      const assets = await hospitalAssets.findOneAndUpdate(
        { hospitalId },
        {
          // numberOfDoctors,
          // numberOfPatients,
          // numberOfActivePatients,
          totalBeds,
          // occupiedBeds,
          website,
        },
        { new: true }
      );
      res.send(assets);
    } catch (error) {
      console.log(error.message);
      res
        .status(error.statusCode || 400)
        .send({ success: false, message: error.message });
    }
  };
  // get all hospital near me
  getNearbyHospitals = async (req, res) => {
    console.log("Hello..");
    try {
      console.time();
      let minLat, maxLat, minLong, maxLong, range;

      let { latitude, longitude } = req.body;
      console.log(latitude, longitude);
      if (!latitude || !longitude) {
        throw new CustomError.BadRequestError("Location is Invalid");
      }
      let { radius } = req.body || process.env.DEFAULT_RADIUS;
      let { mode } = req.body || "L";

      //  1 latitude = 111km
      // My Formula For Range , Completely hypothetical but working
      range = (1 / 111) * (radius + 1);
      minLat = latitude - range;
      maxLat = latitude + range;
      minLong = longitude - range;
      maxLong = longitude + range;

      let hospitals = await hospitalCoordinates
        .find({
          latitude: { $gte: minLat, $lte: maxLat },
          longitude: { $gte: minLong, $lte: maxLong },
        })
        .limit(process.env.HOSPITAL_LIMIT);

      let nearbyHospitals = [];
      // Time Complexity = O(n^3)
      for (const hospital of hospitals) {
        // break;
        let accuracy = process.env.MAP_ACCURACY;
        // 1 = 100 %
        // 0.9 = 89 % // Seems Perfect to me
        // 0.8 = 75 %
        // 0.7 = 58 %
        // Decreasing accuracy will increase speed

        let key = cacheKeyGenerator(
          latitude,
          longitude,
          hospital.latitude,
          hospital.longitude
        );

        let flatLineDistance = flatDistanceCache.get(key);
        if (flatLineDistance == undefined) {
          flatLineDistance =
            getDistanceFromLatLonInKm(
              latitude,
              longitude,
              hospital.latitude,
              hospital.longitude
            ) *
            (1 / accuracy);
          flatDistanceCache.set(key, flatLineDistance, 10000);
          console.log("Not Fount In Flat Line Cache");
        } else {
          console.log("Found in Flat Line Cache " + flatLineDistance);
        }

        // Flat line distance is used to save time that will be used to call google matrix api
        if (flatLineDistance < radius) {
          let origin, destination, res, distance;
          origin = latitude + "," + longitude;
          destination = hospital.latitude + "," + hospital.longitude;

          distance = myCache.get(key);
          if (distance == undefined) {
            console.log("Not found in Accurate Distance cache");
            // Time Complexity = o(n^2)
            res = await getDistanceMatrix(origin, destination);
            try {
              distance = res.data.rows[0].elements[0].distance.value;
            } catch (error) {
              continue;
            }
            if (distance) {
              myCache.set(key, distance, 10000);
            } else {
              continue;
            }
          } else {
            console.log("Found in Accurate Distance Cache " + distance);
          }

          if (distance > radius * 1000) continue;
          let newHospital = {
            _id: hospital._id,
            hospitalId: hospital.hospitalId,
            latitude: hospital.latitude,
            longitude: hospital.longitude,
            estimatedDistance: flatLineDistance.toFixed(4) * 1000,
            distance,
          };
          nearbyHospitals.push(newHospital);
        }
        // break;
      }
      if (mode == "L") {
        // console.timeEnd();
        return res.send(nearbyHospitals);
      } else if (mode == "D") {
        let nearbyHospitalInDetails = [];
        for (const location of nearbyHospitals) {
          let id = location.hospitalId.toString();

          // let hospitalDetails = hospitalDetailsCache.get(id);
          // if (hospitalDetails == undefined) {
          let hospitalDetails = await Hospital.findById(id);
          // hospitalDetailsCache.set(
          //     id,
          //     hospitalDetails,
          //     process.env.HOSPITAL_REFRESH_TIME
          //   );
          //   console.log("Not Found in Hospital Cache");
          // } else {
          //   console.log("Found in Hospital Cache");
          // }

          let newHospital = { location };
          newHospital.details = hospitalDetails;
          nearbyHospitalInDetails.push(newHospital);
        }
        console.log(nearbyHospitalInDetails);
        bubbleSort(nearbyHospitalInDetails);
        res.send(nearbyHospitalInDetails);
        // console.timeEnd();
      }
    } catch (error) {
      console.log(error);
      res
        .status(error.statusCode || 400)
        .send({ success: false, message: error.message });
    }
  };

  getNearbyHospitalsWithFilter = async (req, res) => {
    console.log("Hello..");
    try {
      let minLat, maxLat, minLong, maxLong, range;

      let { latitude, longitude } = req.body;
      console.log(latitude, longitude);
      if (!latitude || !longitude) {
        throw new CustomError.BadRequestError("Location is Invalid");
      }
      let { radius } = req.body || process.env.DEFAULT_RADIUS;
      let { mode } = req.body || "L";

      //  1 latitude = 111km
      // My Formula For Range , Completely hypothetical but working
      range = (1 / 111) * (radius + 1);
      minLat = latitude - range;
      maxLat = latitude + range;
      minLong = longitude - range;
      maxLong = longitude + range;

      let hospitals = await hospitalCoordinates
        .find({
          latitude: { $gte: minLat, $lte: maxLat },
          longitude: { $gte: minLong, $lte: maxLong },
        })
        .limit(process.env.HOSPITAL_LIMIT);

      console.log(hospitals);

      let nearbyHospitals = [];
      // Time Complexity = O(n^3)
      for (const hospital of hospitals) {
        // break;
        let accuracy = process.env.MAP_ACCURACY;
        // 1 = 100 %
        // 0.9 = 89 % // Seems Perfect to me
        // 0.8 = 75 %
        // 0.7 = 58 %
        // Decreasing accuracy will increase speed

        let key = cacheKeyGenerator(
          latitude,
          longitude,
          hospital.latitude,
          hospital.longitude
        );

        let flatLineDistance = flatDistanceCache.get(key);
        if (flatLineDistance == undefined) {
          flatLineDistance =
            getDistanceFromLatLonInKm(
              latitude,
              longitude,
              hospital.latitude,
              hospital.longitude
            ) *
            (1 / accuracy);
          flatDistanceCache.set(key, flatLineDistance, 10000);
          console.log("Not Fount In Flat Line Cache");
        } else {
          console.log("Found in Flat Line Cache " + flatLineDistance);
        }

        // Flat line distance is used to save time that will be used to call google matrix api
        if (flatLineDistance < radius) {
          let origin, destination, res, distance;
          origin = latitude + "," + longitude;
          destination = hospital.latitude + "," + hospital.longitude;

          distance = myCache.get(key);
          if (distance == undefined) {
            console.log("Not found in Accurate Distance cache");
            // Time Complexity = o(n^2)
            res = await getDistanceMatrix(origin, destination);
            try {
              distance = res.data.rows[0].elements[0].distance.value;
            } catch (error) {
              continue;
            }
            if (distance) {
              myCache.set(key, distance, 10000);
            } else {
              continue;
            }
          } else {
            console.log("Found in Accurate Distance Cache " + distance);
          }

          if (distance > radius * 1000) continue;
          let newHospital = {
            _id: hospital._id,
            hospitalId: hospital.hospitalId,
            latitude: hospital.latitude,
            longitude: hospital.longitude,
            estimatedDistance: flatLineDistance.toFixed(4) * 1000,
            distance,
          };
          nearbyHospitals.push(newHospital);
        }
        // break;
      }
      if (mode == "L") {
        // console.timeEnd();
        return res.send(nearbyHospitals);
      } else if (mode == "D") {
        let nearbyHospitalInDetails = [];
        for (const location of nearbyHospitals) {
          let id = location.hospitalId.toString();

          // let hospitalDetails = hospitalDetailsCache.get(id);
          // if (hospitalDetails == undefined) {
          let hospitalDetails = await Hospital.findById(id);
          // hospitalDetailsCache.set(
          //     id,
          //     hospitalDetails,
          //     process.env.HOSPITAL_REFRESH_TIME
          //   );
          //   console.log("Not Found in Hospital Cache");
          // } else {
          //   console.log("Found in Hospital Cache");
          // }

          let newHospital = { location };
          newHospital.details = hospitalDetails;
          nearbyHospitalInDetails.push(newHospital);
        }

        let { query } = req.body;

        if (!query) {
          return res.status(200).send(nearbyHospitalInDetails);
        }

        query = query.toLowerCase()

        let queryList = query.split(" ");
        let cities = [];
        let diseases = [];
        let departments = [];
        let speciality = [];
        let tags = [];
        let hTypes = [];
        let sector = [];
        let states = [];
        for (let i = 0; i < query.length; i++) {
          const element = queryList[i];
          // speciality check

          if (element == "private") {
            sector.push["private"];
          }
          if (element == "government") {
            sector.push["government"];
          }

          let isSpeciality = specialityList.includes(element);
          if (isSpeciality) {
            speciality.push(element);
          }
          let isDepartment = departmentList.includes(element);
          if (isDepartment) {
            departments.push(element);
          }
          let isCity = cityList.includes(element);
          if (isCity) {
            cities.push(element);
          }
          let isDisease = diseaseList.includes(element);
          if (isDisease) {
            diseases.push(element);
          }
          let isTag = tagList.includes(element);
          if (isTag) {
            tags.push(element);
          }
          let ishType = hospitalTypes.includes(element);
          if (ishType) {
            hTypes.push(element);
          }
          let isState = stateList.includes(element);
          if (isState) {
            states.push(element);
          }
        }

        console.log("speciality", speciality);
        console.log("departments", departments);
        console.log("cities", cities);
        console.log("diseases", diseases);
        console.log("tags", tags);
        console.log("hospitalTypes", hTypes);
        console.log("states", states);
        console.log("exit");

        let filteredData = [];

        let flag = false;
        for (const hospital of nearbyHospitalInDetails) {
          // speciality Check
          for (let i = 0; i < speciality.length; i++) {
            const element = speciality[i];
            const lower = hospital.details.specialities.map((element) => {
              return element.toLowerCase();
            });
            console.log(lower);

            if (lower.includes(element.toLowerCase())) {
              console.log(element);
              console.log("Passed");
              filteredData.push(hospital);
              flag = true;
              break;
            }
          }
          if (flag == true) {
            flag = false;
            continue;
          }
          // departments check
          for (let i = 0; i < departments.length; i++) {
            const element = departments[i];
            console.log(element);
            console.log(hospital.details.departments);

            const lower = hospital.details.departments.map((element) => {
              return element.toLowerCase();
            });
            console.log(lower);

            if (lower.includes(element.toLowerCase())) {
              console.log(element);
              console.log("Passed");
              filteredData.push(hospital);
              flag = true;
              continue;
            }
          }
          if (flag == true) {
            flag = false;
            continue;
          }
          // // Diseases Check
          for (let i = 0; i < diseases.length; i++) {
            console.log("disease", diseases);
            const element = diseases[i];
            try {
              const lower = hospital.details.diseases.map((element) => {
                return element.toLowerCase();
              });
              console.log(lower);
              if (lower.includes(element.toLowerCase())) {
                console.log(element);
                console.log("passed");
                filteredData.push(hospital);
                flag = true;
                break;
              }
            } catch (error) {
              console.log(error.message);
            }
          }
          if (flag == true) {
            flag = false;
            continue;
          }

          // // tags check
          for (let i = 0; i < tags.length; i++) {
            const element = tags[i];
            const lower = hospital.details.tags.map((element) => {
              return element.toLowerCase();
            });
            try {
              if (lower.includes(element.toLowerCase())) {
                console.log(element);
                console.log("passed");
                filteredData.push(hospital);
                flag = true;
                break;
              }
            } catch (error) {
              console.log(error.message);
            }
          }
          if (flag == true) {
            flag = false;
            continue;
          }
          // // cities check
          for (let i = 0; i < cities.length; i++) {
            const element = cities[i];
            try {
              const lower = hospital.details.contactInfo.address.city;
              console.log(lower);
              if (lower == element.toLowerCase()) {
                console.log(element);
                console.log("passed");
                filteredData.push(hospital);
                flag = true;
                break;
              }
            } catch (error) {
              console.log(error.message);
            }
          }
          if (flag == true) {
            flag = false;
            continue;
          }

          //  hospital Type
          for (let i = 0; i < hTypes.length; i++) {
            const element = hTypes[i];
            try {
              const lower = hospital.details.hospitalType.map((element) => {
                return element.toLowerCase();
              });
              if (lower == element.toLowerCase()) {
                console.log(element);
                console.log("passed");
                filteredData.push(hospital);
                flag = true;
                break;
              }
            } catch (error) {
              console.log(error.message);
            }
          }
          if (flag == true) {
            flag = false;
            continue;
          }
          //  hospital Sector
          for (let i = 0; i < sector.length; i++) {
            const element = sector[i];
            try {
              const lower = hospital.details.sector.toLowerCase();
              if (lower == element.toLowerCase()) {
                console.log(element);
                console.log("passed");
                filteredData.push(hospital);
                flag = true;
                break;
              }
            } catch (error) {
              console.log(error.message);
            }
          }
          if (flag == true) {
            flag = false;
            continue;
          }

          // state check
          for (let i = 0; i < states.length; i++) {
            const element = states[i];
            try {
              const lower = hospital.details.contactInfo.address.state.toLowerCase();
              console.log(lower);
              console.log(element);
              if (lower == element.toLowerCase()) {
                console.log(element);
                console.log("passed");
                filteredData.push(hospital);
                flag = true;
                break;
              }
            } catch (error) {
              console.log(error.message);
            }
          }
          if (flag == true) {
            flag = false;
            continue;
          }
        }
        // console.log(filteredData);
        bubbleSort(filteredData);

        res.send(filteredData);
      }
      // console.timeEnd()
    } catch (error) {
      console.log(error);
      res
        .status(error.statusCode || 400)
        .send({ success: false, message: error.message });
    }
  };
  // Add Hospital Coordinates
  addHospitalCoordinates = async (req, res) => {
    try {
      let { hospitalId, latitude, longitude } = req.body;

      if (!hospitalId && !latitude && !longitude) {
        throw new CustomError.BadRequestError("Invalid Details");
      }
      let hospital = await Hospital.findById(hospitalId);
      if (!hospital) throw new CustomError.NotFoundError("Hospital Not Found");

      let location = await hospitalCoordinates.create({
        hospitalId,
        latitude,
        longitude,
      });

      hospital.location = location._id;
      await hospital.save();

      res.send(hospitals, location);
    } catch (error) {
      console.log(error.message);
      res
        .status(error.statusCode || 400)
        .send({ success: false, message: error.message });
    }
  };
  // Get Hospital Details
  getHospitalDetails = async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new CustomError.BadRequestError("Invalid Hospotal ID");
      }
      let hospital = await Hospital.findById(id);
      hospital = await hospital.populate("location");
      hospital = await hospital.populate("assets");

      return res.send(hospital);
    } catch (error) {
      console.log(error.message);
      res
        .status(error.statusCode || 400)
        .send({ success: false, message: error.message });
    }
  };
  // show me
  showMe = async (req, res) => {
    try {
      const id = req.hospital._id || req.hospital.id;
      console.log(id);
      let hospital = await Hospital.findById(id);
      hospital = await hospital.populate("location");
      hospital = await hospital.populate("assets");
      console.log(hospital);
      return res.send(hospital);
    } catch (error) {
      console.log(error.message);
      res
        .status(error.statusCode || 400)
        .send({ success: false, message: error.message });
    }
  };
  // Upload Hospital Images
  uploadImage = async (req, res) => {
    try {
      const id = req.hospital._id || req.hospital.id;
      const result = await cloudinary.uploader.upload(req.file.path);
      let image = result.secure_url;

      const hospital = await Hospital.findById(id);
      hospital["images"].push(image);

      await hospital.save();

      res.status(202).send(hospital);
    } catch (error) {
      console.log(error.message);
      res
        .status(error.statusCode || 400)
        .send({ success: false, message: error.message });
    }
  };

  getDoctors = async (req, res) => {
    try {
      const id = req.params.doctorId;

      doctorToHospital
        .find({ hospital: id })
        .populate("doctor")
        // .populate("hospital")
        .exec(function (err, users) {
          if (err) throw err;
          res.send(users);
        });
    } catch (error) {
      console.log(error.message);
      res
        .status(error.statusCode || 400)
        .send({ success: false, message: error.message });
    }
  };
  getUnverifiedHospital = async (req, res) => {
    try {
      let hospital = await Hospital.find({isVerified:false});
      return res.send(hospital);
    } catch (error) {
      console.log(error.message);
      res
        .status(error.statusCode || 400)
        .send({ success: false, message: error.message });
    }
  };
  getVerifiedHospital = async (req, res) => {
    try {
      let hospital = await Hospital.find({isVerified:true}).select(`-images`);
      return res.send(hospital);
    } catch (error) {
      console.log(error.message);
      res
        .status(error.statusCode || 400)
        .send({ success: false, message: error.message });
    }
  };
}

module.exports = HospitalController;
