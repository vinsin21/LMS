const { body } = require("express-validator");
const { avialableUserRoles } = require("../constant");

const registerUserValidator = () => {
    return [
        body("username")
            .trim()
            .notEmpty()
            .withMessage("username cannot be empty")
            .custom((value) => {
                if (value.includes(" ")) {
                    return false;
                } else {
                    return true
                }

            })
            .withMessage("username should not contain spaces")
            .escape(),
        body("email")
            .trim()
            .notEmpty()
            .withMessage("email is required")
            .isEmail()
            .withMessage("email is invalid")
            .escape(),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("password is required")
            .isLength({ min: 8 })
            .withMessage("password should be atleast 8 character long")
            .isAlphanumeric()
            .withMessage("password should contain alphabat and numbers")
            .escape(),
        body("role")
            .trim()
            .toUpperCase()
            .isIn(avialableUserRoles)
            .withMessage("invalid user role ")

    ]

}

const verifyOtpValidator = () => {
    return [
        body("otp")
            .trim()
            .notEmpty()
            .withMessage("otp is required")
            .isNumeric()
            .withMessage("invalid otp")
            .isLength({ min: 4, max: 4 })
            .withMessage("invalid otp length")
            .escape()
    ]
}

const loginValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("email is required")
            .isEmail()
            .withMessage("email is invalid")
            .escape(),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("password is required")
            .isLength({ min: 8 })
            .withMessage("password should be atleast 8 character long")
            .isAlphanumeric()
            .withMessage("password should contain alphabat and numbers")
            .escape(),
    ]
}

const forgottenPasswordRequestValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("email is required")
            .isEmail()
            .withMessage("email is invalid")
            .escape(),
    ]
}

const resetForgottenPasswordValidator = () => {

    return [

        body("newPassword")
            .trim()
            .notEmpty()
            .withMessage("password  is required")
            .isLength({ min: 8 })
            .withMessage("password should be atleast 8 character long")
            .isAlphanumeric()
            .withMessage("password should contain alphabat and numbers")
            .escape(),
        body("otp")
            .trim()
            .notEmpty()
            .withMessage("otp is required")
            .isNumeric()
            .withMessage("invalid otp")
            .isLength({ min: 4, max: 4 })
            .withMessage("invalid otp length")
            .escape()
    ]
}

const changePasswordValidator = () => {
    return [
        body("oldPassword")
            .trim()
            .notEmpty()
            .withMessage("password is required")
            .isLength({ min: 8 })
            .withMessage("password should be atleast 8 character long")
            .isAlphanumeric()
            .withMessage("password should contain alphabat and numbers")
            .escape(),
        body("newPassword")
            .trim()
            .notEmpty()
            .withMessage("password is required")
            .isLength({ min: 8 })
            .withMessage("password should be atleast 8 character long")
            .isAlphanumeric()
            .withMessage("password should contain alphabat and numbers")
            .escape(),
    ]
}

const assignRoleValidator = () => {
    return [
        body("role")
            .trim()
            .toUpperCase()
            .isIn(avialableUserRoles)
            .withMessage("invalid role ")
            .escape(),
    ]
}

module.exports = {
    registerUserValidator,
    verifyOtpValidator,
    loginValidator,
    forgottenPasswordRequestValidator,
    resetForgottenPasswordValidator,
    changePasswordValidator,
    assignRoleValidator
}