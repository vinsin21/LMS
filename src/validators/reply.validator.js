const { body } = require("express-validator")


const addQuestionReplyValidator = () => {
    return [
        body("reply")
            .trim()
            .notEmpty()
            .withMessage("comment question is required")
            .isLength({ min: 1, max: 999 })
            .withMessage("comment is only 999 size")
            .escape(),
    ]
}


const updateQuestionReplyValidator = () => {
    return [
        body("reply")
            .trim()
            .notEmpty()
            .withMessage("comment question is required")
            .isLength({ min: 1, max: 999 })
            .withMessage("comment is only 999 size")
            .escape(),
    ]
}



module.exports = {
    addQuestionReplyValidator,
    updateQuestionReplyValidator
}