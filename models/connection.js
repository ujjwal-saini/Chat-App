require("dotenv").config();

const mongoose = require("mongoose");
const mongoURL = process.env.MONGO_URL; 
mongoose.connect(mongoURL)
.then(() => {
    console.log("MongoDB connected successfully");
})
.catch((err) => {
    console.log("MongoDB connection error:", err);
});

module.exports = mongoose;
