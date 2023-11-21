const { Router } = require('express')
const { createCourseValidator, updateCourseDetailsValidator } = require('../validators/course.validator')
const validates = require('../validators/validates')
const { createCourse, updateThumbnail, updateCourseDetail, deleteCourse, getSingleCourseWithoutPurchase, getAllCoursesWithoutPurchase, getSinglePurchasedCourse } = require('../controllers/courses.controller')
const { verifyJwt, verifyPermission } = require('../middlewares/auth.middleware')
const { UserRoleEnum } = require('../constant')
const upload = require('../middlewares/multer.middleware')
const { mongodbIdParamValidator } = require('../validators/common/mongodbId.validator')


const router = Router()

//create course, getAllCourseWithoutPurchase
router.route("/").post(verifyJwt, verifyPermission(UserRoleEnum.ADMIN), upload.single("thumbnail"), createCourseValidator(), validates, createCourse)
    .get(getAllCoursesWithoutPurchase)
//update Course Thumbnail 
router.route("/thumbnail/:courseId").post(verifyJwt, verifyPermission(UserRoleEnum.ADMIN), upload.single("thumbnail"), updateThumbnail);

//update,delete,getCourseWithOutPurchase
router.route("/:courseId").patch(verifyJwt, verifyPermission(UserRoleEnum.ADMIN), mongodbIdParamValidator("courseId"), updateCourseDetailsValidator(), validates, updateCourseDetail)
    .delete(verifyJwt, verifyPermission(UserRoleEnum.ADMIN), mongodbIdParamValidator("courseId"), deleteCourse)
    .get(getSingleCourseWithoutPurchase)



// puchases course 
router.route("/p/:courseId").get(verifyJwt, getSinglePurchasedCourse)



module.exports = router