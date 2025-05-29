// backend/config/redisClient.js
const Redis = require('ioredis');

let redisClient;

const connectRedis = () => {
    if (!redisClient) {
        redisClient = new Redis({
            host: process.env.REDIS_HOST || 'redis',
            port: process.env.REDIS_PORT || 6379,
            // Add other options like password if needed
            maxRetriesPerRequest: 3, // Example: retry up to 3 times
            retryStrategy(times) {
                const delay = Math.min(times * 50, 2000); // Exponential backoff
                return delay;
            },
        });

        redisClient.on('connect', () => {
            console.log('Connected to Redis successfully!');
        });

        redisClient.on('error', (err) => {
            console.error('Redis connection error:', err);
            // Optionally, you might want to implement a more robust reconnection strategy
            // or gracefully degrade functionality if Redis is critical.
        });
    }
    return redisClient;
};

const getRedisClient = () => {
    if (!redisClient) {
        console.warn('Redis client not initialized. Call connectRedis() first.');
        // Depending on your strategy, you might throw an error or try to connect.
        // For now, let's try to connect if not already connected.
        return connectRedis();
    }
    return redisClient;
};

module.exports = { connectRedis, getRedisClient };