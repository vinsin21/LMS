const crypto = require("crypto");
const cloudinary = require('cloudinary')
const jwt = require("jsonwebtoken")
const { UserRoleEnum, LoginTypeEnum, avialableUserRoles } = require("../constant");
const User = require("../models/auth/user.model");
const ApiError = require("../utils/APIError");
const ApiResponse = require("../utils/APIResponse");
const asyncHandler = require("../utils/asyncHandler");
const { sendMail, emailVerificationCodeMailgenContent, forgottenPasswordCodeMailgenContent } = require("../utils/mail");
//const redis = require("../db/redis");
const useRedis = require("../db/redis");
const { getMongoosePaginationOptions } = require("../utils/helper");


const generateAccessAndRefreshToken = async (userId) => {
    try {

        const user = await User.findById(userId)

        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "sometihng went wrong while generating login token")
    }
}


const registerUser = asyncHandler(async (req, res) => {

    const { username, email, password, role } = req.body

    const userExist = await User.findOne({ username, email })
    if (userExist) throw new ApiError(409, "user with this email already exist")

    const user = await User.create({
        username,
        email,
        password,
        role: role || UserRoleEnum.USER,
        isVerified: false,
    })

    const { token, hashToken, tokenExpiry } = await user.generateOtpCode();

    user.emailVerificationToken = hashToken;
    user.emailVerificationExpiry = tokenExpiry;
    await user.save({ validateBeforeSave: false });

    //send mail
    await sendMail({
        email: user.email,
        subject: "verify you email to create you LMS account",
        mailgenContent: emailVerificationCodeMailgenContent(
            user.username,
            token,
        )
    })


    const registeredUser = await User.findById(user._id).select("-password -refreshTooken -emailVerificationToken -emailVerificationExpiry -role")

    if (!registeredUser) throw new ApiError(404, "user not created!! something went wrong plz try again");


    return res.status(201).json(new ApiResponse(201, { user: registeredUser }, "account verification link is send to you email plz go and verify"))

})


const verifyOtp = asyncHandler(async (req, res) => {
    const { otp } = req.body

    if (!otp) throw new ApiError(400, "otp is required plz send")


    const hashToken = crypto.createHash("sha256").update(otp).digest("hex")

    const user = await User.findOne({
        emailVerificationToken: hashToken,
        emailVerificationExpiry: { $gte: Date.now() },
    })

    if (!user) throw new ApiError(404, "otp is invalid or expired");

    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    user.isVerified = true;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, {}, "account verified successfully"))



})

const login = asyncHandler(async (req, res) => {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    // 404 status code : not found 
    if (!user) throw new ApiError(404, "you are not registered plz signup")

    if (user.loginType !== LoginTypeEnum.EMAIL_PASSWORD) {
        throw new ApiError(400, `you are registerd using ${user.loginType} method!! SO plz use the same method ${user.loginType} to login`)
    }

    const correctPassword = await user.comparePassword(password)
    if (!correctPassword) throw new ApiError(401, "invalid credentails");

    // generate acccess and refresh token 
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const options = {
        //  maxAge: 60 * 60 * 1000, // 1 hour
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
        //sameSite: 'Strict',      // strict , lax, none
        //domain: 'yourdomain.com',
        //path: '/',
    }

    const loginUser = await User.findById(user._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry ")

    // upload session to redis
    // const redis = useRedis();
    // redis.set(user._id, JSON.stringify(loginUser))

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { user: loginUser }, "user login successfully"))


})

const logout = asyncHandler(async (req, res) => {

    //const redis = userRedis();
    //const userId = req.user?_.id || "";
    //redis.del(userId)
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: null,
            }
        },
        { new: true }
    );


    return res.status(200)
        .clearCookie("accessToken")
        .clearCookie("refreshToken")
        .json(new ApiResponse(200, {}, "logout successfully"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {

    const oldRefreshToken = req.body?.refreshToken || req.query?.refreshToken

    const decodedToken = jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN);

    if (!decodedToken) throw new ApiError(404, "token expired or invalid")

    // const session = await redis.get(decodedToken._id)
    // if !session throw Error    

    const user = await User.findOne({
        _id: decodedToken._id,
        refreshToken: oldRefreshToken
    })

    if (!user) throw new ApiError(404, "token expired or already used")

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "development",
    }

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { accessToken, refreshToken }, "access token refresh successfully"))



})

const forgottenPasswordRequest = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) throw new ApiError(404, "no user with this email is registered");

    if (user.loginType !== LoginTypeEnum.EMAIL_PASSWORD) {
        throw new ApiError(400, `you are registered using ${user.loginType} method so so go to your ${user.loginType} provider and try to set new password `)
    }

    const { token, hashToken, tokenExpiry } = await user.generateOtpCode();
    user.passwordVerificationToken = hashToken;
    user.passwordVerificationExpiry = tokenExpiry;
    await user.save({ validateBeforeSave: false })

    await sendMail({
        email: user.email,
        subject: "forgotten password reset request dont forgot you password this time",
        mailgenContent: forgottenPasswordCodeMailgenContent(user.username, token)
    })


    return res.status(200).json(new ApiResponse(200, {}, "We have send you a reset Password code to your email-id"))


})


const resetForgottenPassword = asyncHandler(async (req, res) => {
    const { newPassword, otp } = req.body

    if (!otp) throw new ApiError("otp is required");

    const hashToken = crypto.createHash("sha256").update(otp).digest("hex");

    const user = await User.findOne({
        passwordVerificationToken: hashToken,
        passwordVerificationExpiry: { $gte: Date.now() }
    })

    if (!user) throw new ApiError(404, "otp is invlaid or already used or expired");

    user.passwordVerificationToken = undefined;
    user.passwordVerificationExpiry = undefined;
    user.password = newPassword;

    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, {}, "password reset successfully dont forget password again!"));


})

// This controller is called when user is logged in and he has snackbar that your email is not verified
// In case he did not get the email or the email verification token is expired
// he will be able to resend the token while he is logged in
const resendEmailVerification = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user?._id);

    if (!user) throw new ApiError(404, "user does not exist")

    if (user.isVerified === true) throw new ApiError(409, "email is already verified")

    const { token, hashToken, tokenExpiry } = user.generateOtpCode();

    user.emailVerificationToken = hashToken;
    user.emailVerificationExpiry = tokenExpiry;
    await user.save({ validateBeforeSave: false });

    //send mail
    await sendMail({
        email: user.email,
        subject: "Plz verify you email to create you LMS account",
        mailgenContent: emailVerificationCodeMailgenContent(
            user.username,
            token,
        )
    })


    return res.status(200).json(new ApiResponse(200, {}, "email verification code is send to you email id"))

})

const changePassword = asyncHandler(async (req, res) => {

    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id)

    if (!user) throw new ApiError(404, "user not found");

    const correctPassword = await user.comparePassword(oldPassword);

    if (!correctPassword) throw new ApiError(409, "invlaid credentials");

    user.password = newPassword;

    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, {}, "Password changes successfully"));



})

const getCurrentUser = asyncHandler(async (req, res) => {

    return res.status(200).json(new ApiResponse(200, { user: req.user }, "current user fetch successfully"))
})


//using clodinary
const uploadAvatar = asyncHandler(async (req, res) => {
    const { avatar } = req.body

    const userId = req.user?._id;

    const user = await User.findById(userId);

    if (avatar && user) {
        if (user?.avatar?.public_id) {
            await cloudinary.v2.uploader.destroy(user?.avatar?.public_id)

            const myCloud = await cloudinary.v2.uploader.upload(avatar, {
                folder: "avatar",
                width: 150,
            });
            user.avatar = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            }
        }
        else {
            const myCloud = await cloudinary.v2.uploader.upload(avatar, {
                folder: "avatar",
                width: 150,
            });
            user.avatar = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            }
        }

    }

    await user.save({ validateBeforeSave: false })

    res.status(200).json(new ApiResponse(200, {}, "avatar uploded"))

})

// ONly for admin
const getAllUsers = asyncHandler(async (req, res) => {

    const { page = 1, limit = 10 } = req.query

    const usersAggregate = User.aggregate([
        {
            $match: {}
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $lookup: {
                from: "socialprofiles",
                localField: "_id",
                foreignField: "owner",
                as: "profile",
                pipeline: [
                    {
                        $project: {
                            firstName: 1,
                            lastName: 1,

                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                profile: { $first: "$profile" }
            }
        },
        {
            $unwind: "$courses"
        },
        {
            $lookup: {
                from: "courses",
                localField: "courses",
                foreignField: "_id",
                as: "courses",
                pipeline: [
                    {
                        $project: {
                            title: 1,
                            price: 1,
                            description: 1
                        }
                    }
                ]

            }
        },
        {
            $group: {
                _id: "$_id",
                username: { $first: "$username" },
                email: { $first: "$email" },
                role: { $first: "$role" },
                profile: { $first: "$profile" },
                courses: { $push: { $arrayElemAt: ["$courses", 0] } },
            }
        },

    ])

    const users = await User.aggregatePaginate(
        usersAggregate,
        getMongoosePaginationOptions({
            page,
            limit,
            customLabels: {
                docs: "users",
                totalUsers: "totalUsers"
            }
        })
    )

    if (!users) throw new ApiError(500, "something went wrong in server while fetching all users")


    return res.status(200).json(new ApiResponse(200, users, "All users fetch successfully"))

})

const assignRole = asyncHandler(async (req, res) => {
    const { userId } = req.params
    const { role } = req.body;
    //check user exist 
    const user = await User.findById(userId);

    if (!user) throw new ApiError(404, "no user with this id exist");

    user.role = role
    await user.save({ validateBeforeSave: false })

    return res.status(200).json(new ApiResponse(200, {}, "user role updated successfully"))


})


module.exports = {
    registerUser,
    verifyOtp,
    login,
    logout,
    refreshAccessToken,
    forgottenPasswordRequest,
    resetForgottenPassword,
    resendEmailVerification,
    changePassword,
    getCurrentUser,
    getAllUsers,
    assignRole
}