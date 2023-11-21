const ApiError = require("./APIError")
const cloudinary = require("cloudinary").v2;

const uploadToCloudinary = async (filePath, folder) => {
    try {


        const myCloud = await cloudinary.uploader.upload(filePath, {
            folder: folder,
            resource_type: "auto"
        })

        return myCloud

    } catch (error) {
        console.log(error)
        throw new ApiError(500, error.message || "somehting went wrong while uploading to cloduinaru", error)
    }
}


module.exports = uploadToCloudinary