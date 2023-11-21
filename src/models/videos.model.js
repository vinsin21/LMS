const mongoose = require('mongoose');
const Question = require('./questions.model');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    discription: {
        type: String,
        required: true,
    },
    videoPlayer: {
        type: String,
    },
    videoThumbnail: {
        type: {
            public_id: String,
            url: String
        }
    },
    videoUrl: {
        type: {
            url: String,
            public_id: String,
        }          //cloudinary
    },
    videoLength: {
        type: String,       //cloduinary
    },
    videoSection: {
        type: String,
    },
    links: {
        type: [String],       //social links
        default: []
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
    }

}, { timestamps: true })


// It will set the video thumbnail same as the course main thumbnail if no video thumbnail is provided
videoSchema.pre("save", async function (next) {

    const courseId = this.courseId;       // 

    if (!this.videoThumbnail || (this.videoThumbnail.url === '' && this.videoThumbnail.public_id === '')) {

        const course = await mongoose.model("Course").findById(courseId);

        this.videoThumbnail = course.thumbnail;
    }

    return next();

})


videoSchema.pre("findOneAndDelete", async function (next) {

    try {

        await Question.deleteMany({ videoId: this._id });
        return next()

    } catch (error) {
        console.log(`Error at videoSchema pre hook`, error)
        return next(error)
    }
})


videoSchema.plugin(mongooseAggregatePaginate)

const CourseVideo = mongoose.model("Video", videoSchema)

module.exports = CourseVideo
