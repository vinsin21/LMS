class ApiResponse {
    constructor(
        statusCode,
        data,
        message,
    ) {
        this.message = message;
        this.success = statusCode < 400
        this.data = data;
        this.statusCode = statusCode || 200
    }
}


module.exports = ApiResponse