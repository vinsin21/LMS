const mongoose = require('mongoose');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');
const cloudinary = require("cloudinary").v2;


const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: [0, "price cannot be less negative number"]
    },
    isFree: {
        type: Boolean,
        default: false
    },
    discountPrice: {
        type: Number,
        validate: {
            validator: function (value) {
                return value < this.price
            },
            message: "discount price should be less then the actual price"
        }

    },
    thumbnail: {
        type: {
            url: String,
            public_id: String
        }
    },
    tags: {
        type: [String],
    },
    demoUrl: {
        type: {
            url: String,
            publicId: String,
        }
    },
    // videos: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Video"
    // }],
    purchasedCount: {   // total number of people purchsaed course
        type: Number,
        default: 0,
    },
    rating: {
        type: String,
        min: 0,
        max: 5,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }

}, { timestamps: true })


courseSchema.pre("findOneAndDelete", async function (next) {

    try {

        // this is wrong because we also want to delte video content from cloudinary
        const videos = await mongoose.model("Video").find({ courseId: this._id });

        videos.map(async (video) => {
            await cloudinary.uploader.destroy(video.videoThumbnail.public_id)
        })

        return next()

    } catch (error) {
        console.log(`Error at courseSchema pre hook`, error)
        next(error)
    }
})


courseSchema.plugin(mongooseAggregatePaginate);

const Course = mongoose.model("Course", courseSchema);

module.exports = Course