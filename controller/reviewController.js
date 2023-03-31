const mongoose = require("mongoose");
const Hospital = require("../model/hospitalSchema");
const User = require("../model/userSchema");
const HospitalReview = require("../model/hospitalReviewsSchema");
const CustomError = require("../errors");

class ReviewController {
  // Add Review
  addReview = async (req, res) => {
    try {
      const userId = req.id;
      // verify user exist
      const { comment, rating, hospitalId } = req.body;
      //verify hospital Exist
      const hospital = await Hospital.findById(hospitalId);
      if (!hospital) {
        throw new CustomError.NotFoundError("Hospital does not exist");
      }
      const review = {
        hospitalId,
        userId,
        comment,
        rating,
      };
      // await HospitalReview.deleteMany();
      // Creating Review
      const hospitalReview = await HospitalReview.create(review);

      hospital.reviews.push(hospitalReview._id);
      await hospital.save();

      res.status(200).send({
        success: true,
        messege: "Added Review",
        review: hospitalReview,
      });
    } catch (error) {
      if (error.name == "MongoServerError") {
        return res.status(400).send({
          success: false,
          message: "Can not add more than 1 review of same hospital",
        });
      } else if (error.name == "CastError") {
        return res.status(400).send({
          success: false,
          message: "Invalid HospitalId",
        });
      }
      return res
        .status(error.statusCode || 400)
        .send({ success: false, message: error.message });
    }
  };
  // Update Review By Id
  updateReview = async (req, res) => {
    try {
      const userId = req.id;
      const { reviewId } = req.params;
      let { comment, rating } = req.body;

      const updatedReview = await HospitalReview.findOneAndUpdate(
        {
          _id: reviewId,
          userId: userId,
        },
        {
          comment,
          rating,
        },
        { new: true, runValidators: true }
      );

      res.status(202).send({
        success: true,
        message: "Review Updated Successfully",
      });
    } catch (error) {
      if (error.name == "CastError") {
        return res.status(400).send({
          success: false,
          message: "Invalid Review Id",
        });
      }
      return res.status(error.statusCode || 400).send({
        success: false,
        message: error.message,
      });
    }
  };
  // Delete Review By Id
  deleteReview = async (req, res) => {
    try {
      const userId = req.id;
      const { reviewId } = req.params;

      const review = await HospitalReview.findOne({
        _id: reviewId,
        userId,
      });

      let result = review.deleteOne();

      res.status(200).send({
        success: true,
        message: "Review Deleted Successfully",
      });
    } catch (error) {
      console.log(error.message);
      res.status(error.statusCode || 400).send({
        success: false,
        message: error.message,
      });
    }
  };
  // Get Review By Id
  getReview = async (req, res) => {
    try {
      let { reviewId } = req.params;
      const review = await HospitalReview.findById(reviewId).populate("userId");

      let userReview = { review };
      let reviewer = {
        profilePic: review.userId.avatar.secure_url,
        name: review.userId.name,
      };
      review.userId = review.userId._id;
      userReview.reviewer = reviewer;

      res.status(200).send({
        success: true,
        reviews: userReview,
      });
    } catch (error) {
      console.log(error.message);
      if (error.name == "CastError") {
        return res.status(400).send({
          success: false,
          message: "Invalid Id ",
        });
      }
      res.status(error.statusCode || 400).send({
        success: false,
        message: error.message,
      });
    }
  };
  // Get All reviews Of a Hospital
  getAllReviews = async (req, res) => {
    try {
      let { hospitalId } = req.params;
      console.log(hospitalId);
      const reviews = await HospitalReview.find({ hospitalId }).populate(
        "userId"
      );

      console.log(reviews);

      let allReviews = [];

      for (const review of reviews) {
        let userReview = { review };
        let reviewer;
        if (review.userId.avatar) {
          reviewer = {
            profilePic: review.userId.avatar.secure_url,
            name: review.userId.name,
          };
        } else {
          reviewer = {
            profilePic: null,
            name: review.userId.name,
          };
        }
        review.userId = review.userId._id;
        userReview.reviewer = reviewer;

        allReviews.push(userReview);
      }

      res.status(200).send({
        success: true,
        reviews: allReviews,
      });
    } catch (error) {
      console.log(error.message);
      if (error.name == "CastError") {
        return res.status(400).send({
          success: false,
          message: "Invalid HospitalId",
        });
      }
      res.status(error.statusCode || 400).send({
        success: false,
        message: error.message,
      });
    }
  };
  // Get A single review of a person for a hospital
  getOneReview = async (req, res) => {
    try {
      let { hospitalId, userId } = req.params;
      const review = await HospitalReview.findOne({
        hospitalId,
        userId,
      }).populate("userId");

      let userReview = { review };
      let reviewer = {
        profilePic: review.userId.avatar.secure_url,
        name: review.userId.name,
      };
      review.userId = review.userId._id;
      userReview.reviewer = reviewer;

      res.status(200).send({
        success: true,
        reviews: userReview,
      });
    } catch (error) {
      console.log(error.message);
      if (error.name == "CastError") {
        return res.status(400).send({
          success: false,
          message: "Invalid Id ",
        });
      }
      res.status(error.statusCode || 400).send({
        success: false,
        message: error.message,
      });
    }
  };
  // since its current User Reviews assuming no need for name and image
  getMyReview = async (req, res) => {
    try {
      let { hospitalId } = req.params;
      let userId = req.id;

      let review = await HospitalReview.findOne({
        hospitalId,
        userId,
      });

      res.status(200).send({
        success: true,
        review: review,
      });
    } catch (error) {
      console.log(error.message);
      if (error.name == "CastError") {
        return res.status(400).send({
          success: false,
          message: "Invalid Id ",
        });
      }
      res.status(error.statusCode || 400).send({
        success: false,
        message: error.message,
      });
    }
  };
  // since its current User Reviews assuming no need for name and image
  getMyReviews = async (req, res) => {
    try {
      let userId = req.id;
      const reviews = await HospitalReview.find({ userId });
      res.status(200).send({
        success: true,
        reviews,
      });
    } catch (error) {
      console.log(error.message);
      if (error.name == "CastError") {
        return res.status(400).send({
          success: false,
          message: "Invalid Id ",
        });
      }
      res.status(error.statusCode || 400).send({
        success: false,
        message: error.message,
      });
    }
  };
}

module.exports = ReviewController;
