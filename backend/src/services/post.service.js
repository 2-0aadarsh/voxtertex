import EnhancedPost from '../models/enhancedPost.js';
import EnhancedUser from '../models/enhancedUser.js';

/**
 * Post Service - Handles all post-related operations
 */
class PostService {
  
  /**
   * Create a new post
   */
  async createPost(userId, postData) {
    try {
      // Get user information
      const user = await EnhancedUser.findById(userId)
        .select('firstName lastName professionalTitle profileImage');
      
      if (!user) {
        throw new Error('User not found');
      }
      
      const post = new EnhancedPost({
        user: userId,
        userName: `${user.firstName} ${user.lastName}`,
        userProfileImage: user.profileImage,
        userProfessionalTitle: user.professionalTitle,
        ...postData
      });
      
      await post.save();
      return post;
    } catch (error) {
      throw new Error(`Failed to create post: ${error.message}`);
    }
  }
  
  /**
   * Get post by ID
   */
  async getPostById(postId) {
    try {
      const post = await EnhancedPost.findById(postId)
        .populate('user', 'firstName lastName professionalTitle profileImage')
        .populate('comments.user', 'firstName lastName profileImage')
        .populate('likes.user', 'firstName lastName')
        .populate('shares.user', 'firstName lastName');
      
      if (!post) {
        throw new Error('Post not found');
      }
      
      return post;
    } catch (error) {
      throw new Error(`Failed to get post: ${error.message}`);
    }
  }
  
  /**
   * Get user's posts
   */
  async getUserPosts(userId, page = 1, limit = 10) {
    try {
      const posts = await EnhancedPost.getUserPosts(userId, page, limit);
      return posts;
    } catch (error) {
      throw new Error(`Failed to get user posts: ${error.message}`);
    }
  }
  
  /**
   * Get public posts feed
   */
  async getPublicPosts(page = 1, limit = 10) {
    try {
      const posts = await EnhancedPost.getPublicPosts(page, limit);
      return posts;
    } catch (error) {
      throw new Error(`Failed to get public posts: ${error.message}`);
    }
  }
  
  /**
   * Update post
   */
  async updatePost(postId, userId, updateData) {
    try {
      const post = await EnhancedPost.findOne({ _id: postId, user: userId });
      
      if (!post) {
        throw new Error('Post not found or unauthorized');
      }
      
      // Store edit history
      if (updateData.title || updateData.caption) {
        const editHistory = {
          previousContent: {
            title: post.title,
            caption: post.caption
          },
          reason: updateData.editReason || 'Content updated'
        };
        
        post.editHistory.push(editHistory);
        post.isEdited = true;
        post.editedAt = new Date();
      }
      
      // Update allowed fields
      const allowedUpdates = ['title', 'caption', 'category', 'tags', 'visibility', 'allowComments', 'allowShares'];
      allowedUpdates.forEach(field => {
        if (updateData[field] !== undefined) {
          post[field] = updateData[field];
        }
      });
      
      await post.save();
      return post;
    } catch (error) {
      throw new Error(`Failed to update post: ${error.message}`);
    }
  }
  
  /**
   * Delete post
   */
  async deletePost(postId, userId) {
    try {
      const post = await EnhancedPost.findOne({ _id: postId, user: userId });
      
      if (!post) {
        throw new Error('Post not found or unauthorized');
      }
      
      await EnhancedPost.findByIdAndDelete(postId);
      return { message: 'Post deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete post: ${error.message}`);
    }
  }
  
  /**
   * Like/Unlike post
   */
  async toggleLike(postId, userId) {
    try {
      const post = await EnhancedPost.findById(postId);
      if (!post) {
        throw new Error('Post not found');
      }
      
      const user = await EnhancedUser.findById(userId).select('firstName lastName likedPosts');
      if (!user) {
        throw new Error('User not found');
      }
      
      // Initialize likedPosts array if it doesn't exist
      if (!user.likedPosts) {
        user.likedPosts = [];
      }
      
      const existingLike = post.likes.find(like => like.user.toString() === userId.toString());
      
      if (existingLike) {
        // Unlike
        await post.removeLike(userId);
        // Remove from user's liked posts
        await user.removeLikedPost(postId);
        return { 
          action: 'unliked', 
          isLiked: false, 
          likesCount: post.likesCount 
        };
      } else {
        // Like
        await post.addLike(userId, `${user.firstName} ${user.lastName}`);
        // Add to user's liked posts
        await user.addLikedPost(postId);
        return { 
          action: 'liked', 
          isLiked: true, 
          likesCount: post.likesCount 
        };
      }
    } catch (error) {
      throw new Error(`Failed to toggle like: ${error.message}`);
    }
  }
  
  /**
   * Add comment to post
   */
  async addComment(postId, userId, commentData) {
    try {
      const post = await EnhancedPost.findById(postId);
      if (!post) {
        throw new Error('Post not found');
      }
      
      if (!post.allowComments) {
        throw new Error('Comments are disabled for this post');
      }
      
      const user = await EnhancedUser.findById(userId)
        .select('firstName lastName profileImage profileImageUrl commentedPosts');
      if (!user) {
        throw new Error('User not found');
      }
      
      // Initialize commentedPosts array if it doesn't exist
      if (!user.commentedPosts) {
        user.commentedPosts = [];
      }
      
      const comment = {
        user: userId,
        userName: `${user.firstName} ${user.lastName}`,
        userProfileImage: user.profileImage,
        userProfileImageUrl: user.profileImageUrl, // Add this for consistency
        content: commentData.content
      };
      
      console.log('🔍 Backend Comment Debug:', {
        userId,
        userName: comment.userName,
        userProfileImage: user.profileImage,
        userProfileImageUrl: user.profileImageUrl,
        commentData: comment
      });
      
      await post.addComment(comment);
      
      // Add to user's commented posts
      await user.addCommentedPost(postId);
      
      // Populate the comments with user data before returning
      const populatedPost = await EnhancedPost.findById(postId)
        .populate('user', 'firstName lastName professionalTitle profileImageUrl')
        .populate('comments.user', 'firstName lastName profileImageUrl')
        .lean();
      
      return populatedPost;
    } catch (error) {
      throw new Error(`Failed to add comment: ${error.message}`);
    }
  }
  
  /**
   * Update comment
   */
  async updateComment(postId, commentId, userId, updateData) {
    try {
      const post = await EnhancedPost.findById(postId);
      if (!post) {
        throw new Error('Post not found');
      }
      
      const comment = post.comments.id(commentId);
      if (!comment) {
        throw new Error('Comment not found');
      }
      
      if (comment.user.toString() !== userId.toString()) {
        throw new Error('Unauthorized to update this comment');
      }
      
      comment.content = updateData.content;
      comment.isEdited = true;
      comment.editedAt = new Date();
      
      await post.save();
      return post;
    } catch (error) {
      throw new Error(`Failed to update comment: ${error.message}`);
    }
  }
  
  /**
   * Delete comment
   */
  async deleteComment(postId, commentId, userId) {
    try {
      const post = await EnhancedPost.findById(postId);
      if (!post) {
        throw new Error('Post not found');
      }
      
      const comment = post.comments.id(commentId);
      if (!comment) {
        throw new Error('Comment not found');
      }
      
      // Check if user owns the comment or the post
      if (comment.user.toString() !== userId.toString() && post.user.toString() !== userId.toString()) {
        throw new Error('Unauthorized to delete this comment');
      }
      
      await post.removeComment(commentId);
      return post;
    } catch (error) {
      throw new Error(`Failed to delete comment: ${error.message}`);
    }
  }
  
  /**
   * Share post
   */
  async sharePost(postId, userId, shareNote = '') {
    try {
      const post = await EnhancedPost.findById(postId);
      if (!post) {
        throw new Error('Post not found');
      }
      
      if (!post.allowShares) {
        throw new Error('Sharing is disabled for this post');
      }
      
      const user = await EnhancedUser.findById(userId).select('firstName lastName');
      if (!user) {
        throw new Error('User not found');
      }
      
      await post.addShare(userId, `${user.firstName} ${user.lastName}`, shareNote);
      return { message: 'Post shared successfully', sharesCount: post.sharesCount };
    } catch (error) {
      throw new Error(`Failed to share post: ${error.message}`);
    }
  }
  
  /**
   * Report post
   */
  async reportPost(postId, userId, reportData) {
    try {
      const post = await EnhancedPost.findById(postId);
      if (!post) {
        throw new Error('Post not found');
      }
      
      // Check if user already reported this post
      const existingReport = post.reports.find(report => 
        report.reporter.toString() === userId.toString()
      );
      
      if (existingReport) {
        throw new Error('You have already reported this post');
      }
      
      const report = {
        reporter: userId,
        reason: reportData.reason,
        description: reportData.description
      };
      
      await post.addReport(report);
      return { message: 'Post reported successfully' };
    } catch (error) {
      throw new Error(`Failed to report post: ${error.message}`);
    }
  }
  
  /**
   * Search posts
   */
  async searchPosts(query, page = 1, limit = 10) {
    try {
      const posts = await EnhancedPost.searchPosts(query, page, limit);
      return posts;
    } catch (error) {
      throw new Error(`Failed to search posts: ${error.message}`);
    }
  }
  
  /**
   * Get posts by category
   */
  async getPostsByCategory(category, page = 1, limit = 10) {
    try {
      const posts = await EnhancedPost.find({
        category,
        status: 'active',
        visibility: 'public'
      })
      .populate('user', 'firstName lastName professionalTitle')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
      
      return posts;
    } catch (error) {
      throw new Error(`Failed to get posts by category: ${error.message}`);
    }
  }
  
  /**
   * Get trending posts
   */
  async getTrendingPosts(page = 1, limit = 10) {
    try {
      const posts = await EnhancedPost.find({
        status: 'active',
        visibility: 'public',
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
      })
      .populate('user', 'firstName lastName professionalTitle')
      .sort({ 'analytics.engagement': -1, likesCount: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
      
      return posts;
    } catch (error) {
      throw new Error(`Failed to get trending posts: ${error.message}`);
    }
  }
  
  /**
   * Pin/Unpin post (for post owner)
   */
  async togglePinPost(postId, userId) {
    try {
      const post = await EnhancedPost.findOne({ _id: postId, user: userId });
      
      if (!post) {
        throw new Error('Post not found or unauthorized');
      }
      
      await post.togglePin();
      return { 
        message: `Post ${post.isPinned ? 'pinned' : 'unpinned'} successfully`,
        isPinned: post.isPinned 
      };
    } catch (error) {
      throw new Error(`Failed to toggle pin post: ${error.message}`);
    }
  }
  
  /**
   * Increment post views
   */
  async incrementViews(postId) {
    try {
      const post = await EnhancedPost.findById(postId);
      if (!post) {
        throw new Error('Post not found');
      }
      
      await post.incrementViews();
      return post;
    } catch (error) {
      throw new Error(`Failed to increment views: ${error.message}`);
    }
  }

  /**
   * Get enhanced posts for feed (excluding current user)
   */
  async getEnhancedPosts(page = 1, limit = 100, currentUserId = null) {
    try {
      console.log('=== POST SERVICE DEBUG ===');
      console.log('📞 PostService.getEnhancedPosts called with:', { page, limit, currentUserId });
      
      let query = {
        status: 'active',
        visibility: 'public'
      };
      
      // Exclude current user's posts if userId is provided
      if (currentUserId) {
        query.user = { $ne: currentUserId };
        console.log('🚫 Excluding posts from user:', currentUserId);
      } else {
        console.log('👤 No user ID provided, showing all posts');
      }
      
      console.log('🔍 MongoDB query:', JSON.stringify(query, null, 2));
      
      // Check if EnhancedPost model is available
      console.log('📋 EnhancedPost model:', EnhancedPost ? 'Available' : 'Not available');
      
      // Get ALL posts at once (no pagination)
      const posts = await EnhancedPost.find(query)
        .populate('user', 'firstName lastName professionalTitle profileImageUrl')
        .populate('comments.user', 'firstName lastName profileImageUrl')
        .sort({ createdAt: -1 })
        .limit(limit) // Limit to prevent memory issues, but fetch many more
        .lean();
      
      console.log('📊 Posts retrieved:', posts.length);
      
      // Get user's liked posts if currentUserId is provided
      let userLikedPosts = [];
      if (currentUserId) {
        const user = await EnhancedUser.findById(currentUserId).select('likedPosts');
        userLikedPosts = user?.likedPosts || [];
        console.log('👤 User liked posts:', userLikedPosts.length);
      }
      
      // Add isLiked property to each post
      const postsWithLikeStatus = posts.map(post => ({
        ...post,
        isLiked: currentUserId ? userLikedPosts.some(likedPostId => likedPostId.toString() === post._id.toString()) : false
      }));
      
      console.log('📋 Posts found:', postsWithLikeStatus.length);
      console.log('📄 Sample post structure:', postsWithLikeStatus[0] ? {
        id: postsWithLikeStatus[0]._id,
        title: postsWithLikeStatus[0].title,
        caption: postsWithLikeStatus[0].caption?.substring(0, 50) + '...',
        user: postsWithLikeStatus[0].user,
        userProfileImageUrl: postsWithLikeStatus[0].user?.profileImageUrl,
        isLiked: postsWithLikeStatus[0].isLiked,
        status: postsWithLikeStatus[0].status,
        visibility: postsWithLikeStatus[0].visibility,
        createdAt: postsWithLikeStatus[0].createdAt
      } : 'No posts found');
      console.log('========================');
      
      return {
        posts: postsWithLikeStatus,
        totalCount: postsWithLikeStatus.length
      };
    } catch (error) {
      console.error('=== POST SERVICE ERROR ===');
      console.error('❌ PostService.getEnhancedPosts error:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('=========================');
      throw new Error(`Failed to get enhanced posts: ${error.message}`);
    }
  }
}

export default new PostService();












