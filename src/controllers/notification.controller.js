const Notification = require("../models/notification.model");
const ApiError = require("../utils/APIError");
const ApiResponse = require("../utils/APIResponse");
const asyncHandler = require("../utils/asyncHandler");
const { getMongoosePaginationOptions } = require("../utils/helper");
const cron = require('node-cron');

//Only for admin
const getAllNotification = asyncHandler(async (req, res) => {

    const { page = 1, limit = 10 } = req.query;

    const notificationAggregate = Notification.aggregate([
        {
            $match: {}    // empty match get all the document
        },
        {
            $sort: {
                createdAt: -1 // Sort by "created_at" in descending order (latest first)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "student",
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
                                },

                            ]
                        }
                    },
                    {
                        $addFields: {
                            profile: { $first: "$profile" }
                        }
                    },
                    {
                        $replaceRoot: { newRoot: { $mergeObjects: ["$$ROOT", "$profile"] } }
                    },
                    {
                        $project: {
                            username: 1,
                            firstName: 1,
                            lastName: 1
                        }
                    }

                ]
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videoId",
                foreignField: "_id",
                as: "videoDetail",
                pipeline: [
                    {
                        $lookup: {
                            from: "courses",
                            localField: "courseId",
                            foreignField: "_id",
                            as: "courseDetail",
                            pipeline: [
                                {
                                    $project: {
                                        courseName: "$title",
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            courseDetail: { $first: "$courseDetail" }
                        }
                    },
                    {
                        $replaceRoot: {
                            newRoot: { $mergeObjects: ["$$ROOT", "$courseDetail"] }
                        }
                    },
                    {
                        $project: {
                            courseName: 1,
                            videoTitle: "$title",
                            videoDiscription: "$discription"
                        }
                    },

                ]
            }
        },
        {
            $addFields: {
                student: { $first: "$student" },
                videoDetail: { $first: "$videoDetail" }
            }
        },
        {
            $project: {
                title: 1,
                message: 1,
                videoDetail: 1,
                student: 1,
                status: 1
            }
        }

    ])

    const notifications = await Notification.aggregatePaginate(
        notificationAggregate,
        getMongoosePaginationOptions({
            page,
            limit,
            customLabels: {
                docs: "notifications",
                totalDocs: "totalNotifications"
            }
        })
    );

    if (!notifications) throw new ApiError(500, "something went wrong in server while fetching data")

    return res.status(200).json(new ApiResponse(200, notifications, "all notificatons fetch successfully"))

})


// only for student dashBoard
const getAllNotificationByAdminToStudent = asyncHandler(async (req, res) => {

    const notifications = await Notification.aggregate([
        {
            $match: {

            }
        }
    ])
})


// cron.schedule("0 0 0 * * *", async () => {
//     const thirtyDayAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
//     await Notification.deleteMany({ status: true, createdAt: { $lte: thirtyDayAgo } })
//console.log("deleted read notification")
// })

module.exports = {
    getAllNotification
}