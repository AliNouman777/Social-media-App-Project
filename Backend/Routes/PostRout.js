import express from "express"
import { isAuth } from "../Middleware/Middleware.js";
import { createPost, DeletePost, MyPost, LikeAndUnlike,AllPost,updatePost,CommentAdded, deleteComment,viewComment } from "../Controller/PostController.js"

const router = express.Router();


router.get("/me", isAuth, MyPost);


router.get("/all", isAuth, AllPost );


router.post("/upload", isAuth, createPost);


router.get("/LikeandUnlike/:id", isAuth, LikeAndUnlike);


router.put("/CreatComment/:id" ,isAuth, CommentAdded);


router.get("/viewcomment/:id", isAuth ,viewComment)


router.put("/update/:id",isAuth,updatePost);


router.delete("/delete/:id", isAuth, DeletePost);

router.delete("/deleteComment/:id", isAuth ,deleteComment)



export default router;