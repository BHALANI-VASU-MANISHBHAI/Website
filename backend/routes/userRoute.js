import express from 'express';
import { adminLogin, getUserById, googleAuth, loginUser, registerUser, UpdateProfile } from '../controllers/UserController.js';
import upload from '../middleware/multer.js';
import restrictToRole from '../middleware/restrictToRole.js';



const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/admin', adminLogin);
userRouter.post('/google', googleAuth);
userRouter.post('/getdataofuser', restrictToRole('user','rider'),getUserById);
userRouter.put('/updateprofile', restrictToRole('user','rider'), upload.single("profileImage"),
 UpdateProfile);
userRouter.post('/getuserbyid/:id', restrictToRole('user'), getUserById); 

export default userRouter;  