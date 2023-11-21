const mongoose = require("mongoose")
const Reply = require("./replies.mode")


const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
    },
    videoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true })


//This get triger when we delete from videoSchema pre hook you can see video model for more detail
questionSchema.pre("deleteMany", async function (next) {

    try {
        await Reply.deleteMany({ questionId: this._id })
        return next()
    } catch (error) {
        console.log(`Error at questionShcmea remove hoook`, error);
        return next(error)
    }

})

questionSchema.pre("findOneAndDelete", async function (next) {

    try {
        await Reply.deleteMany({ questionId: this._id })
        return next()
    } catch (error) {
        console.log(`Error at questionShcmea remove hoook`, error);
        return next(error)
    }

})


const Question = mongoose.model("Question", questionSchema)

module.exports = Question