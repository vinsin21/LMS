const { Router } = require("express")
const { verifyJwt, verifyPermission } = require("../middlewares/auth.middleware")
const { UserRoleEnum } = require("../constant")
const { getAllNotification } = require("../controllers/notification.controller")


const router = Router()

router.route("/").get(verifyJwt, verifyPermission(UserRoleEnum.ADMIN), getAllNotification)


module.exports = router