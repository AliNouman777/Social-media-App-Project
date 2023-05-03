import mongoose from "mongoose";

export const  ConnectDb= ()=>{
    mongoose.connect("mongodb+srv://admin:micro786@practice.9ljftft.mongodb.net/?retryWrites=true&w=majority").then(()=>{
    console.log("connected to database")
    }).catch((error)=>{
      return  console.log(error)
    });
}