const Notification = require("../models/notification.model");
const Question = require("../models/questions.model");
const CourseVideo = require("../models/videos.model");
const ApiError = require("../utils/APIError");
const ApiResponse = require("../utils/APIResponse");
const asyncHandler = require("../utils/asyncHandler");

const addVideoQuestion = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { question } = req.body;

    const video = await CourseVideo.findById(videoId);

    if (!video) throw new ApiError(404, "no video with this id exist");

    const addedQuestion = await Question.create({
        question,
        videoId,
        owner: req.user?._id,

    })

    if (!addedQuestion) throw new ApiError(401, "something went wrong while adding video question")

    // when ever there is a question asked by student in video a notification is send to the course creater
    // similaryly when the video creater answer the student question a notification is send to the student admin panel and email or whatsapp

    const notification = await Notification.create({
        title: `${req.user?.username} ask a question at ${video.title}`,
        message: question,
        owner: req.user._id,
        videoId: video._id,
    })

    if (!notification) throw new ApiError(500, "something went wrong while creating notificatioin")


    return res.status(201).json(new ApiResponse(201, { addedQuestion }, "question added to the video successfully"))



})

const deleteVideoQuestion = asyncHandler(async (req, res) => {
    const { questionId } = req.params;

    const deletedQuestion = await Question.findOneAndDelete(
        {
            _id: questionId,
            owner: req.user?._id
        }
    );

    if (!deletedQuestion) throw new ApiError(404, "question id is inavlid or you are not authorized to perform this task");

    return res.status(200).json(new ApiResponse(200, { deletedQuestion }, "question from video is deleted"))

})

const updateVideoQuestion = asyncHandler(async (req, res) => {
    const { questionId } = req.params;
    const { question } = req.body;

    const updatedQuestion = await Question.findOneAndUpdate(
        {
            _id: questionId,
            owner: req.user?._id
        },
        {
            $set: {
                question,
            }
        },
        { new: true }

    )

    if (!updatedQuestion) throw new ApiError(404, "invalid id or something went wrong while updating question");

    return res.status(200).json(new ApiResponse(200, { updatedQuestion }, "video question updated successfully"))

})

const getAllQuestionsOfVideo = asyncHandler(async (req, res) => { })

module.exports = {
    addVideoQuestion,
    deleteVideoQuestion,
    updateVideoQuestion,
    getAllQuestionsOfVideo
}