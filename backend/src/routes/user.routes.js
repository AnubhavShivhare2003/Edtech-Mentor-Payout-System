const express=require('express');
const userModel = require('../models/user.model');
const userRouter=express.Router();
const bcrypt=require("bcryptjs");
var jwt = require('jsonwebtoken');
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
    // const salt = bcrypt.genSaltSync(10);
    // const hashedPassword= bcrypt.hashSync(password, salt);
    bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt,async function (err, hashedPassword) {
      if(err){
        return res.json(err)
      }
        const newUser=await userModel.create({name,email,password:hashedPassword});
     res.json({msg:"Signup successful"})
    });
   });
    
  } catch (error) {
    console.log(error);
    res.json(error)
  }
})


userRouter.post("/login",async(req,res)=>{
    try {
        const {email,password}=req.body;
        if(!email,!password){
            return res.json({msg:"Invalid Credentials"});
        }
        const user=await userModel.findOne({email});
       if(!user){
         res.json({msg:"No user found with this mail"});
       }
       
       const hashedPassword=user.password
       bcrypt.compare(password, hashedPassword, (err, result) => {
          if(err){
           return res.json(err)
          }

          if(!result){
            return res.json({msg:"Your password is incorrect"});
          }
          if(result){
            const privateKey=process.env.privateKey;
            var token = jwt.sign({id:user._id,role:user.role}, privateKey)
            res.json({msg:"Login successful",token:token})
          }
       });
    } catch (error) {
        console.log(error);
        res.json(error)
    }
})


module.exports=userRouter