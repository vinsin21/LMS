const { Router } = require("express");
const { addReviewToCourse, updateReviewToCourse, deleteReviewOfCourse, getAllReviewsOfCourse } = require("../controllers/review.controller");
const { verifyJwt } = require("../middlewares/auth.middleware");
const { mongodbIdParamValidator } = require("../validators/common/mongodbId.validator");
const validates = require("../validators/validates");
const { addReviewToCourseValidator } = require("../validators/review.validator");

const router = Router();




router.route("/:courseId").post(verifyJwt, mongodbIdParamValidator("courseId"), addReviewToCourseValidator(), validates, addReviewToCourse)
    .get(getAllReviewsOfCourse)




router.route("/:reviewId").patch(verifyJwt, mongodbIdParamValidator("reviewId"), addReviewToCourseValidator(), validates, updateReviewToCourse)
    .delete(verifyJwt, mongodbIdParamValidator("reviewId"), deleteReviewOfCourse)



module.exports = router
