// controllers/myProfileController.js
import Post from "../models/myPost.js";

// @desc    Create a new post
// @route   POST /api/posts/create
// @access  Private
export const createPost = async (req, res) => {
  try {
    console.log("create posts")
    const { content, date, likes, comments ,mediaType } = req.body;
    console.log(content, date, likes, comments ,mediaType)

    // if (!caption || !mediaType) {
    //   return res.status(400).json({ message: "Caption and mediaType are required" });
    // }

    // const post = new Post({
    //   user_id: req.user._id,
    //   user_name: req.user.fullName || req.user.name || "Anonymous",
    //   caption,
    //   title,
    //   mediaType,
    //   mediaData: req.file ? req.file.path : null,
    // });

    // const savedPost = await post.save();
    // res.status(201).json(savedPost);


    
    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    const post = new Post({
      content,
      date,
      likes,
      comments,
      mediaType,
    });

    await post.save();

    res.status(201).json(post);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get posts of the authenticated user
// @route   GET /api/posts/my-posts
// @access  Private
export const getPosts = async (req, res) => {
  // try {
  //   const posts = await Post.find({ user_id: req.user._id })
  //     .sort({ createdAt: -1 }); // newest first
  //   res.status(200).json(posts);
  // } catch (error) {
  //   console.error("Error fetching posts:", error);
  //   res.status(500).json({ message: "Server error", error: error.message });
  // }
  try {
    // If you’re not saving userId yet, just fetch all posts
    const posts = await Post.find().sort({ createdAt: -1 });
    
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Failed to fetch posts" });
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/delete/:postId
// @access  Private
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.postId, user_id: req.user._id });

    if (!post) {
      return res.status(404).json({ message: "Post not found or unauthorized" });
    }

    await post.deleteOne();
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
