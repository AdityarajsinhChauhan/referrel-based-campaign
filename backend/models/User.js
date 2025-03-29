const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        select: false // Don't include password in normal queries
    },
    picture: String,
    businessName: String,
    role: {
        type: String,
        enum: ['business', 'user'],
        default: 'business'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Don't return password in JSON
userSchema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

module.exports = mongoose.model('User', userSchema); 