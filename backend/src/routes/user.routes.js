const express=require('express');
const userModel = require('../models/user.model');
const userRouter=express.Router();
const bcrypt=require("bcryptjs");
userRouter.post("/register",async(req,res)=>{
  try {
    const {name,email,password,role}=req.body;
    if(!name||!email||!password){
        return res.json({msg:"Invalid credentials"});
    }
    const user=await userModel.findOne({email});
    if(user){
        return res.json({msg:"User already exists with this name"});
    }
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword= bcrypt.hashSync(password, salt);
     const newUser=await userModel.create({name,email,password:hashedPassword});
    res.json({msg:"Signup successful"})
  } catch (error) {
    console.log(error);
    res.json(error)
  }
})


userRouter.post("/login",async(req,res)=>{
    
})

module.exports=userRouter