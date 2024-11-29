import express from "express";
import {
    createUser , 
    loginUser ,
     logoutUser,
      getAllUsers,
      getCurrentUserProfile,
      updateCurrentUserProfile,
      deleteUserById,
      getUserById,
      updateUserById,
} from '../controllers/userController.js'

import { authenticate,authorizeAdmin } from "../models/authMiddleware.js";

const router = express.Router();

router.route('/').post (createUser).get(authenticate, getAllUsers);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

router.route('/profile').get(authenticate,getCurrentUserProfile).put(authenticate, updateCurrentUserProfile);

//AdminRoutes
router
.route('/:id')
.delete(authenticate, authorizeAdmin, deleteUserById)
.get(authenticate,authorizeAdmin,getUserById)
.put(authenticate,authorizeAdmin,updateUserById)

export default router;
