const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');

const { avialableLoginType, LoginTypeEnum, avialableUserRoles, UserRoleEnum, ActivationTokenExpiry } = require("../../constant");
const SocialProfile = require("../profile.model");
const ApiError = require("../../utils/APIError");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate-v2");


const userSchema = new mongoose.Schema({

    avatar: {
        type: {
            url: String,
            localPath: String,
            public_id: String,
        },
        // default: {
        //     url: "",
        //     localPath: "",
        //     public_id: ""
        // }
    },
    username: {
        type: String,
        unique: true,
        index: true,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    refreshToken: {
        type: String,
    },
    loginType: {
        type: String,
        enum: avialableLoginType,
        default: LoginTypeEnum.EMAIL_PASSWORD

    },
    role: {
        type: String,
        enum: avialableUserRoles,
        default: UserRoleEnum.USER
    },
    emailVerificationToken: {
        type: String
    },
    emailVerificationExpiry: {
        type: Date,
    },
    passwordVerificationToken: {
        type: String,
    },
    passwordVerificationExpiry: {
        type: Date,
    },
    courses: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Course"
    }

}, { timestamps: true })



userSchema.pre("save", async function (next) {

    if (!this.isModified("password")) return next()


    this.password = await bcrypt.hash(this.password, 10)

    return next()
})

userSchema.pre("save", async function (next) {
    try {
        const profile = await SocialProfile.findOne({ owner: this._id })

        if (!profile) {
            await SocialProfile.create({ owner: this._id })
        }

        next()

    } catch (error) {
        console.log(error)
        throw new ApiError(500, "something went wrong while creating socialPofile after craeting new user", error)
    }

})

userSchema.methods.comparePassword = async function (userPassword) {
    return await bcrypt.compare(userPassword, this.password)
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        username: this.username,
        email: this.email,
        role: this.role,
        _id: this._id,
        courses: this.courses,
    },
        process.env.ACCESS_TOKEN,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        _id: this._id
    },
        process.env.REFRESH_TOKEN,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    )
}

userSchema.methods.generateOtpCode = function () {

    const token = Math.floor(1000 + Math.random() * 9000).toString();
    const hashToken = crypto.createHash("sha256").update(token).digest("hex")
    const tokenExpiry = Date.now() + ActivationTokenExpiry;

    return { token, hashToken, tokenExpiry }

}

userSchema.plugin(mongooseAggregatePaginate)

const User = mongoose.model("User", userSchema)

module.exports = User