const express = require("express");
const router = express.Router();
const imageUpload = require("../utils/multerImage");
const authenticateHospital = require("../middleware/authenticateHospital");
const authenticateUser = require("../middleware/authenticateUser");
const HospitalController = require("../controller/hospitalController");
const hospitalController = new HospitalController();

const ReviewController = require("../controller/reviewController");
const reviewController = new ReviewController();

const apicache = require("apicache");
apicache.options({
  appendKey: (req, res) =>
    req.body.latitude.toFixed(process.env.CACHE_PRECISION) +
    req.body.longitude.toFixed(process.env.CACHE_PRECISION) +
    req.body.radius +
    req.body.mode,
});
let cache = apicache.middleware;

router.post(
  "/register",
  imageUpload.single("image"),
  hospitalController.register
);

router.post("/verifyOtp", hospitalController.verifyOTP);

router.post("/login", hospitalController.login);
router.post(
  "/addAssets",
  authenticateHospital,
  hospitalController.addHospitalAssets
);
router.patch(
  "/updateAssets",
  authenticateHospital,
  hospitalController.updateHospitalAssets
);
router.patch(
  "/updateDetails/",
  authenticateHospital,
  hospitalController.updateHospitalDetails
);
router.post(
  "/getNearbyHospitals",
  // cache("10 minutes"),
  hospitalController.getNearbyHospitals
);

router.post(
  "/getNearbyHospitalsWithFilter",
  // cache("10 minutes"),
  hospitalController.getNearbyHospitalsWithFilter
);

router.put(
  "/uploadImage",
  authenticateHospital,
  imageUpload.single("image"),
  hospitalController.uploadImage
);

router.get("/doctors/:doctorId", hospitalController.getDoctors);

router.get("/details/:id", hospitalController.getHospitalDetails);

router.get("/unverifiedHospitals/", hospitalController.getUnverifiedHospital);
router.get("/verifiedHospitals/", hospitalController.getVerifiedHospital);


router.get("/showMe", authenticateHospital, hospitalController.showMe);

router.post("/addReview", authenticateUser, reviewController.addReview);
router.patch(
  "/updateReview/:reviewId",
  authenticateUser,
  reviewController.updateReview
);
router.delete(
  "/deleteReview/:reviewId",
  authenticateUser,
  reviewController.deleteReview
);

// Get a Review by id
router.get(
  "/getReview/:reviewId",
  // authenticateUser,
  reviewController.getReview
);

// Get All reviews Of a Hospital
router.get("/getReviews/:hospitalId", reviewController.getAllReviews);

// Get specific review of a specific user of a hospital
router.get("/getOneReview/:hospitalId/:userId", reviewController.getOneReview);

// Get My Reviews of a certain Hospital
router.get(
  "/getMyReview/:hospitalId",
  authenticateUser,
  reviewController.getMyReview
);
// Get All My Reviews
router.get("/getMyReviews/", authenticateUser, reviewController.getMyReviews);

module.exports = router;
