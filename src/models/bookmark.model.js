const mongoose = require("mongoose");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate-v2");


const bookmarkSchema = new mongoose.Schema({
    videoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
    },
    bookarkedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: String })

bookmarkSchema.plugin(mongooseAggregatePaginate);

const Bookmark = mongoose.model("Bookmark", bookmarkSchema)

module.exports = Bookmark;