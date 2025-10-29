const express = require('express');
const authRouter = express.Router();

// TODO: Import your auth controller functions
const { 
    signUp, 
    login, 
    verifyEmail, 
    forgotPassword, 
    resetPassword 
} = require('../controllers/authController');

// TODO: Import validation middleware
// const { validateSignup, validateLogin } = require('../middleware/validation');

// TODO: Sign-up route - Fixed path and function name
authRouter.post('/sign-up', signUp);

// TODO: Login route
authRouter.post('/login', login);

// TODO: Email verification route
authRouter.post('/verify-email', verifyEmail);

// TODO: Forgot password route
authRouter.post('/forgot-password', forgotPassword);

// TODO: Reset password route
authRouter.post('/reset-password', resetPassword);

// TODO: Export the router
module.exports = authRouter;