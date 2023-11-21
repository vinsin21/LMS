const cloudinary = require("cloudinary").v2;
const { default: mongoose } = require("mongoose");
const Course = require("../models/courses.model");
const CourseVideo = require("../models/videos.model");
const ApiError = require("../utils/APIError");
const ApiResponse = require("../utils/APIResponse");
const asyncHandler = require("../utils/asyncHandler");
const uploadToCloudinary = require("../utils/cloudinary");
const { getLocalFilePath, removeLocalFile, getMongoosePaginationOptions } = require("../utils/helper");


const uploadCourseVideos = asyncHandler(async (req, res) => {
  const { title, discription, links, courseId } = req.body;
  //const { courseId } = req.params;

  if (!req.files) {
    throw new ApiError(400, "file is required plz provide file")
  }
  const course = await Course.findById(courseId);
  if (!course) {
    throw new ApiError(404, "course does not exist ");
  }





  const videoLocalFilePath = getLocalFilePath(req.files?.video[0]?.filename)
  const thumbnailLocalFilePath = getLocalFilePath(req.files?.thumbnail[0]?.filename)

  const myVideoCloud = await uploadToCloudinary(videoLocalFilePath, "videos");

  const myImageCloude = await uploadToCloudinary(thumbnailLocalFilePath, "images")



  /*
      const returnObjectFromCloudinary = ()=>{
          {
              video: [
                {
                  fieldname: 'video',
                  originalname: 'pexels-alice-marie-15395788 (720p).mp4',
                  encoding: '7bit',
                  mimetype: 'video/mp4',
                  destination: './src/public/images',
                  filename: 'pexels-alice-marie-15395788-(720p)170012737339776536.mp4',
                  path: 'src\\public\\images\\pexels-alice-marie-15395788-(720p)170012737339776536.mp4',
                  size: 1188389
                }
              ],
              thumbnail: [
                {
                  fieldname: 'thumbnail',
                  originalname: 'Screenshot (155).png',
                  encoding: '7bit',
                  mimetype: 'image/png',
                  destination: './src/public/images',
                  filename: 'screenshot-(155)170012737341042636.png',
                  path: 'src\\public\\images\\screenshot-(155)170012737341042636.png',
                  size: 367426
                }
              ]
            }
            videoCLoud => {
              asset_id: '1d08dc8f462fbac94ac5a77509d4ffe5',
              public_id: 'videos/jhwtak0whgii9n9rchql',
              version: 1700127376,
              version_id: 'adee62da322c99c842456bc8416d849d',
              signature: '556c45d5fd0d5d854f39923afd639a6db148762a',
              width: 720,
              height: 1280,
              format: 'mp4',
              resource_type: 'video',
              created_at: '2023-11-16T09:36:16Z',
              tags: [],
              pages: 0,
              bytes: 1188389,
              type: 'upload',
              etag: '7a41c9b568882fd21565f4521d5076c2',
              placeholder: false,
              url: 'http://res.cloudinary.com/dqayppdgv/video/upload/v1700127376/videos/jhwtak0whgii9n9rchql.mp4',
              secure_url: 'https://res.cloudinary.com/dqayppdgv/video/upload/v1700127376/videos/jhwtak0whgii9n9rchql.mp4',
              playback_url: 'https://res.cloudinary.com/dqayppdgv/video/upload/sp_auto/v1700127376/videos/jhwtak0whgii9n9rchql.m3u8',
              folder: 'videos',
              audio: {
                codec: 'aac',
                bit_rate: '189404',
                frequency: 48000,
                channels: 2,
                channel_layout: 'stereo'
              },
              video: {
                pix_format: 'yuv420p',
                codec: 'h264',
                level: 32,
                profile: 'High',
                bit_rate: '1280639',
                time_base: '1/30000'
              },
              is_audio: false,
              frame_rate: 29.97002997002997,
              bit_rate: 1475877,
              duration: 6.441667,
              rotation: 0,
              original_filename: 'pexels-alice-marie-15395788-(720p)170012737339776536',
              nb_frames: 193,
              api_key: '426814879162191'
            }
            imageCLoud => {
              asset_id: '6af2648a67afb8d0287cd4bceafb9e78',
              public_id: 'images/fcj5bwupycxs12nmfxrc',
              version: 1700127378,
              version_id: 'd7d696de04fed1db7d128e4fe4e92cfc',
              signature: 'e61650b50bae9c7eefe5f7aa65ecbdf2396e55ab',
              width: 1920,
              height: 1080,
              format: 'png',
              resource_type: 'image',
              created_at: '2023-11-16T09:36:18Z',
              tags: [],
              bytes: 367426,
              type: 'upload',
              etag: '909f0090b869ee50d4b4c76d056eefc8',
              placeholder: false,
              url: 'http://res.cloudinary.com/dqayppdgv/image/upload/v1700127378/images/fcj5bwupycxs12nmfxrc.png',
              secure_url: 'https://res.cloudinary.com/dqayppdgv/image/upload/v1700127378/images/fcj5bwupycxs12nmfxrc.png',
              folder: 'images',
              original_filename: 'screenshot-(155)170012737341042636',
              api_key: '426814879162191'
            }
            
      }
  */

  console.log(myImageCloude)
  console.log(myImageCloude.secure_url)

  const courseVideo = await CourseVideo.create({
    title,
    discription,
    links,//social links
    videoPlayer: myVideoCloud.format,
    videoThumbnail: {
      url: myImageCloude.secure_url,
      public_id: myImageCloude.public_id,
    },
    videoUrl: {
      url: myVideoCloud.secure_url,
      public_id: myVideoCloud.public_id,
    },
    videoLength: myVideoCloud.duration,
    videoSection: "educational", // i dont know what is video section field is for so i enter random data
    owner: req.user._id,
    courseId: courseId

  })

  removeLocalFile(videoLocalFilePath)
  removeLocalFile(thumbnailLocalFilePath)
  return res.status(201).json(new ApiResponse(201, { courseVideo }, "course video uploaded successfully"))




})

const deleteCourseVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;


  const video = await CourseVideo.findOne({ _id: videoId, owner: req.user?._id })

  if (!video) throw new ApiError(404, "video doest not exist may be it is already deleted or you have given wrong videoId");

  const myVideoCloud = await cloudinary.uploader.destroy(video.videoUrl.public_id, { resource_type: "video" })
  // console.log(myVideoCloud)
  // terminal => { result: 'ok' }
  const mythumbnailCloud = await cloudinary.uploader.destroy(video.videoThumbnail.public_id)
  // console.log(mythumbnailCloud)
  // terminal =>{ result: 'ok' }

  // we have to user findOneAndDelete because we have set the mongoose
  // pre hook to findOneAndDelete to delete the comments associated with the video we are deleting
  const deletedVideo = await CourseVideo.findOneAndDelete({ _id: video._id, owner: req?.user._Id });

  if (!deletedVideo) throw new ApiError(500, "something went wrong while deleting video")

  return res.status(200).json(new ApiResponse(200, deletedVideo, "video deleted successfully"))

})

//only update content not video or thumbnail
const updateVideoDetail = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, discription, links } = req.body;


  const video = await CourseVideo.findOneAndUpdate(
    {
      owner: req.user?._id,
      _id: videoId
    },
    {
      $set: {
        title,
        discription,
        links,
      }
    },
    { new: true }

  )

  if (!video) throw new ApiError(500, "something went wrong while updating course video details")


  return res.status(200).json(new ApiResponse(200, { updatedVideo: video }, "video updated successfully"))


})

// Only those who have purchases the course can access video
// we have a route in course.routes.js for getting all videos of course 
// This route is use if student bookmark a particualr video for later user 
// Or student have purchases couple of courses and want to create a playlist 
// as we give student a personalized student panel with featues like ai chatbots,agents, playlist,bookmark
const getSingleVideo = asyncHandler(async (req, res) => {
  //NOTE: only those who have purchases can access this

  const { videoId } = req.params;

  const videoAggregate = await CourseVideo.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId)
      }
    },
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

  ])

  if (!videoAggregate) throw new ApiError(404, "invlaid id or something went wrong in server while fetching video ")



  if (!req.user?.courses.includes(videoAggregate[0].courseId.toString())) {
    throw new ApiError(403, `You have to purchase the course to access this video`)
  }

  return res.status(200).json(new ApiResponse(200, videoAggregate[0], "video fetch successfully"))


})

module.exports = {
  uploadCourseVideos,
  deleteCourseVideo,
  updateVideoDetail,
  getSingleVideo,
}