// ============================================================================
// POSTS SLICE - Posts Management
// ============================================================================

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { baseApi } from '../api/baseApi';
import type { 
  PostsState, 
  Post, 
  CreatePostRequest,
  ApiResponse,
  PaginatedResponse 
} from '../types';

// Initial state
const initialState: PostsState = {
  posts: [],
  currentPost: null,
  filters: {},
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
};

// Posts slice
const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      state.isError = false;
      state.error = null;
    },
    
    // Set posts
    setPosts: (state, action: PayloadAction<Post[]>) => {
      state.posts = action.payload;
      state.isLoading = false;
      state.isSuccess = true;
    },
    
    // Add posts (for pagination)
    addPosts: (state, action: PayloadAction<Post[]>) => {
      state.posts = [...state.posts, ...action.payload];
      state.isLoading = false;
    },
    
    // Add new post
    addPost: (state, action: PayloadAction<Post>) => {
      state.posts.unshift(action.payload);
    },
    
    // Update post
    updatePost: (state, action: PayloadAction<{ id: string; updates: Partial<Post> }>) => {
      const index = state.posts.findIndex(post => post._id === action.payload.id);
      if (index !== -1) {
        state.posts[index] = { ...state.posts[index], ...action.payload.updates };
      }
      if (state.currentPost && state.currentPost._id === action.payload.id) {
        state.currentPost = { ...state.currentPost, ...action.payload.updates };
      }
    },
    
    // Remove post
    removePost: (state, action: PayloadAction<string>) => {
      state.posts = state.posts.filter(post => post._id !== action.payload);
      if (state.currentPost && state.currentPost._id === action.payload) {
        state.currentPost = null;
      }
    },
    
    // Set current post
    setCurrentPost: (state, action: PayloadAction<Post | null>) => {
      state.currentPost = action.payload;
    },
    
    // Set filters
    setFilters: (state, action: PayloadAction<PostsState['filters']>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    // Clear filters
    clearFilters: (state) => {
      state.filters = {};
    },
    
    // Set pagination
    setPagination: (state, action: PayloadAction<Partial<PostsState['pagination']>>) => {
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
      if (state.currentPost && state.currentPost._id === postId) {
        state.currentPost.isLiked = isLiked;
        state.currentPost.likesCount = likesCount;
      }
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
    
    // Reset posts
    resetPosts: () => initialState,
  },
});

// Posts API endpoints
export const postsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get posts with pagination and filters
    getPosts: builder.query<
      PaginatedResponse<Post>,
      {
        page?: number;
        limit?: number;
        category?: string;
        tags?: string[];
        visibility?: string;
        userId?: string;
      }
    >({
      query: (params) => ({
        url: '/posts',
        params,
      }),
      providesTags: ['Post'],
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 1) {
          return newItems;
        }
        return {
          ...newItems,
          data: [...(currentCache.data || []), ...(newItems.data || [])],
        };
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
    }),
    
    // Get single post
    getPost: builder.query<ApiResponse<Post>, string>({
      query: (postId) => `/posts/${postId}`,
      providesTags: (result, error, id) => [{ type: 'Post', id }],
    }),
    
    // Create post
    createPost: builder.mutation<ApiResponse<Post>, CreatePostRequest>({
      query: (postData) => ({
        url: '/posts',
        method: 'POST',
        body: postData,
      }),
      invalidatesTags: ['Post'],
    }),
    
    // Update post
    updatePost: builder.mutation<
      ApiResponse<Post>,
      { id: string; updates: Partial<CreatePostRequest> }
    >({
      query: ({ id, updates }) => ({
        url: `/posts/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Post', id }],
    }),
    
    // Delete post
    deletePost: builder.mutation<ApiResponse, string>({
      query: (postId) => ({
        url: `/posts/${postId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Post', id }],
    }),
    
    // Like/Unlike post
    togglePostLike: builder.mutation<
      ApiResponse<{ isLiked: boolean; likesCount: number }>,
      string
    >({
      query: (postId) => ({
        url: `/posts/${postId}/like`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Post', id }],
    }),
    
    // Upload post media
    uploadPostMedia: builder.mutation<
      ApiResponse<{ mediaUrls: string[] }>,
      FormData
    >({
      query: (formData) => ({
        url: '/posts/upload-media',
        method: 'POST',
        body: formData,
        formData: true,
      }),
    }),
    
    // Create post with media
    createPostWithMedia: builder.mutation<
      ApiResponse<Post>,
      FormData
    >({
      query: (formData) => ({
        url: '/post/create-with-media',
        method: 'POST',
        body: formData,
        formData: true,
      }),
      invalidatesTags: ['Post'],
    }),
  }),
});

// Export actions
export const {
  setLoading,
  setPosts,
  addPosts,
  addPost,
  updatePost,
  removePost,
  setCurrentPost,
  setFilters,
  clearFilters,
  setPagination,
  toggleLike,
  setError,
  clearError,
  resetPosts,
} = postsSlice.actions;

// Export API hooks
export const {
  useGetPostsQuery,
  useGetPostQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useTogglePostLikeMutation,
  useUploadPostMediaMutation,
  useCreatePostWithMediaMutation,
} = postsApi;

// Selectors
export const selectPosts = (state: { posts: PostsState }) => state.posts.posts;
export const selectCurrentPost = (state: { posts: PostsState }) => state.posts.currentPost;
export const selectPostsFilters = (state: { posts: PostsState }) => state.posts.filters;
export const selectPostsPagination = (state: { posts: PostsState }) => state.posts.pagination;
export const selectPostsLoading = (state: { posts: PostsState }) => state.posts.isLoading;
export const selectPostsError = (state: { posts: PostsState }) => state.posts.error;

// Export reducer
export default postsSlice.reducer;




