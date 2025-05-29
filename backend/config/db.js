// backend/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            // Removed deprecated options: useNewUrlParser, useUnifiedTopology, useCreateIndex, useFindAndModify
            // Mongoose 6+ handles these by default.
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`MongoDB Connection Error: ${err.message}`);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;