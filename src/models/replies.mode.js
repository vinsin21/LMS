const mongoose = require("mongoose")

const replySchema = new mongoose.Schema({
    reply: {
        type: String,
        required: true,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question"
    }
}, { timestamps: true })

const Reply = mongoose.model("Reply", replySchema)

module.exports = Reply