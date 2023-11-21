const { Router } = require("express")
const { registerUserValidator, verifyOtpValidator, loginValidator, forgottenPasswordRequestValidator, resetForgottenPasswordValidator, changePasswordValidator, assignRoleValidator } = require("../validators/user.validator")
const validates = require("../validators/validates")
const { registerUser, verifyOtp, login, logout, refreshAccessToken, forgottenPasswordRequest, resetForgottenPassword, resendEmailVerification, changePassword, getCurrentUser, getAllUsers, assignRole } = require("../controllers/user.controller")
const { verifyJwt, verifyPermission } = require("../middlewares/auth.middleware")
const { jwtTokenBodyValidator, jwtTokenQueryValidator } = require("../validators/common/jwtToken.validator")
const { UserRoleEnum } = require("../constant")
const { mongodbIdParamValidator } = require("../validators/common/mongodbId.validator")

const router = Router()

//register
router.route('/register').post(registerUserValidator(), validates, registerUser)
router.route("/verify-otp").post(verifyOtpValidator(), validates, verifyOtp)
router.route("/login").post(loginValidator(), validates, login)
router.route("/refresh-token").get(verifyJwt, jwtTokenBodyValidator("refreshToken"), jwtTokenQueryValidator("refreshToken"), validates, refreshAccessToken)
router.route("/forgot-password").post(forgottenPasswordRequestValidator(), validates, forgottenPasswordRequest)
router.route("/reset-forgotten-password").post(resetForgottenPasswordValidator(), validates, resetForgottenPassword)

//secure routes
router.route("/logout").post(verifyJwt, logout)
router.route("/resend-email-verification").post(verifyJwt, resendEmailVerification)
router.route("/change-password").post(verifyJwt, changePasswordValidator(), validates, changePassword)
router.route("/current-user").get(verifyJwt, getCurrentUser)
router.route("/upload-avatar").post()

router.route("/").get(verifyJwt, verifyPermission(UserRoleEnum.ADMIN), getAllUsers)
router.route("/assign-role/:userId").post(verifyJwt, verifyPermission(UserRoleEnum.ADMIN), mongodbIdParamValidator("userId"), assignRoleValidator(), validates, assignRole)

// TODO: SSO routes



module.exports = router
