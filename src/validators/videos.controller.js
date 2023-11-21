const { body } = require("express-validator")

const uploadCourseVideoValidator = () => {
    return [
        body("title")
            .trim()
            .notEmpty()
            .withMessage("video title is required")
            .escape(),
        body("discription")
            .trim()
            .notEmpty()
            .withMessage("video discriptiton is required")
            .escape(),
        body(" links")
            .optional()
            .isArray()
            .withMessage("links should be an array of strings each string is a link")
            .escape(),

    ]
}

const updateCourseVideoValidator = () => {
    return [
        body("title")
            .trim()
            .optional()
            .escape(),
        body("discription")
            .trim()
            .optional()
            .escape(),
        body(" links")
            .optional()
            .isArray()
            .withMessage("links should be an array of strings each string is a link")
            .escape(),

    ]
}




module.exports = {
    uploadCourseVideoValidator,
    updateCourseVideoValidator
}