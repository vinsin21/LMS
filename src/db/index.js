const mongoose = require("mongoose")
const { DBName } = require("../constant")


const connectDB = async () => {
    try {

        const connection = await mongoose.connect(`${process.env.MONGO_URI}/${DBName}`)
        console.log(`connected to mongodb successfully!! HOST:${connection.connection.host}`)

    } catch (error) {
        console.log(`something went wrong in connectDb`, error),
            process.exit(1)
    }
}


module.exports = connectDB