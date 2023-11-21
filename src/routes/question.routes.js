const { Router } = require("express");
const { mongodbIdParamValidator } = require("../validators/common/mongodbId.validator");
const { addVideoQuestionValidator } = require("../validators/question.validator");
const validates = require("../validators/validates");
const { addVideoQuestion, deleteVideoQuestion, updateVideoQuestion } = require("../controllers/question.controller");
const { verifyJwt } = require("../middlewares/auth.middleware");


const router = Router()

router.route("/:videoId").post(verifyJwt, mongodbIdParamValidator("videoId"), addVideoQuestionValidator(), validates, addVideoQuestion)

router.route('/:questionId').delete(verifyJwt, mongodbIdParamValidator("questionId"), validates, deleteVideoQuestion)
    .patch(verifyJwt, mongodbIdParamValidator("questionId"), addVideoQuestionValidator(), validates, updateVideoQuestion)



module.exports = router;