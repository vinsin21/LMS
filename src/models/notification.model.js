const mongoose = require("mongoose")
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate-v2")


const notificationSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    videoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"    // this field is only required when student ask question 
    },
    status: {
        type: Boolean,
        default: false,
    }

}, { timestamps: true })


notificationSchema.plugin(mongooseAggregatePaginate)


const Notification = mongoose.model("Notification", notificationSchema)

module.exports = Notification