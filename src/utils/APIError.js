class ApiError extends Error {
    constructor(
        statusCode,
        message = "something went wrong",
        error = [],
        stack = "",
    ) {
        super(message)
        this.statusCode = statusCode;
        this.message = message;
        this.error = error;
        this.success = false;

        if (stack) {
            this.stack = stack
        } else {
            this.stack = Error.captureStackTrace(this, this.contructor)
        }
    }
}


module.exports = ApiError