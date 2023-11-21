const { UserRoleEnum } = require("../constant");
const Notification = require("../models/notification.model");
const Question = require("../models/questions.model");
const Reply = require("../models/replies.mode");
const ApiError = require("../utils/APIError");
const ApiResponse = require("../utils/APIResponse");
const asyncHandler = require("../utils/asyncHandler");

const addReplyToQuestion = asyncHandler(async (req, res) => {
    const { questionId } = req.params;
    const { reply } = req.body;


    const questionExist = await Question.findById(questionId);

    if (!questionExist) throw new ApiError(404, "something went wrong invlaid question Id");

    const addedReply = await Reply.create({
        reply,
        owner: req.user?._id,
        questionId,
    })

    if (!addedReply) throw new ApiError(404, "something went wrong while adding reply ")

    // if the course creater add the reply (asnwer) we should send a 
    // notification to student email,whatsapp , studnet admin panel 

    // if (req.user?.role === UserRoleEnum.ADMIN) {
    //     // This code only work if reply is By Admin
    //     // Later we can fetch notification and show it to student dashBoard
    //     const notification = await Notification.create({
    //         title: `Admin answer Your ${questionExist.videoId}`,
    //         message: reply,
    //         owner: req.user._id,
    //         videoId: questionExist.videoId,
    //     })
    // }

    return res.status(200).json(new ApiResponse(200, { addedReply }, "reply added successfully"))

})

const deleteReplyToQuestion = asyncHandler(async (req, res) => {
    const { replyId } = req.params;

    const deletedReply = await Reply.findOneAndDelete(
        {
            _id: replyId,
            owner: req.user?._id
        }
    )

    if (!deletedReply) throw new ApiError(404, "cannot find reply check id again")

    return res.status(200).json(new ApiResponse(200, { deletedReply }, "reply deleted successfully"))
})

const updateReplyToQuestion = asyncHandler(async (req, res) => {
    const { replyId } = req.params;
    const { reply } = req.body;
    const updatedReply = await Reply.findOneAndUpdate(
        {
            _id: replyId,
            owner: req.user?._id
        },
        {
            $set: {
                reply,
            }
        },
        {
            new: true
        }
    )

    if (!updatedReply) throw new ApiError(404, "invalid id or you are not authorized to update this reply")

    return res.status(200).json(new ApiResponse(200, { updatedReply }, "reply updated successfully"))
})


module.exports = {
    addReplyToQuestion,
    deleteReplyToQuestion,
    updateReplyToQuestion
}