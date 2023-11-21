const { body } = require('express-validator')
const asyncHandler = require('../utils/asyncHandler')



const createCourseValidator = () => {
    return [
        body("title")
            .trim()
            .notEmpty()
            .withMessage("title field is required")
            .escape(),
        body("description")
            .trim()
            .notEmpty()
            .withMessage("description field is required")
            .escape(),
        body("price")
            .trim()
            .notEmpty()
            .withMessage("price field is required")
            .isNumeric()
            .withMessage("price should be a numberic value")
            .escape(),
        body("discountPrice")
            .optional()
            .trim()
            .isNumeric()
            .withMessage("discountPrice should be a numberic value")
            .escape(),
        body("tags")
            .optional()
            .isArray()
            .withMessage("tags filed should be an array")
            .escape(),
        body("rating")
            .trim()
            .optional()
            .isLength({ min: 0, max: 5 })
            .withMessage("rating range is between 0-5")
            .escape(),

    ]
}

const updateCourseDetailsValidator = () => {
    return [
        body("title")
            .trim()
            .optional()
            .escape(),
        body("description")
            .trim()
            .optional()
            .escape(),
        body("price")
            .trim()
            .optional()
            .isNumeric()
            .withMessage("price should be a numberic value")
            .escape(),
        body("discountPrice")
            .optional()
            .trim()
            .isNumeric()
            .withMessage("discountPrice should be a numberic value")
            .escape(),
        body("tags")
            .optional()
            .isArray()
            .withMessage("tags filed should be an array")
            .escape(),
        body("rating")
            .trim()
            .optional()
            .isLength({ min: 0, max: 5 })
            .withMessage("rating range is between 0-5")
            .escape(),

    ]
}


module.exports = {
    createCourseValidator,
    updateCourseDetailsValidator
}