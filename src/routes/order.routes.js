const { Router } = require("express")
const { verifyJwt, verifyPermission } = require("../middlewares/auth.middleware")
const { purchaseCourse, getAllOrdersDetail } = require("../controllers/order.controller")
const { mongodbIdBodyValidator } = require("../validators/common/mongodbId.validator")
const validates = require("../validators/validates")
const { UserRoleEnum } = require("../constant")


const router = Router()

router.route("/").post(verifyJwt, mongodbIdBodyValidator("courseId"), validates, purchaseCourse)
    .get(verifyJwt, verifyPermission(UserRoleEnum.ADMIN), getAllOrdersDetail)


module.exports = router