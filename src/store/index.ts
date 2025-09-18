// ============================================================================
// REDUX STORE CONFIGURATION - Production Ready Setup
// ============================================================================

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Import API and slices
import { baseApi } from './api/baseApi';
import authReducer from './slices/authSlice';
import profileReducer from './slices/profileSlice';
import postsReducer from './slices/postsSlice';
import feedReducer from './slices/feedSlice';
import workExperienceReducer from './slices/workExperienceSlice';
import educationReducer from './slices/educationSlice';
import awardsReducer from './slices/awardsSlice';
import videosReducer from './slices/videosSlice';
import calendarReducer from './slices/calendarSlice';
import availabilityReducer from './slices/availabilitySlice';

// Persist configuration
const persistConfig = {
  key: 'voxvertex-root',
  version: 1,
  storage,
  // Only persist auth and some user preferences
  whitelist: ['auth'],
  // Blacklist API cache and other slices that should not be persisted
  blacklist: [
    'api', 
    'posts', 
    'feed',
    'workExperience', 
    'education', 
    'awards', 
    'videos', 
    'calendar',
    'availability'
  ],
};

// Auth persist configuration (more specific)
const authPersistConfig = {
  key: 'auth',
  storage,
  // Only persist essential auth data including role
  whitelist: ['user', 'isAuthenticated', 'token', 'role'],
};

// Root reducer
const rootReducer = combineReducers({
  // API reducer
  [baseApi.reducerPath]: baseApi.reducer,
  
  // Feature reducers
  auth: persistReducer(authPersistConfig, authReducer),
  profile: profileReducer,
  posts: postsReducer,
  feed: feedReducer,
  workExperience: workExperienceReducer,
  education: educationReducer,
  awards: awardsReducer,
  videos: videosReducer,
  calendar: calendarReducer,
  availability: availabilityReducer,
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Store configuration
export const store = configureStore({
  reducer: persistedReducer,
  
  // Middleware configuration
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Redux Persist configuration
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
      // Performance optimizations
      immutableCheck: {
        warnAfter: 128,
      },
      serializableStateInvariantCheck: {
        warnAfter: 128,
      },
    })
    // Add RTK Query middleware
    .concat(baseApi.middleware),
    
  // Enable Redux DevTools in development
  devTools: process.env.NODE_ENV !== 'production',
  
  // Preloaded state (can be used for SSR)
  preloadedState: undefined,
});

// Setup RTK Query listeners for automatic refetching
setupListeners(store.dispatch);

// Create persistor
export const persistor = persistStore(store);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export store and persistor as default
export default store;

// ============================================================================
// STORE UTILITIES & HELPERS
// ============================================================================

// Store reset utility (useful for logout)
export const resetStore = () => {
  // Clear all persisted data
  persistor.purge();
  
  // Reset all slices
  store.dispatch({ type: 'auth/resetAuth' });
  store.dispatch({ type: 'profile/resetProfile' });
  store.dispatch({ type: 'posts/resetPosts' });
  store.dispatch({ type: 'feed/resetFeed' });
  store.dispatch({ type: 'workExperience/resetWorkExperience' });
  store.dispatch({ type: 'education/resetEducation' });
  store.dispatch({ type: 'awards/resetAwards' });
  store.dispatch({ type: 'videos/resetVideos' });
  store.dispatch({ type: 'calendar/resetCalendar' });
  store.dispatch({ type: 'availability/resetAvailability' });
  
  // Reset API cache
  store.dispatch(baseApi.util.resetApiState());
};

// Selective cache invalidation
export const invalidateUserData = () => {
  store.dispatch(
    baseApi.util.invalidateTags([
      'User', 
      'Profile', 
      'Post', 
      'WorkExperience', 
      'Education', 
      'Award', 
      'Video', 
      'CalendarEvent'
    ])
  );
};

// Performance monitoring (development only)
if (process.env.NODE_ENV === 'development') {
  // Log store state changes
  store.subscribe(() => {
    const state = store.getState();
    console.log('Store updated:', {
      auth: state.auth.isAuthenticated,
      api: Object.keys(state.api.queries).length,
      timestamp: new Date().toISOString(),
    });
  });
}

// ============================================================================
// EXPORT INDIVIDUAL STORE PARTS FOR TESTING
// ============================================================================

export {
  // Reducers
  authReducer,
  profileReducer,
  postsReducer,
  feedReducer,
  workExperienceReducer,
  educationReducer,
  awardsReducer,
  videosReducer,
  calendarReducer,
  availabilityReducer,
  
  // API
  baseApi,
  
  // Root reducer
  rootReducer,
};



