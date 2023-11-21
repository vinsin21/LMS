const { body, query } = require("express-validator")


const jwtTokenBodyValidator = (token) => {
    return [
        body(token)
            .optional()
            .escape()
            .isJWT()
            .withMessage("this is not a jwtToken")
    ]
}
const jwtTokenQueryValidator = (token) => {
    return [
        query(token)
            .optional()
            .escape()
            .isJWT()
            .withMessage("this is not a jwtToken")
    ]
}


module.exports = {
    jwtTokenBodyValidator,
    jwtTokenQueryValidator
}