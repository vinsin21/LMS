const { Router } = require("express");
const validates = require("../validators/validates");
const { addQuestionReplyValidator, updateQuestionReplyValidator } = require("../validators/reply.validator");
const { mongodbIdParamValidator } = require("../validators/common/mongodbId.validator");
const { verifyJwt } = require("../middlewares/auth.middleware");
const { addReplyToQuestion, deleteReplyToQuestion, updateReplyToQuestion } = require("../controllers/reply.controller");

const router = Router()


router.route("/:questionId").post(verifyJwt, mongodbIdParamValidator("questionId"), addQuestionReplyValidator(), validates, addReplyToQuestion)

router.route("/:replyId").delete(verifyJwt, mongodbIdParamValidator("replyId"), validates, deleteReplyToQuestion)
    .patch(verifyJwt, mongodbIdParamValidator("replyId"), updateQuestionReplyValidator(), validates, updateReplyToQuestion)


module.exports = router

