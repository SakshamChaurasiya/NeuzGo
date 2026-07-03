const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        unique: true,
        required: true,
        match: /^[0-9]{10}$/
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    zodiacSign: {
        type: String,
        default: ""
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);