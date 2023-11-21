const { default: mongoose } = require("mongoose")
const ApiError = require("../utils/APIError");
const { removeUnusedMulterImageFilesOnError } = require("../utils/helper");

const errorHandler = (err, req, res, next) => {
    let error = err

    if (!(error instanceof ApiError)) {

        const statusCode = error.statusCode || error instanceof mongoose.Error ? 400 : 500;

        const message = error.message || "something went wrong"

        // if (err.name === "CastError") {
        //     message = `resourse not found. Invalid ${err.path}`
        // }

        // if (err.name === 11000) {
        //     message = `Duplicate ${Object.keys(err.KeyValue)} entered`
        // }

        // if (err.name === "JsonWebTokenError") {
        //     message = "Jsonwebtoken is invalid try again"
        // }

        // if (err.name === "TokenExpiredError") {
        //     message = "Json web token is expired, try again"
        // }

        error = new ApiError(statusCode, message, error?.errors || [], err.stack)
    }

    const response = {
        ...error,
        message: error.message,
        ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {})
    }

    removeUnusedMulterImageFilesOnError(req)

    return res.status(error.statusCode).json(response)

}

module.exports = errorHandler