const { body } = require('express-validator')


const editProfileValidator = () => {
    return [
        body("firstName")
            .trim()
            .notEmpty()
            .withMessage("firstName cannot be empty")
            .escape(),
        body("lastName")
            .optional()
            .trim()
            .escape(),
        body("bio")
            .trim()
            .notEmpty()
            .withMessage("bio cannot be empty")
            .escape()
    ]
}


module.exports = {
    editProfileValidator
}