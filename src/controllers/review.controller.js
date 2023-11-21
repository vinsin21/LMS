const { default: mongoose } = require("mongoose");
const Course = require("../models/courses.model");
const CourseReview = require("../models/review.model");
const ApiError = require("../utils/APIError");
const ApiResponse = require("../utils/APIResponse");
const asyncHandler = require("../utils/asyncHandler");
const { getMongoosePaginationOptions } = require("../utils/helper");


const addReviewToCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const { review } = req.body;





    const courseExist = await Course.findById(courseId)

    if (!courseExist) throw new ApiError(404, "no course with this courseId exist")

    if (!req.user?.courses.includes(courseId.toString())) {
        throw new ApiError(403, `You have to purchase the course to access this video`)
    }

    const createdReview = await CourseReview.create({
        review,
        courseId,
        owner: req.user?._id
    })

    if (!createdReview) throw new ApiError(500, "something went wrong in server while creating new review")

    return res.status(201).json(new ApiResponse(201, { review: createdReview }, "review added successfully"))

})

const updateReviewToCourse = asyncHandler(async (req, res) => {
    const { reviewId } = req.params;
    const { review } = req.body;


    const updatedReview = await CourseReview.findOneAndUpdate(
        {
            _id: reviewId,
            owner: req.user?._id,
        },
        {
            $set: {
                review: review
            }
        },
        { new: true });



    if (!updatedReview) throw new ApiError(500, "id is invalid something went wrong in server while updating review")

    return res.status(201).json(new ApiResponse(201, { newReview: updatedReview }, "review updated successfully"))

})

const deleteReviewOfCourse = asyncHandler(async (req, res) => {
    const { reviewId } = req.params;

    const deletedReview = await CourseReview.findOneAndDelete(
        {
            _id: reviewId,
            owner: req.user?._id
        });

    if (!deletedReview) throw new ApiError(500, "id is invalid or something went wrong in the server while deleteing review")

    return res.status(200).json(new ApiResponse(200, { deletedReview }, "review deleted successfully"))

})

const getAllReviewsOfCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.params
    const { page = 1, limit = 5 } = req.query

    const courseExist = await Course.findById(courseId)

    if (!courseExist) throw new ApiError(404, "no course with this id Exist");


    const reviewAggregate = CourseReview.aggregate([
        {
            $match: {
                courseId: new mongoose.Types.ObjectId(courseId),
            }
        },
        {
            $lookup: {
                from: "courses",
                localField: "courseId",
                foreignField: "_id",
                as: "course",
                pipeline: [
                    {
                        $project: {
                            title: 1
                        }
                    },
                ]
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "account",
                pipeline: [
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
                                        lastName: 1
                                    }
                                }
                            ]

                        }
                    },
                    {
                        $project: {
                            username: 1,
                            profile: 1
                        }
                    },
                    {
                        $addFields: {
                            profile: { $first: "$profile" }
                        }
                    }

                ]
            }
        },
        {
            $addFields: {
                course: { $first: "$course" },
                account: { $first: "$account" }
            }
        },
        {
            $project: {
                review: 1,
                course: 1,
                account: 1
            }
        }

    ])

    const reviews = await CourseReview.aggregatePaginate(
        reviewAggregate,
        getMongoosePaginationOptions({
            page,
            limit,
            customLabels: {
                docs: "reviews",
                totalDocs: "totalReviews"
            }
        })
    )


    return res.status(200).json(new ApiResponse(200, reviews, "all reviews fetch successfully"))



})

module.exports = {
    addReviewToCourse,
    updateReviewToCourse,
    deleteReviewOfCourse,
    getAllReviewsOfCourse
}