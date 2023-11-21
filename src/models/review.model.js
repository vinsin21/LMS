const mongoose = require('mongoose')
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2')

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: true,
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

}, { timestamps: true })


reviewSchema.plugin(mongooseAggregatePaginate)

const CourseReview = mongoose.model("CourseReview", reviewSchema)

module.exports = CourseReview

