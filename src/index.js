const app = require("./app")
const dotenv = require("dotenv")
const connectDB = require("./db/index")
const cloudinary = require('cloudinary')

dotenv.config({ path: "./.env" })
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.COULDINARY_SECRET_KEY
})


const majorNodeVersion = +process.env.NODE_VER?.split(".")[0]

const startServer = () => {

    app.listen(process.env.PORT || 8000, () => {
        console.log(`connected to server at port ${process.env.PORT}`)
    })
}


if (majorNodeVersion >= 14) {
    ; (async () => {
        try {
            startServer()
            await connectDB()
        } catch (error) {
            console.log(`error while connecting db`, error)
        }
    })()
} else {
    connectDB().then(() => {
        startServer()
    }).catch((error) => {
        console.log("error at connecting db and start server", error)
    })
}