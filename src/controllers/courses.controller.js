const { default: mongoose } = require("mongoose");
const Course = require("../models/courses.model");
const ApiError = require("../utils/APIError");
const ApiResponse = require("../utils/APIResponse");
const asyncHandler = require("../utils/asyncHandler");
const uploadToCloudinary = require("../utils/cloudinary");
const { getLocalFilePath, removeLocalFile, getMongoosePaginationOptions } = require("../utils/helper");
const cloudinary = require("cloudinary").v2;


const getCourseDetails = async (courseId) => {

    const courseAggreagate = await Course.aggregate([])
}

const createCourse = asyncHandler(async (req, res) => {

    const { title, description, price, discountPrice, tags, rating, isFree } = req.body;

    const courseAlreadyExist = await Course.findOne({ title })

    if (courseAlreadyExist) {
        throw new ApiError(409, "Course with this title already exist");
    }

    // req.file=>  { this is how req.file looks like
    //     fieldname: 'thumbnail',
    //     originalname: 'Screenshot (139).png',
    //     encoding: '7bit',
    //     mimetype: 'image/png',
    //     destination: './src/public/images',
    //     filename: 'screenshot-(139)169985820157723457.png',
    //     path: 'src\\public\\images\\screenshot-(139)169985820157723457.png',
    //     size: 499967
    //   }

    let thumbnail = req.file
    //diskStorgae at /public/images folder
    const localFilePath = getLocalFilePath(req.file?.filename)
    // for uploading image to cloudinary
    //TODO:we can also create a seprate api for uploading thumbnail
    if (thumbnail) {
        const myCloud = await uploadToCloudinary(localFilePath, "images")
        thumbnail = {
            url: myCloud.secure_url,
            public_id: myCloud.public_id,
            localPath: localFilePath
        }
    }


    //create course
    const newCourse = await Course.create({
        title, description, price, isFree, discountPrice, tags, rating,
        thumbnail,
        owner: req.user?._id
    })

    if (!newCourse) {
        throw new ApiError(500, "Course not created due to server error plz try again!")

    }

    removeLocalFile(localFilePath)

    return res.status(200).json(new ApiResponse(201, { course: newCourse }, "course created successfully"))


})

const updateThumbnail = asyncHandler(async (req, res) => {

    const { courseId } = req.params;


    if (!req.file || req.file.fieldname !== "thumbnail") {
        throw new ApiError(400, "thumbnail is required plz provide it !!");
    }
    // req.file=>  { this is how req.file looks like
    //     fieldname: 'thumbnail',
    //     originalname: 'Screenshot (139).png',
    //     encoding: '7bit',
    //     mimetype: 'image/png',
    //     destination: './src/public/images',
    //     filename: 'screenshot-(139)169985820157723457.png',
    //     path: 'src\\public\\images\\screenshot-(139)169985820157723457.png',
    //     size: 499967
    //   }

    const localFilePath = getLocalFilePath(req.file?.filename)

    const course = await Course.findOne({ owner: req.user?._id, _id: courseId });
    if (!course) throw new ApiError(403, "course doest not exist or you are not the owner of course");

    if (course.thumbnail && course.thumbnail.public_id) {

        await cloudinary.uploader.destroy(course.thumbnail?.public_id)
        const myCloud = await uploadToCloudinary(localFilePath, "images");

        course.thumbnail.url = myCloud.secure_url;
        course.thumbnail.public_id = myCloud.public_id;

    } else {
        const myCloud = await uploadToCloudinary(localFilePath, "images");
        course.thumbnail.url = myCloud.secure_url;
        course.thumbnail.public_id = myCloud.public_id;
    }


    await course.save({ validationBeforeSave: false })

    removeLocalFile(localFilePath)

    return res.status(200).json(new ApiResponse(200, {}, "course thumbnail updated successfully"))

})

const updateCourseDetail = asyncHandler(async (req, res) => {

    const { title, description, price, discountPrice, tags, rating, isFree } = req.body;
    const { courseId } = req.params;

    const course = await Course.findOneAndUpdate(
        {
            _id: courseId,
            owner: req.user._id
        },
        {
            $set: {
                title,
                description,
                price,
                discountPrice,
                tags,
                rating,
                isFree,
            }
        },
        { new: true }
    )

    if (!course) throw new ApiError(404, "course doest not exist or you are not the authorized");

    return res.status(200).json(new ApiResponse(200, { course }, "course updated successfully"))



})



//TODO: It is incomplete right now
// While deleting course we have 2 Options=>
//1st delete course data onlu from db
//2nd delete course data from db as well all from cloudinary
//Usually we dont delte the course data from cloudinary because we only want to remove the course from website
//SO we keep the data safe in clodinary (videos and thumbnail) so that in future we can access them.Or if we decide to delete the course videos from cloudinary we also
const deleteCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.params;

    const course = await Course.findOne({ _id: courseId, owner: req.user._id });

    if (!course) throw new ApiError(404, "invalid id!! no course with this id exist or you are not the creator of the course so you cannot perform this action")



    // // deleting course thumbnail image from cloudinary
    // if (course.thumbnail || course.thumbnail.public_id) {
    //     await cloudinary.uploader.destroy(course.thumbnail.public_id)
    // }


    await Course.findOneAndDelete({ _id: course._id, owner: req.user?._id });

    //TODO: in future we can also send a otp at phone or email after verifiting that otp we delete the course
    return res.status(200).json(new ApiResponse(200, {}, "course deleted successfully"))



})


// get single course detail without purchase
const getSingleCourseWithoutPurchase = asyncHandler(async (req, res) => {
    const { courseId } = req.params;


    // this is just Demo code if we use cache-ing
    // const isCatchExist = await redis.get(courseID)
    // if(isCatchExist){
    //     const course = JSON.parse(isCatchExist)
    //     return res.status(200).json(new ApiResponse(200,course,"course fetch successfully"))
    // }

    const courseAgggregate = await Course.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(courseId) }
        },
        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "courseId",
                as: "videos",
                pipeline: [
                    {
                        $project: {
                            title: 1,
                            discription: 1,
                            videoPlayer: 1,
                            videoLength: 1,
                            videoSection: 1,
                            courseId: 1,
                        }
                    },
                ]
            }
        },
        {
            $project: {
                __v: 0,
            }
        },

    ])

    // await redis.set("Course", JSON.stringify(courseAgggregate[0]))



    res.status(200).json(new ApiResponse(200, courseAgggregate[0], "course fetch successfully"))
})

//get single course detail without purchase
const getAllCoursesWithoutPurchase = asyncHandler(async (req, res) => {

    const { page = 1, limit = 10 } = req.query;
    const coursesAggregate = Course.aggregate([
        {
            $match: {}
        },
        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "courseId",
                as: "videos",
                pipeline: [
                    {
                        $project: {
                            title: 1,
                            discription: 1,
                            videoPlayer: 1,
                            videoLength: 1,
                            videoSection: 1,
                            courseId: 1,
                        }
                    },
                ]
            }
        },
        {
            $project: {
                __v: 0,
            }
        },

    ])


    const courses = await Course.aggregatePaginate(
        coursesAggregate,
        getMongoosePaginationOptions({
            page,
            limit,
            customLabels: {
                docs: "Courses",
                totalDocs: "toatlCourses"
            }
        })
    )


    if (!courses) throw new ApiError(404, "no course found");

    return res.status(200).json(new ApiResponse(200, courses, "all courses fetch successfully"))

})

// get single course only for those who purchases it 

const getSinglePurchasedCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const courseList = req.user?.courses;


    const courseExist = courseList.find((course) => course.toString() === courseId.toString())

    // this is just Demo code if we use cache-ing
    // const isCatchExist = await redis.get(courseID)
    // if(isCatchExist){
    //     const course = JSON.parse(isCatchExist)
    //     return res.status(200).json(new ApiResponse(200,course,"course fetch successfully"))
    // }


    if (!courseExist) throw new ApiError(404, "you are not authorized to acess this course");
    console.log(courseExist)


    const courseAgggregate = await Course.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(courseExist) } // courseExist is courseId
        },
        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "courseId",
                as: "videos",
                pipeline: [
                    {
                        $lookup: {
                            from: "questions",
                            localField: "_id",
                            foreignField: "videoId",
                            as: "questions",
                            pipeline: [
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
                                                    avatar: 1,
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
                                    $project: {
                                        question: 1,
                                        account: 1
                                    }
                                },
                                {
                                    $addFields: {
                                        account: { $first: "$account" }
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $project: {
                            __v: 0,
                            createdAt: 0,
                            updatedAt: 0,
                        }
                    }
                ]

            },

        },
        {
            $project: {
                __v: 0,
                createdAt: 0,
                updatedAt: 0,
            }
        },

    ])

    // await redis.set("Course", JSON.stringify(courseAgggregate[0]))


    return res.status(200).json(new ApiResponse(200, courseAgggregate[0], "course fetch successfully"))

})

module.exports = {
    createCourse,
    updateThumbnail,
    updateCourseDetail,
    deleteCourse,
    getSingleCourseWithoutPurchase,
    getAllCoursesWithoutPurchase,
    getSinglePurchasedCourse,

}