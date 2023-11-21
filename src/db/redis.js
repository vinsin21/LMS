const { Redis } = require('ioredis');
const ApiError = require('../utils/APIError');
const dotenv = require("dotenv")

dotenv.config()

const redisClient = () => {
    if (process.env.REDIS_URL) {
        console.log(`Redis connected successfully`);
        return process.env.REDIS_URL
    }

    throw new ApiError(500, "Redis connection failed")
}

//const redis = new Redis(redisClient());

const useRedis = () => {
    console.log("called")
    const redis = new Redis(redisClient());
    return redis
}



module.exports = useRedis