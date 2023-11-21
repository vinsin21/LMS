const { body } = require("express-validator")


const addVideoQuestionValidator = () => {
    return [
        body("question")
            .trim()
            .notEmpty()
            .withMessage("comment question is required")
            .isLength({ min: 1, max: 999 })
            .withMessage("comment is only 999 size")
            .escape(),
    ]
}




module.exports = {
    addVideoQuestionValidator
}