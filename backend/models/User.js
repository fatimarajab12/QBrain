const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters long'],
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true, // Fixed the typo from 'trime'
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    avatar: {
        type: String,
        default: ''
    },
    // TODO: Add account verification fields
    isVerified: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },
    loginCount: {
        type: Number,
        default: 0
    },
    // TODO: Add email verification fields (for email confirmation)
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    // TODO: Add password reset fields (for forgot password)
    passwordResetToken: String,
    passwordResetExpires: Date
}, {
    timestamps: true // Automatically adds createdAt and updatedAt
});

// TODO: Add email verification token method
// TODO: Add password reset token method

// TODO: Add password hashing (before saving)


// TODO: Add password comparison method


userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    delete user.emailVerificationToken;
    delete user.passwordResetToken;
    return user;
};

module.exports = mongoose.model('User', userSchema);