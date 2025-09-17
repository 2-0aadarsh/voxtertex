// ============================================================================
// VIDEOS SLICE - Featured Videos Management
// ============================================================================

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { baseApi } from '../api/baseApi';
import type { 
  VideosState, 
  FeaturedVideo, 
  CreateVideoRequest,
  ApiResponse 
} from '../types';

// Initial state
const initialState: VideosState = {
  videos: [],
  currentVideo: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  error: null,
};

// Videos slice
const videosSlice = createSlice({
  name: 'videos',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      state.isError = false;
      state.error = null;
    },
    
    setVideos: (state, action: PayloadAction<FeaturedVideo[]>) => {
      state.videos = action.payload.sort((a, b) => b.order - a.order);
      state.isLoading = false;
      state.isSuccess = true;
    },
    
    addVideo: (state, action: PayloadAction<FeaturedVideo>) => {
      state.videos.unshift(action.payload);
      state.videos.sort((a, b) => b.order - a.order);
    },
    
    updateVideo: (state, action: PayloadAction<{ id: string; updates: Partial<FeaturedVideo> }>) => {
      const index = state.videos.findIndex(video => video._id === action.payload.id);
      if (index !== -1) {
        state.videos[index] = { ...state.videos[index], ...action.payload.updates };
        state.videos.sort((a, b) => b.order - a.order);
      }
      if (state.currentVideo && state.currentVideo._id === action.payload.id) {
        state.currentVideo = { ...state.currentVideo, ...action.payload.updates };
      }
    },
    
    removeVideo: (state, action: PayloadAction<string>) => {
      state.videos = state.videos.filter(video => video._id !== action.payload);
      if (state.currentVideo && state.currentVideo._id === action.payload) {
        state.currentVideo = null;
      }
    },
    
    setCurrentVideo: (state, action: PayloadAction<FeaturedVideo | null>) => {
      state.currentVideo = action.payload;
    },
    
    incrementViewCount: (state, action: PayloadAction<string>) => {
      const video = state.videos.find(v => v._id === action.payload);
      if (video) {
        video.viewCount += 1;
      }
      if (state.currentVideo && state.currentVideo._id === action.payload) {
        state.currentVideo.viewCount += 1;
      }
    },
    
    reorderVideos: (state, action: PayloadAction<{ id: string; newOrder: number }[]>) => {
      action.payload.forEach(({ id, newOrder }) => {
        const video = state.videos.find(v => v._id === id);
        if (video) {
          video.order = newOrder;
        }
      });
      state.videos.sort((a, b) => b.order - a.order);
    },
    
    setError: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.isError = true;
      state.error = action.payload;
    },
    
    clearError: (state) => {
      state.isError = false;
      state.error = null;
    },
    
    resetVideos: () => initialState,
  },
});

// Videos API endpoints
export const videosApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getVideos: builder.query<
      ApiResponse<FeaturedVideo[]>, 
      { userId?: string; category?: string; visibility?: string }
    >({
      query: (params) => ({
        url: '/featured-videos/current',
        params,
      }),
      providesTags: ['Video'],
    }),
    
    getVideo: builder.query<ApiResponse<FeaturedVideo>, string>({
      query: (videoId) => `/featured-videos/${videoId}`,
      providesTags: (result, error, id) => [{ type: 'Video', id }],
    }),
    
    createVideo: builder.mutation<ApiResponse<FeaturedVideo>, CreateVideoRequest>({
      query: (videoData) => ({
        url: '/featured-videos',
        method: 'POST',
        body: videoData,
      }),
      invalidatesTags: ['Video', 'Profile'],
    }),
    
    updateVideo: builder.mutation<
      ApiResponse<FeaturedVideo>,
      { id: string; updates: Partial<CreateVideoRequest> }
    >({
      query: ({ id, updates }) => ({
        url: `/featured-videos/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['Video', 'Profile'],
    }),
    
    deleteVideo: builder.mutation<ApiResponse, string>({
      query: (videoId) => ({
        url: `/featured-videos/${videoId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Video', 'Profile'],
    }),
    
    reorderVideos: builder.mutation<
      ApiResponse<FeaturedVideo[]>,
      { id: string; newOrder: number }[]
    >({
      query: (orderData) => ({
        url: '/featured-videos/reorder',
        method: 'PATCH',
        body: { videos: orderData },
      }),
      invalidatesTags: ['Video', 'Profile'],
    }),
    
    incrementVideoViews: builder.mutation<
      ApiResponse<{ viewCount: number }>,
      string
    >({
      query: (videoId) => ({
        url: `/featured-videos/${videoId}/view`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Video', id }],
    }),
    
    uploadVideo: builder.mutation<
      ApiResponse<{ videoUrl: string; thumbnailUrl?: string }>,
      FormData
    >({
      query: (formData) => ({
        url: '/featured-videos/upload',
        method: 'POST',
        body: formData,
        formData: true,
      }),
    }),
  }),
});

// Export actions and hooks
export const {
  setLoading,
  setVideos,
  addVideo,
  updateVideo,
  removeVideo,
  setCurrentVideo,
  incrementViewCount,
  reorderVideos,
  setError,
  clearError,
  resetVideos,
} = videosSlice.actions;

export const {
  useGetVideosQuery,
  useGetVideoQuery,
  useCreateVideoMutation,
  useUpdateVideoMutation,
  useDeleteVideoMutation,
  useReorderVideosMutation,
  useIncrementVideoViewsMutation,
  useUploadVideoMutation,
} = videosApi;

// Selectors
export const selectVideos = (state: { videos: VideosState }) => state.videos.videos;
export const selectCurrentVideo = (state: { videos: VideosState }) => state.videos.currentVideo;
export const selectVideosLoading = (state: { videos: VideosState }) => state.videos.isLoading;
export const selectVideosError = (state: { videos: VideosState }) => state.videos.error;

// Filtered selectors
export const selectVideosByCategory = (state: { videos: VideosState }, category: string) =>
  state.videos.videos.filter(video => video.category === category);

export const selectPublicVideos = (state: { videos: VideosState }) =>
  state.videos.videos.filter(video => video.visibility === 'public');

export default videosSlice.reducer;




