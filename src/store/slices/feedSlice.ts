// ============================================================================
// FEED SLICE - Feed Posts Management
// ============================================================================

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { baseApi } from '../api/baseApi';
import type { 
  FeedState, 
  FeedPost,  
  ApiResponse,
  Comment
} from '../types';

// Initial state
const initialState: FeedState = {
  posts: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    hasMore: true,
  },
  isLoading: false,
  isSuccess: false,
  isError: false,
  error: null,
  userAuthenticated: false,
};

// Feed slice
const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      state.isError = false;
      state.error = null;
    },
    
    // Set posts (for initial load)
    setPosts: (state, action: PayloadAction<FeedPost[]>) => {
      state.posts = action.payload;
      state.isLoading = false;
      state.isSuccess = true;
    },
    
    // Add posts (for pagination/infinite scroll)
    addPosts: (state, action: PayloadAction<FeedPost[]>) => {
      state.posts = [...state.posts, ...action.payload];
      state.isLoading = false;
    },
    
    // Update post (for likes, comments, etc.)
    updatePost: (state, action: PayloadAction<{ id: string; updates: Partial<FeedPost> }>) => {
      const index = state.posts.findIndex(post => post._id === action.payload.id);
      if (index !== -1) {
        state.posts[index] = { ...state.posts[index], ...action.payload.updates };
      }
    },
    
    // Remove post
    removePost: (state, action: PayloadAction<string>) => {
      state.posts = state.posts.filter(post => post._id !== action.payload);
    },
    
    // Set pagination
    setPagination: (state, action: PayloadAction<Partial<FeedState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    
    // Toggle like
    toggleLike: (state, action: PayloadAction<{ postId: string; isLiked: boolean; likesCount: number }>) => {
      const { postId, isLiked, likesCount } = action.payload;
      const post = state.posts.find(p => p._id === postId);
      if (post) {
        post.isLiked = isLiked;
        post.likesCount = likesCount;
      }
    },
    
    // Set user authentication status
    setUserAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.userAuthenticated = action.payload;
    },
    
    // Set error
    setError: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.isError = true;
      state.error = action.payload;
    },
    
    // Clear error
    clearError: (state) => {
      state.isError = false;
      state.error = null;
    },
    
    // Reset feed
    resetFeed: () => initialState,
  },
});

// Feed API endpoints
export const feedApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Test endpoint
    testConnection: builder.query<{ message: string; timestamp: string }, void>({
      query: () => '/enhanced-posts/test',
    }),
    // Database test endpoint
    testDatabase: builder.query<{ message: string; postCount: number; timestamp: string }, void>({
      query: () => '/enhanced-posts/db-test',
    }),
    // Debug posts endpoint
    debugPosts: builder.query<{
      success: boolean;
      data: {
        totalPosts: number;
        activePublicPosts: number;
        userExcludedPosts: number;
        currentUserId: string | null;
        samplePosts: Array<{
          id: string;
          title: string;
          caption: string;
          user: {
            _id: string;
            firstName: string;
            lastName: string;
            email: string;
          };
          createdAt: string;
        }>;
      };
    }, void>({
      query: () => '/enhanced-posts/debug-posts',
    }),

    // Test user authentication and liked posts
    testUserLikes: builder.query<
      ApiResponse<{
        userId: string;
        likedPosts: string[];
        isAuthenticated: boolean;
      }>,
      void>({
      query: () => '/enhanced-posts/test-user-likes',
    }),

    // Get feed posts with pagination
    getFeedPosts: builder.query<
      ApiResponse<{
        posts: FeedPost[];
        pagination: {
          page: number;
          limit: number;
          total: number;
        };
        userAuthenticated: boolean;
      }>,
      {
        page?: number;
        limit?: number;
      }
    >({
      query: (params) => {
        console.log('=== RTK QUERY DEBUG ===');
        console.log('Making API call to /enhanced-posts/feed with params:', params);
        console.log('Full URL will be:', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/enhanced-posts/feed`);
        console.log('========================');
        return {
          url: '/enhanced-posts/feed',
          params,
        };
      },
      providesTags: ['FeedPost'],
      // Simplified - no pagination, just fetch all posts at once
    }),
    
    // Like/Unlike post
    toggleFeedPostLike: builder.mutation<
      ApiResponse<{ isLiked: boolean; likesCount: number }>,
      string
    >({
      query: (postId) => ({
        url: `/enhanced-posts/${postId}/like`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'FeedPost', id }],
      async onQueryStarted(postId, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log('✅ Like toggled successfully:', data);
          
          // Update all possible cache entries for getFeedPosts
          const possibleQueries = [
            { page: 1, limit: 5 },
            { page: 1, limit: 10 },
            { page: 1, limit: 20 },
            { page: 1, limit: 50 },
            { page: 1, limit: 100 },
          ];

          possibleQueries.forEach(queryParams => {
            try {
              dispatch(
                feedApi.util.updateQueryData('getFeedPosts', queryParams, (draft) => {
                  if (draft.data && data.data) {
                    const postIndex = draft.data.posts.findIndex(post => post._id === postId);
                    if (postIndex !== -1) {
                      console.log(`❤️ Updating like for post ${postId} in cache:`, queryParams);
                      // Update the post with the new like data
                      draft.data.posts[postIndex].isLiked = data.data.isLiked;
                      draft.data.posts[postIndex].likesCount = data.data.likesCount;
                      console.log(`✅ Like updated in cache for:`, queryParams);
                    }
                  }
                })
              );
            } catch (error) {
              console.log(`⚠️ Like cache update failed for ${JSON.stringify(queryParams)}:`, error);
            }
          });
        } catch (error) {
          console.error('❌ Failed to toggle like:', error);
        }
      },
    }),

    // Add comment to post
    addComment: builder.mutation<
      ApiResponse<{ post: FeedPost }>,
      { postId: string; content: string }
    >({
      query: ({ postId, content }) => ({
        url: `/enhanced-posts/${postId}/comments`,
        method: 'POST',
        body: { content },
      }),
      invalidatesTags: (result, error, { postId }) => [{ type: 'FeedPost', id: postId }],
      async onQueryStarted({ postId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log('✅ Comment added successfully:', data);
          
          // Update all possible cache entries for getFeedPosts
          const possibleQueries = [
            { page: 1, limit: 5 },
            { page: 1, limit: 10 },
            { page: 1, limit: 20 },
            { page: 1, limit: 50 },
            { page: 1, limit: 100 },
          ];

          possibleQueries.forEach(queryParams => {
            try {
              dispatch(
                feedApi.util.updateQueryData('getFeedPosts', queryParams, (draft) => {
                  if (draft.data && data.data) {
                    const postIndex = draft.data.posts.findIndex(post => post._id === postId);
                    if (postIndex !== -1) {
                      console.log(`💬 Updating comment for post ${postId} in cache:`, queryParams);
                      // Update the post with the new comment data
                      draft.data.posts[postIndex] = data.data.post;
                      console.log(`✅ Comment updated in cache for:`, queryParams);
                    }
                  }
                })
              );
            } catch (error) {
              console.log(`⚠️ Comment cache update failed for ${JSON.stringify(queryParams)}:`, error);
            }
          });
        } catch (error) {
          console.error('❌ Failed to add comment:', error);
        }
      },
    }),

    // Add new post to feed (optimistic update)
    addNewPostToFeed: builder.mutation<
      ApiResponse<{ post: FeedPost }>,
      FeedPost
    >({
      query: () => ({ url: '', method: 'POST' }), // Dummy query since this is just for cache update
      async onQueryStarted(newPost, { dispatch, getState }) {
        try {
          console.log('🔄 Adding new post to feed cache:', newPost);
          
          // Get all cached feed queries and update them
          const state = getState();
          const cache = feedApi.endpoints.getFeedPosts.select({ page: 1, limit: 100 })(state);
          
          if (cache.data) {
            // Update the specific cache entry
            dispatch(
              feedApi.util.updateQueryData('getFeedPosts', { page: 1, limit: 100 }, (draft) => {
                if (draft.data) {
                  // Add the new post at the beginning of the posts array
                  draft.data.posts.unshift(newPost);
                  // Update pagination
                  draft.data.pagination.total += 1;
                  console.log('✅ Updated feed cache with new post');
                }
              })
            );
          } else {
            // If no cache exists, invalidate to trigger a refetch
            console.log('⚠️ No feed cache found, invalidating to trigger refetch');
            dispatch(feedApi.util.invalidateTags(['FeedPost']));
          }
          
          console.log('✅ New post added to feed cache:', newPost);
        } catch (error) {
          console.error('❌ Failed to add new post to feed cache:', error);
          // Fallback: invalidate all feed queries
          dispatch(feedApi.util.invalidateTags(['FeedPost']));
        }
      },
    }),

    // Get post comments
    getPostComments: builder.query<
      ApiResponse<{ comments: Comment[] }>,
      string
    >({
      query: (postId) => `/enhanced-posts/${postId}/comments`,
      providesTags: (result, error, postId) => [{ type: 'FeedPost', id: postId }],
    }),
  }),
});

// Export actions
export const {
  setLoading,
  setPosts,
  addPosts,
  updatePost,
  removePost,
  setPagination,
  toggleLike,
  setUserAuthenticated,
  setError,
  clearError,
  resetFeed,
} = feedSlice.actions;

// Export API hooks
export const {
  useTestConnectionQuery,
  useTestDatabaseQuery,
  useDebugPostsQuery,
  useTestUserLikesQuery,
  useGetFeedPostsQuery,
  useToggleFeedPostLikeMutation,
  useAddCommentMutation,
  useAddNewPostToFeedMutation,
  useGetPostCommentsQuery,
} = feedApi;

// Selectors
export const selectFeedPosts = (state: { feed: FeedState }) => state.feed.posts;
export const selectFeedPagination = (state: { feed: FeedState }) => state.feed.pagination;
export const selectFeedLoading = (state: { feed: FeedState }) => state.feed.isLoading;
export const selectFeedError = (state: { feed: FeedState }) => state.feed.error;
export const selectUserAuthenticated = (state: { feed: FeedState }) => state.feed.userAuthenticated;

// Export reducer
export default feedSlice.reducer;
