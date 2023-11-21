const User = require("../models/auth/user.model");
const SocialProfile = require("../models/profile.model");
const ApiError = require("../utils/APIError");
const ApiResponse = require("../utils/APIResponse");
const asyncHandler = require("../utils/asyncHandler");

const editProfile = asyncHandler(async (req, res) => {
    const { firstName, lastName, bio } = req.body


    const user = await User.findById(req.user?._id);
    if (!user) throw new ApiError("un-authenticated");

    const profile = await SocialProfile.findOneAndUpdate(
        { owner: req.user?._id },
        {
            $set: {
                firstName,
                lastName,
                bio
            }
        },
        { new: true }
    )

    if (!profile) throw new ApiError(500, "sorry something went wrong cannot update profile")



    return res.status(new ApiResponse(200, { profile }, "profile updated successfully"))

})

const getMyProfile = asyncHandler(async (req, res) => {
    const profile = await SocialProfile.findById(req.user?._id);

    return res.status(200).json(new ApiResponse(200, { profile }, "profile fetch successfully"))

})

module.exports = {
    editProfile,
    getMyProfile
}