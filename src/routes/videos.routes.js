const { Router } = require("express");
const { verifyJwt, verifyPermission } = require("../middlewares/auth.middleware");
const { UserRoleEnum } = require("../constant");
const { uploadCourseVideoValidator, updateCourseVideoValidator } = require("../validators/videos.controller");
const validates = require("../validators/validates");
const upload = require("../middlewares/multer.middleware");
const { uploadCourseVideos, deleteCourseVideo, updateVideoDetail, getSingleVideo } = require("../controllers/videos.controller");
const { mongodbIdParamValidator } = require("../validators/common/mongodbId.validator");

const router = Router()

router.route("/").post(verifyJwt, verifyPermission(UserRoleEnum.ADMIN), upload.fields([{ name: "video", maxCount: 1 }, { name: "thumbnail", maxCount: 1 }]), uploadCourseVideoValidator(), validates, uploadCourseVideos)// upload new video



router.route("/:videoId").delete(verifyJwt, verifyPermission(UserRoleEnum.ADMIN), mongodbIdParamValidator("videoId"), validates, deleteCourseVideo) // delete video
    .patch(verifyJwt, verifyPermission(UserRoleEnum.ADMIN), updateCourseVideoValidator(), mongodbIdParamValidator("videoId"), validates, updateVideoDetail)// update video content
    .get(verifyJwt, mongodbIdParamValidator("videoId"), validates, getSingleVideo) // only purchased





module.exports = router;