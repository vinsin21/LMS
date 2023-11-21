const { Router } = require('express')
const { editProfileValidator } = require('../validators/profile.validator')
const validates = require('../validators/validates')
const { verifyJwt } = require('../middlewares/auth.middleware')
const { editProfile, getMyProfile } = require('../controllers/profile.controller')

const router = Router()

router.use(verifyJwt)
router.route("/").post(editProfileValidator(), validates, editProfile)
    .get(getMyProfile)

module.exports = router