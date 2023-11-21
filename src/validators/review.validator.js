const { body } = require("express-validator")

const addReviewToCourseValidator = () => {
    return [
        body("review")
            .trim()
            .notEmpty()
            .withMessage("review is required it cannot be empty")
            .isLength({ min: 5, max: 1500 })
            .withMessage("review length should be between 5-355 characters")
            .escape(),

    ]
}




module.exports = {
    addReviewToCourseValidator,

}