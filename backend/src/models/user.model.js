const mongoose=require('mongoose');
const bcrypt=require("bcryptjs");

const userSchema=mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    contactInfo: {phone: String,address: String},
    role:{type:String,enum:["mentor","admin"],default:'mentor'},
    taxInfo:{panCard: String,gstNumber: String}
},
    {timestamps:true}
);


const userModel=mongoose.model('user',userSchema);
module.exports=userModel;