const express=require('express');
const connectDb = require('./src/config/db');
const userRouter = require('./src/routes/user.routes');
require('dotenv').config();
const app=express();


app.use(express.json());
app.use("/users",userRouter)
 const PORT=process.env.PORT;
 app.listen(PORT,()=>{
    connectDb();
    console.log(`Server is started on PORT:${PORT}`)
 })