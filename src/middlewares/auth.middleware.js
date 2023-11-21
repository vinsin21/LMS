const jwt = require('jsonwebtoken')
const ApiError = require("../utils/APIError");
const asyncHandler = require("../utils/asyncHandler");
const User = require('../models/auth/user.model');

const verifyJwt = asyncHandler(async (req, res, next) => {

    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "")

    if (!token) throw new ApiError(401, "UnAuthenticated plz login");
    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN);

        // const redis = useRedis();
        //const user = await  redis.get(decodedToken._id)
        const user = await User.findById(decodedToken._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry -createdAt -updatedAt")

        if (!user) throw new ApiError(401, "token is invalid or expired")

        req.user = user
        return next()

    } catch (error) {
        throw new ApiError(401, "jwt token is invalid or expired", error)
    }

})


const verifyPermission = (roles = []) => {

    return asyncHandler(async (req, res, next) => {

        if (!req.user?._id) {
            throw new ApiError(401, "unAuthneticated")
        }
        if (roles.includes(req.user?.role)) {
            return next()
        } else {

            throw new ApiError(403, "you are unAUthorized to perform this task")
        }

    })
}



module.exports = {
    verifyJwt,
    verifyPermission
}