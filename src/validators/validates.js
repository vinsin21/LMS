const { validationResult } = require("express-validator");
const ApiError = require("../utils/APIError");



const validates = (req, res, next) => {

    const errors = validationResult(req)

    if (errors.isEmpty()) {
        return next()
    }

    const extraactedErrors = []

    errors.array().map((err) => extraactedErrors.push({ [err.path]: err.msg }))

    const error = new ApiError(404, "validation field error", extraactedErrors);
    return next(error);

    /* errors.array() looks like this
    "errors": [
    {
      "location": "query",
      "msg": "Invalid value",
      "path": "person",
      "type": "field"
    }
  ]
    */


}

module.exports = validates

