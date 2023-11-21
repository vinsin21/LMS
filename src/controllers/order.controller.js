const User = require("../models/auth/user.model");
const Course = require("../models/courses.model");
const Order = require("../models/order.model");
const ApiError = require("../utils/APIError");
const ApiResponse = require("../utils/APIResponse");
const asyncHandler = require("../utils/asyncHandler");
const { getMongoosePaginationOptions } = require("../utils/helper");
const { sendMail, coursePurchasedMailgenContent } = require("../utils/mail");

const purchaseCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.body;

    const course = await Course.findById(courseId);

    if (!course) throw new ApiError(404, "no course exist with this id");

    const user = await User.findById(req.user._id);

    if (!user) throw new ApiError(404, "no user with this id exist")

    if (req.user?.courses.includes(courseId)) {
        throw new ApiError(403, `You have already  purchases the course`)
    }

    const order = await Order.create({
        courseId,
        owner: user._id
    })

    if (!order) throw new ApiError(500, "something went wrong in server while creating account")

    user.courses.push(courseId)
    await user.save({ validationBeforeSave: false })

    await sendMail({
        email: user.email,
        subject: "thanks for purchasing LMS Course",
        mailgenContent: coursePurchasedMailgenContent(user.username, {
            title: course.title,
            description: course.description,
            price: course.price
        })
    })

    course.purchasedCount += 1;
    await course.save({ validationBeforeSave: false });


    return res.status(200).json(new ApiResponse(201, order, "course purchases successfully"))


})

//only for admin
const getAllOrdersDetail = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query

    const ordersAggregate = Order.aggregate([
        {
            $match: {}
        },
        {// look up for course Detail
            $lookup: {
                from: "courses",
                localField: "courseId",
                foreignField: "_id",
                as: "course",
                pipeline: [
                    {
                        $project: {
                            title: 1,
                            description: 1,
                            price: 1,
                            purchasedCount: 1,
                            _id: 0
                        }
                    }
                ]
            }
        },
        { // lookup for order with user
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "user",
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
                                        lastName: 1,
                                        _id: 0

                                    }
                                }
                            ]
                        }
                    },
                    {
                        $project: {
                            username: 1,
                            email: 1,
                            profile: 1,
                            _id: 0

                        }
                    },
                    {
                        $addFields: { profile: { $first: "$profile" } }
                    }
                ]

            }
        },
        {
            $addFields: {
                user: { $first: "$user" },
                course: { $first: "$course" }
            }
        },
        {
            $project: {
                courseId: 0,
                owner: 0,
                _id: 0
            }
        }
    ])

    const orders = await Order.aggregatePaginate(
        ordersAggregate,
        getMongoosePaginationOptions({
            page,
            limit,
            customLabels: {
                docs: "orders",
                totalDocs: "totalOrders"
            }
        })
    )

    if (!orders) throw new ApiError(500, "something went wrong in server while fetching all details");

    return res.status(200).json(new ApiResponse(200, orders, "all order detail fetch successfully"))

})


module.exports = {
    purchaseCourse,
    getAllOrdersDetail
}       