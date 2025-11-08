// models/Message.js

const mongoose = require('mongoose');


const messageSchema = new mongoose.Schema({
    sender: String,   // User ka id
    receiver: String, // Contact ka id
    text: String,
    media: String,
    time: {
        type: Date,
        default: Date.now
    }
});



module.exports = mongoose.model('Message', messageSchema);
