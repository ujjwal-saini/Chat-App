const mongoose = require("./connection");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    dp: {
        type: String, 
        default: "default.png"
    },
    
     isOnline: {
    type: Boolean,
    default: false
  },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const UserCollection = mongoose.model("User", userSchema);

module.exports = UserCollection;
