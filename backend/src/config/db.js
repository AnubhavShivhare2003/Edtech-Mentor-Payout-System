const mongoose=require('mongoose');
require('dotenv').config()
const connectDb=()=>{
    try{
        // const MONGO_URL=process.env.MONGO_URL
        const MONGODB_URL=process.env.MONGODB_URL
        // mongoose.connect(MONGO_URL)
         mongoose.connect(MONGODB_URL)
        console.log("MongoDb connected")
    }
    catch(err){
        console.log("Error connected to DB",err)
    }
}

module.exports=connectDb;