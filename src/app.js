const express = require('express')
const session = require("express-session")
const cookieParser = require("cookie-parser")
const { rateLimit } = require("express-rate-limit");
const dotenv = require("dotenv")
const cors = require('cors')
//file imports
const ApiError = require('./utils/APIError');
const errorHandler = require('./middlewares/error.middleware');
//Api Routes 
const userRoutes = require("./routes/user.routes")
const profileRoutes = require("./routes/profile.routes")
const courseRoutes = require("./routes/courses.routes")
const videoRoutes = require("./routes/videos.routes")
const questionRoutes = require("./routes/question.routes")
const replyRoutes = require("./routes/reply.routes")
const reviewRoutes = require("./routes/review.routes")
const orderRoutes = require("./routes/order.routes")
const notificationRoutes = require("./routes/notification.routes")


dotenv.config({ path: "./.env" })
const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_, __, ___, options) => {
        throw new ApiError(
            options.statusCode || 500,
            `Your rate limit is exceed. You can only send ${options.limit} request per ${options / 60000} minutes`
        )
    }
})

app.use(limiter)
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }))

app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET,
}))
app.use(cookieParser())



//testing route 
app.get("/test", (req, res) => {

})

// API Routes
app.use("/api/v1/user", userRoutes)
app.use("/api/v1/profile", profileRoutes)
app.use("/api/v1/courses", courseRoutes)
app.use("/api/v1/videos", videoRoutes)
app.use("/api/v1/question", questionRoutes)
app.use("/api/v1/reply", replyRoutes)
app.use("/api/v1/review", reviewRoutes)
app.use("/api/v1/order", orderRoutes)
app.use("/api/v1/notification", notificationRoutes)




app.use(errorHandler)


module.exports = app