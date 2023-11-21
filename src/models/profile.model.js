const mongoose = require("mongoose")

const profileSchema = new mongoose.Schema({
    firstName: {
        type: String,
        default: ""
    },
    lastName: {
        type: String,
        default: ""
    },
    bio: {
        type: String,
        default: ""
    },
    badge: {
        type: {
            url: String,
            localPath: String
        },
        default: {
            url: "",
            localPath: "",
        }
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }

}, { timestamps: true })

const SocialProfile = mongoose.model("SocialProfile", profileSchema);

module.exports = SocialProfile

