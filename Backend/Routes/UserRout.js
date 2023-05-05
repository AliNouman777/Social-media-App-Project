import express from "express";
import { Register, Login, Logout, Follower, getAllpostofFollowing, MyProfile, AllProfiles, ChangePassword, Changeprofile, DeleteProfile,getPostofUser ,Myfollower ,Myfollowing  } from "../Controller/UserController.js";

import { isAuth } from "../Middleware/Middleware.js";

const router = express.Router();

router.post("/register", Register);

router.post("/login", Login);

router.get("/logout", isAuth, Logout);

router.post("/followingPost", isAuth, getAllpostofFollowing)


//Profile related routes *************************

router.get("/me", isAuth, MyProfile)

router.get("/myfollower" ,isAuth,Myfollower)

router.get("/myfollowing" ,isAuth,Myfollowing)

router.get("/all", isAuth,AllProfiles)

router.put("/changeprofile",isAuth ,Changeprofile)

router.put("/changepassword", isAuth, ChangePassword)

router.delete("/deleteprofile", isAuth, DeleteProfile)

//All Dynamic routes  *****************************

router.get("/follower/:id", isAuth, Follower)

// get specific user post

router.get("/:id",isAuth,getPostofUser)
export default router