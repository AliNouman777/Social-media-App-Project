import mongoose from "mongoose";

export const  ConnectDb= ()=>{
    mongoose.connect("mongodb+srv://ali:12345@cluster0.awg30xs.mongodb.net/SocialMediaApp?retryWrites=true&w=majority&tls=true").then(()=>{
    console.log("connected to database")
    }).catch((error)=>{
      return  console.log("error connecting to database")
    });
}
