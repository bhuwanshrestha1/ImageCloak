import User from "../models/userModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import bcrypt from "bcryptjs"
import createToken from '../utils/createToken.js'

const createUser = asyncHandler(async (req, res) => {
  const { username,fullname, email, password } = req.body;

  if (!username ||!fullname || !email || !password) {
    throw new Error("Please fill all the fields.");
  }
  
  
  const userExists = await User.findOne({ username: req.body.username });
  if (userExists) return res.status(400).send("Username already exists");
  

  const emailExists = await User.findOne({ email: req.body.email });
  if (emailExists) return res.status(400).send("Email already exists");
  

  const salt = await bcrypt.genSalt(12)

  const hashedPassword = await bcrypt.hash(password,salt)

  const newUser = new User({ username,fullname, email, password:hashedPassword });

  try {
    await newUser.save();
    createToken(res,newUser._id)

    res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      fullname: newUser.fullname,
      email: newUser.email,
      password: newUser.password,
      isAdmin: newUser.isAdmin,

    });

  } catch (error) {
    res.status(400);
    throw new Error("Invalid User Data");
  }

});


const loginUser = asyncHandler (async (req,res) => {
  const {username , password} = req.body

  const existingUser = await User.findOne({username})

  if (!existingUser) {
    return res.status(400).json({ error: "Invalid username or password" });
  }

    if(existingUser){
      const isPasswordValid = await bcrypt.compare(password,existingUser.password)

      if (!existingUser || !isPasswordValid) {
        return res.status(400).json({ error: "Invalid username or password" });
      }

      if (isPasswordValid){
        createToken(res , existingUser._id)

        return  res.status(200).json({
                            _id: existingUser._id,
                            username: existingUser.username,
                            fullname: existingUser.fullname,
                            email: existingUser.email,
                            password: existingUser.password,
                            isAdmin: existingUser.isAdmin,
                              });
     

          }
    }
})

const logoutUser = asyncHandler (async (req,res) => {
 
  res.cookie('jwt', ' ',{
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    expires: new Date(0),
  })

  console.log("Cookie cleared");

  res.status(200).json({message: "Logged out Successfully"})
})

const getAllUsers = asyncHandler (async (req,res) => {
 
const users = await User.find({})

res.json(users)
})

const getCurrentUserProfile = asyncHandler (async (req,res) => {
  
  const user = await User.findById(req.user._id)
  
  if(user){
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      fullname: user.fullname,
    })
  }else{
    res.status(404)
    throw new Error("User not found") 
  }
  
})

const updateCurrentUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id); 
  if (user) {
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email; 
    user.fullname = req.body.fullname || user.fullname; 

    // Only hash new password if it is provided
    if (req.body.newPassword) {
      const salt = await bcrypt.genSalt(12);
      user.password = await bcrypt.hash(req.body.newPassword, salt);
    }

    const updatedUser = await user.save();

    res.json({ 
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      password: updatedUser.password,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});


const deleteUserById = asyncHandler(async(req,res) => {
  const user = await User.findById(req.params.id)

  if(user){
    if(user.isAdmin){
      res.status(400)
      throw new Error ('Cannot Delete admin user')
    }

    await User.deleteOne({_id: user._id})
    res.json({ message:"User removed"  })

  }else{
    res.status(404)
    throw new Error("User not found")
  }

})

const getUserById = asyncHandler(async(req,res) => {
  const user = await User.findById(req.params.id).select('-password')

  if(user){
    res.json(user)
  }else{
    res.status(404)
    throw new Error("User not found")
  }

})

const updateUserById = asyncHandler(async(req,res) => {
  const user = await User.findById(req.params.id)
 
    if (user) {
      user.username = req.body.username || user.username;
      user.email = req.body.email || user.email;
      user.isAdmin = Boolean(req.body.isAdmin)
  
      const updatedUser = await user.save();

      res.json({ 
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
      });

  }else{
    res.status(404)
    throw new Error("User not found")
  }

})

export { createUser, loginUser ,logoutUser, getAllUsers,getCurrentUserProfile,updateCurrentUserProfile,deleteUserById,getUserById,updateUserById};
