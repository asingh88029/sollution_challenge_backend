const express = require("express");
const router = express.Router();
const imageUpload = require("../utils/multerImage");
const documentUpload = require("../utils/multerDocument")

const UserController = require("../controller/userController");
const userController = new UserController();

let authenticateUser = require("../middleware/authenticateUser");

router.post("/register", imageUpload.single("image"), userController.register);
router.post("/verifyOtp",userController.verifyOTP)
// router.post("/login", userController.login);
router.post("/login", userController.login);
router.get("/showMe", authenticateUser, userController.showMe);
router.patch(
  "/updateDetails",
  authenticateUser,
  userController.updateUserDetails
);
router.put(
  "/addProfilePic",
  imageUpload.single("image"),
  authenticateUser,
  userController.changeProfilePic
);
router.put(
  "/addDocuments",
  documentUpload.single("document"),
  authenticateUser,
  userController.addDocument
);

router.get(
  "/showMyDocuments/",
  authenticateUser,
  userController.getMyDocuments
);


router.get(
  "/downloadDocument/:documentId",
  authenticateUser,
  userController.downloadDocument
);

router.post("/getUser", userController.getUser);


module.exports = router;
