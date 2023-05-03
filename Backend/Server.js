import express from "express"
import dotenv from "dotenv";
import { ConnectDb } from "./Database/ConnectDB.js";
import UserRouter from "./Routes/UserRout.js"
import PostRouter from "./Routes/PostRout.js"
import bodyParser  from "body-parser";
import cookieParser from 'cookie-parser';
import cors from 'cors';
import cloudinary from "cloudinary"

const app=express();

ConnectDb();



dotenv.config({path:"./Backend/.env"});

app.use(cors({
    origin: [process.env.ALLOWED_ORIGIN],
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  }));

  cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_API_KEY,
    api_secret:process.env.CLOUD_API_SECRET,
})

  
//middlewares
const limit = { limit: "50mb" };

app.use(express.json(limit));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));


// Routes
app.use("/user", UserRouter);
app.use("/post",PostRouter)

// *************

app.listen(process.env.PORT,()=>{
    console.log(`server is listening of port ${process.env.PORT}`)
})

// *****************
app.get(("/"),(req, res)=>{
    res.send("<h1>Working !!!!</h1>")
})

export default app;