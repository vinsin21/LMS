const { body, param } = require('express-validator')

const mongodbIdParamValidator = (id) => {
    return [
        param(id)
            .notEmpty()
            .withMessage(`mongoId required`)
            .isMongoId()
            .withMessage(`invalid mongoId ${id}`)
            .escape()

    ]
}

const mongodbIdBodyValidator = (id) => {
    return [
        body(id)
            .notEmpty()
            .withMessage(`mongoId required`)
            .isMongoId()
            .withMessage(`invalid mongoId ${id}`)
            .escape()

    ]
}


module.exports = {
    mongodbIdParamValidator,
    mongodbIdBodyValidator,
}