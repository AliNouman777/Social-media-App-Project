import { User } from "../Database/Modals/User.js";
import { Post } from "../Database/Modals/Post.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cloudinary from "cloudinary";

export const Register = async (req, res) => {
  try {
    const { name, email, password ,avatar} = req.body;

    if (!name || !email || !password || !avatar) {
      return res.status(400).json({
        success: false,
        message: "Must not be empty",
      });
    }
console.log("ok")
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: "already exists",
      });
    }

    console.log("this is also ok")

    const mycloud= await cloudinary.v2.uploader.upload(avatar,{
      folder:"avatars",
    });


    

    if (!mycloud) {
      return res.status(404).json({
        success: false,
        message: "Failed to upload image to Cloudinary",
      });
    }


    let newuser = new User({
      avatar: {
        public_id: mycloud.public_id,
        url: mycloud.secure_url,
      },
      name,
      email,
      password,
    });

    console.log("okay")

    newuser = await newuser.save();
console.log("user saved")
    const token = jwt.sign({ id: newuser._id }, process.env.JWT_SECRET);

    res
      .status(200)
      .cookie("token", token, {
        maxAge: 15 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite:process.env.NODE_ENV==="development"?"lax":"none",
        secure:process.env.NODE_ENV==="development"?false:true,
      })
      .json({
        success: false,
        messsage: newuser,
      });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "must not empty",
      });
    }
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials",
      });
    }
    const matchpassword = await bcrypt.compare(password, user.password);

    if (!matchpassword) {
      return res.status(400).json({
        success: false,
        message: "invalid Credentials",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 15 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite:process.env.NODE_ENV==="development"?"lax":"none",
        secure:process.env.NODE_ENV==="development"?false:true,
      })
      .json({
        success: true,
        message: "logged in successfully",
      });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const Logout = (req, res) => {
  try { 
    res
      .status(200)
      .cookie("token", "", {
        expires: new Date(Date.now()),
        httpOnly: false,
        sameSite:process.env.NODE_ENV==="development"?"lax":"none",
        secure:process.env.NODE_ENV==="development"?false:true,
      })
      .json({
        success: true,
        message: "Logged Out",
      });
  } catch (error) {
    return res.status(500).json({
      success: false,
      Message: "fail to logout",
      message: error.message,
    });
  }
};

export const Follower = async (req, res) => {
  try {
    const userTofollow = await User.findById(req.params.id);

    const loggedInuser = await User.findById(req.user);

    if (!userTofollow) {
      return res.status(404).json({ error: "User not found" });
    }

    if (loggedInuser.following.includes(userTofollow._id)) {
      const indexfollowing = loggedInuser.following.indexOf(userTofollow._id);
      loggedInuser.following.splice(indexfollowing, 1);

      const indexfollower = userTofollow.followers.indexOf(loggedInuser._id);
      userTofollow.followers.splice(indexfollower, 1);

      await loggedInuser.save();
      await userTofollow.save();

      return res.status(200).json({
        success: true,
        message: "user Unfollow successfully",
      });
    }

    loggedInuser.following.push(req.params.id);
    userTofollow.followers.push(req.user);

    await loggedInuser.save();
    await userTofollow.save();

    return res.status(200).json({
      success: true,
      message: "Followed Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "fail",
      error: error.message,
    });
  }
};

export const getAllpostofFollowing = async (req, res) => {
  try {
    const id = req.user;
    const post = await User.findById({ _id: id }).populate("post");

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Posts Not found",
      });
    }

    return res.status(200).json({
      success: true,
      post: post.post,
      message: "User Find Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const MyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user).populate("post");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not found",
      });
    }
    return res.status(200).json({
      success: false,
      MyProfile: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const AllProfiles = async (req, res) => {
  try {
    const user = await User.find({});
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not found",
      });
    }
    return res.status(200).json({
      success: false,
      AllUsers: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const ChangePassword = async (req, res) => {
  try {
    const { oldpassword, password, confirmpassword } = req.body;

    const user = await User.findById(req.user).select("+password");

    if (!oldpassword || !password || !confirmpassword) {
      return res.status(400).json({
        success: false,
        message: "Fields must not empty",
      });
    }

    const isMatch = await bcrypt.compare(oldpassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "OldPassword do not match",
      });
    }

    if (password !== confirmpassword) {
      return res.status(400).json({
        success: false,
        message: "password do not matched ",
      });
    }

    user.password = password;
    await user.save();

    res.status(200).json({
      success: true,
      message: "password changed",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const Changeprofile = async (req, res) => {
  try {
    const { name, email } = req.body;
    
    const user = await User.findById(req.user);

    if(!user){
     return res.status(404).json({message:"user not found"})
    }

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "field must not empty",
      });
    }
    
    user.name = name;
    user.email = email;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:console.log(error),
      message: error.message,
    });
  }
};

export const DeleteProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user).populate("post");
    const followings = await User.find({ _id: user.following });
    const followers = await User.find({ _id: user.followers });

    if (user._id.toString() !== req.user.toString()) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    for (let i = 0; i < followings.length; i++) {
      followings[i].followers.forEach((element, index) => {
        if (element.toString() === req.user.toString()) {
          followings[i].followers.splice(index, 1);
        }
      });
    }

    for (let i = 0; i < followers.length; i++) {
      followers[i].following.forEach((element, index) => {
        if (element.toString() === req.user.toString()) {
          followers[i].following.splice(index, 1);
        }
      });
    }

    await user.deleteOne();

    await Promise.all(followers.map((follower) => follower.save()));

    await Post.deleteMany({ owner: req.user });

    res
      .status(200)
      .cookie("token", "", {
        expires: new Date(Date.now()),
        httpOnly: false,
        sameSite:process.env.NODE_ENV==="development"?"lax":"none",
        secure:process.env.NODE_ENV==="development"?false:true,
      })
      .json({
        success: true,
        message: "profile deleted",
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPostofUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("post");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const Myfollower =async(req, res) => {
    try {
        const user =await User.findById(req.user);
        const newuser=await User.find({_id:user.followers});

        if(!user || !newuser.length>0){
            return res.status(404).json({
                success:false,
                message:"User Not found"
            });
        }

        res.status(200).json({
            success: true,
            followers: newuser  
        })
    }
     catch (error) {
        res.status(500).json({
            success: false,
            message:error.message
        })
    }
};


export const Myfollowing=async(req, res)=>{
   
    try {
        const user =await User.findById(req.user);
        const newuser=await User.find({_id:user.following});

        if(!user || !newuser.length>0){
            return res.status(404).json({
                success:false,
                message:"User Not found"
            })
        }

        res.status(200).json({
            success: true,
            following: newuser  
        })
    }
     catch (error) {
        res.status(500).json({
            success: false,
            message:error.message
        })
    }
  
  }

