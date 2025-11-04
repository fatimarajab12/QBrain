import express from 'express';
import { Signup  } from '../controllers/auth.controller.js'; 
import { verifyEmail } from '../controllers/auth.controller.js';
const authRouter = express.Router();

authRouter.post('/sign-up', Signup);
authRouter.get('/verify-email', verifyEmail);


export default authRouter;