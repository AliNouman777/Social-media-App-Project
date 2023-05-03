import { Post } from "../Database/Modals/Post.js";
import User from "../Database/Modals/User.js";
import cloudinary from "cloudinary";


export const createPost = async (req, res) => {
  try {
    const { caption, image } = req.body;

    if (!caption || !image) {
      
      return res.status(400).json({
        success: false,
        message: "Caption and image are required",
      });
    }

    const mycloud = await cloudinary.v2.uploader.upload(image, {
      folder: "Posts",
    });

    if (!mycloud) {
      return res.status(404).json({
        success: false,
        message: "Failed to upload image to Cloudinary",
      });
    }

    const newPost = await Post.create({
      image: {
        public_id: mycloud.public_id,
        url: mycloud.secure_url,
      },
      caption,
      owner: req.user,
    });

    if (!newPost) {
      return res.status(400).json({
        success: false,
        message: "Failed to create post",
      });
    }

  const user=await User.findById(req.user); 

  user.post.unshift(newPost._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User Not found",
    });
  }

  await user.save();  


  

    return res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: newPost,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to create post",
    });
  }
};


export const DeletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const key = req.user;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "post not found!",
      });
    }

    if (key.toString() !== post.owner.toString()) {
      return res.status(401).json({
        success: false,
        message: "Unauthorize",
      });
    }

    let user = await User.findById(req.user);
    if (user.post.includes(id)) {
      const idex = user.post.indexOf(id);
      user.post.splice(idex, 1);
      
    }

    await cloudinary.v2.uploader.destroy(post.image.public_id);

    await post.deleteOne();

    return res.status(200).json({
      success: true,
      message: "post delted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const MyPost = async (req, res) => {
  try {
    const id = req.user;
    const user = await User.findById(id).populate("post");
    if (!user) {
      return res.status(404).json({
        success: true,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      user: user.post,
    });
  } catch (error) {
    res.status(500).json({
      success: true,
      message: error.message,
    });
  }
};

export const LikeAndUnlike = async (req, res) => {
  try {
    const key = req.user;
    let post = await Post.findById(req.params.id);
    if (!post) {
      res.status(400).json({
        success: false,
        message: "post not found",
      });
    }

    if (post.likes.includes(req.user)) {
      const index = post.likes.indexOf(req.user);

      post.likes.splice(index, 1);
      await post.save();
      return res.status(200).json({
        success: true,
        like: false,
        message: "Post Unlike",
      });
    }

    post.likes.push(req.user);
    await post.save();
    res.status(200).json({
      success: true,
      like: true,
      message: "Post Like",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const AllPost = async (req, res) => {
  try {
    const user = await Post.find({}).populate("owner");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not found",
      });
    }
    return res.status(200).json({
      success: true,
      Post: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const { caption } = req.body;

    if (req.user.toString() !== post.owner.toString()) {
      return res.status(401).json("Unautorize");
    }

    post.caption = caption;

    post.save();

    return res.status(200).json({
      success: true,
      post: post.caption,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const CommentAdded = async (req, res) => {
  try {
    const user = await User.findById(req.user);
    
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post Not Found",
      });
    }
    const { comment } = req.body;
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Please Add comment",
      });
    }

    let addCommentIndex = -1;
    
    post.comments.forEach((item, index) => {
      if (req.user.toString() === req.user) {
        return (addCommentIndex = index);
      }
    });

    if (addCommentIndex !== -1) {
      for (let i = 0; i < post.comments.length; i++) {
        if (post.comments[addCommentIndex].user.toString() === req.user) {
          post.comments[addCommentIndex].comment = comment;
          post.save();
          return res.status(200).json({
            success: true,
            message: "comment Updated",
          });
        }
      }
    }
    post.comments.push({
      user: req.user,
      comment,
    });
    await post.save();
    return res.status(200).json({
      success: true,
      message: "comment Added",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      comment:"comment not add",
      message: error,
     error: console.log(error)
    });
  }
};

export const deleteComment = async (req, res) => {
  try {

    const user = await User.findById(req.user);

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    let deleteCommentIndex = -1;

    post.comments.forEach((item, index) => {
      if (
        post.owner.toString() === req.user.toString() ||
        item.user.toString() === req.user.toString()
      ) {
        deleteCommentIndex = index;
      }
    }
    );

    if (!post.comments.length) {
      return res.status(404).json({
        success: false,
        message: "no comment found",
      });
    }

    const { commentId } = req.body;

    if (post.owner.toString() === req.user.toString()) {
      let delItem = -1;
      post.comments.forEach(async (item, index) => {
        if (item._id.toString() === commentId) {
          delItem = index;
        }
      });
      
      if (delItem !== -1) {
        post.comments.splice(delItem, 1);
        await post.save();
        return res.status(200).json({
          success: true,
          message: "Comment deleted",
        });
      }

      return res.status(404).json({
        success: false,
        message: "Not found comment",
      });
    } else {
      for (let i = 0; i < post.comments.length; i++) {
        if (post.comments[deleteCommentIndex]) {
          if (post.comments[deleteCommentIndex].user.toString() === req.user) {
            post.comments.splice(deleteCommentIndex, 1);
            await post.save();

            return res.status(200).json({
              success: true,
              message: "you have deleted your comment",
            });
          }
        } else {
          return res.status(404).json({
            success: false,
            message: "comment not found",
          });
        }
      }
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error:console.log(error)
    });
  }
};

export const viewComment=async (req, res)=>{
    try {
        const post = await Post.findById(req.params.id).populate("comments.user");
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }
        return res.status(200).json({
            success: true,
            comment: post,
        });

    } catch (error) {
       res.status(500).json({
      success: false,
      message: error.message,
    });
    }
}