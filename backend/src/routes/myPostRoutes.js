import { Router } from 'express';
import upload from '../middleware/upload.js';
import { createPost, getPosts, deletePost } from '../controllers/myProfileController.js';
import { protect } from '../middleware/protectedMidlleware.js';

const router = Router();


// Create a new post (removed userId from path)
// router.post('/create', protect , upload.single('media'), createPost);
router.post('/create', createPost);

// GET all posts for the authenticated user
// router.get('/my-posts', protect, getPosts);
router.get('/my-posts', getPosts);

// DELETE a post
router.delete('/delete/:postId', protect, deletePost);

export default router;