'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Heart, MessageCircle, Calendar, MapPin } from 'lucide-react';
import BottomHalf from "./components/BottomHalf";
import {  CreditCard, Monitor, UserCheck, Grid3X3, Target, Clipboard } from 'lucide-react';
import Logo from '@/components/Logo';
import { useAuth, useAppDispatch } from '@/store/hooks';
import { useGetCurrentUserQuery } from '@/store/slices/authSlice';
import { useGetFeedPostsQuery, useToggleFeedPostLikeMutation, useTestConnectionQuery, useTestDatabaseQuery, useDebugPostsQuery, useTestUserLikesQuery, useAddCommentMutation, feedApi } from '@/store/slices/feedSlice';
import { IoIosArrowDown } from 'react-icons/io';
import ImageCarousel from './components/ImageCarousel';
import CustomVerticalScrollbarV2 from '@/components/CustomVerticalScrollbarV2';


export default function EventManagementPage() {
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [speakerScrollPosition, setSpeakerScrollPosition] = useState(0);
  const [adScrollPosition, setAdScrollPosition] = useState(0);
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [viewingAllComments, setViewingAllComments] = useState<Set<string>>(new Set());
  
  // Router hook for navigation
  const router = useRouter();
  
  // Authentication hooks
  const { user, isAuthenticated } = useAuth();
  const { data: currentUserData } = useGetCurrentUserQuery();
  const dispatch = useAppDispatch();
  
  // Feed data hooks - fetch all posts at once
  const { 
    data: feedData, 
    isLoading: feedLoading, 
    error: feedError,
    refetch: refetchFeed
  } = useGetFeedPostsQuery({ 
    page: 1, 
    limit: 100 // Fetch up to 100 posts at once
  });

  // Get feed posts from API
  const feedPosts = feedData?.data?.posts || [];
  const pagination = feedData?.data?.pagination;

  // Test endpoints
  const { data: testData, error: testError } = useTestConnectionQuery();
  const { data: dbTestData, error: dbTestError } = useTestDatabaseQuery();
  const { data: debugData, error: debugError } = useDebugPostsQuery();
  const { data: userLikesData, error: userLikesError } = useTestUserLikesQuery();

  // Comprehensive debug logging
  useEffect(() => {
    console.log('=== FRONTEND FEED DEBUG ===');
    console.log('Feed Data (raw):', feedData);
    console.log('Feed Posts (extracted):', feedPosts);
    console.log('Feed Posts Length:', feedPosts.length);
    console.log('Feed Pagination:', pagination);
    console.log('Feed Loading:', feedLoading);
    console.log('Feed Error:', feedError);
    if (feedError) {
      console.error('Detailed Feed Error:', feedError);
    }
    console.log('--- POSTS DEBUG ---');
    console.log('Total Posts Loaded:', feedPosts.length);
    
    // Debug like status for each post
    if (feedPosts.length > 0) {
      console.log('--- LIKE STATUS DEBUG ---');
      feedPosts.forEach((post, index) => {
        console.log(`Post ${index + 1}:`, {
          id: post._id,
          caption: post.caption?.substring(0, 30) + '...',
          isLiked: post.isLiked,
          likesCount: post.likesCount,
          user: post.user?.firstName + ' ' + post.user?.lastName
        });
      });
    }
    
    console.log('--- AUTH DEBUG ---');
    console.log('Current User:', user);
    console.log('Current User Data:', currentUserData);
    console.log('Is Authenticated:', isAuthenticated);
    
    console.log('--- DATABASE DEBUG ---');
    console.log('Debug Posts Data:', debugData);
    console.log('Debug Posts Error:', debugError);
    if (debugData?.data) {
      console.log('Total Posts in DB:', debugData.data.totalPosts);
      console.log('Active Public Posts:', debugData.data.activePublicPosts);
      console.log('User Excluded Posts:', debugData.data.userExcludedPosts);
      console.log('Current User ID:', debugData.data.currentUserId);
      console.log('Sample Posts:', debugData.data.samplePosts);
    }
    
    console.log('--- USER LIKES DEBUG ---');
    console.log('User Likes Data:', userLikesData);
    console.log('User Likes Error:', userLikesError);
    if (userLikesData?.data) {
      console.log('User ID:', userLikesData.data.userId);
      console.log('Liked Posts:', userLikesData.data.likedPosts);
      console.log('Is Authenticated:', userLikesData.data.isAuthenticated);
    }
    
    console.log('===========================');
  }, [feedData, feedLoading, feedError, feedPosts, pagination, testData, testError, dbTestData, dbTestError, debugData, debugError, userLikesData, userLikesError, user, currentUserData, isAuthenticated]);

  // Listen for new post creation events
  useEffect(() => {
    const handleNewPost = (event: CustomEvent) => {
      console.log('🎉 Received newPostCreated event:', event.detail);
      // Refetch the feed when a new post is created
      refetchFeed();
    };

    window.addEventListener('newPostCreated', handleNewPost as EventListener);
    
    return () => {
      window.removeEventListener('newPostCreated', handleNewPost as EventListener);
    };
  }, [refetchFeed]);

  
  const [toggleLike] = useToggleFeedPostLikeMutation();
  const [addComment, { isLoading: isCommenting }] = useAddCommentMutation();

  // Helper function to handle like toggle with optimistic updates
  const handleLikeToggle = useCallback(async (postId: string) => {
    try {
      console.log('🚀 Toggling like for post:', postId);
      
      // Find the current post to get its current like state
      const currentPost = feedPosts.find(post => post._id === postId);
      if (!currentPost) {
        console.error('❌ Post not found for like toggle');
        return;
      }
      
      // Optimistic update - immediately update the UI
      const optimisticLikeCount = currentPost.isLiked 
        ? currentPost.likesCount - 1 
        : currentPost.likesCount + 1;
      const optimisticIsLiked = !currentPost.isLiked;
      
      console.log('🔄 Applying optimistic like update:', {
        postId,
        currentLikes: currentPost.likesCount,
        optimisticLikes: optimisticLikeCount,
        currentIsLiked: currentPost.isLiked,
        optimisticIsLiked
      });
      
      // Update the cache optimistically
      dispatch(
        feedApi.util.updateQueryData('getFeedPosts', { page: 1, limit: 100 }, (draft) => {
          if (draft.data) {
            const postIndex = draft.data.posts.findIndex(post => post._id === postId);
            if (postIndex !== -1) {
              draft.data.posts[postIndex].isLiked = optimisticIsLiked;
              draft.data.posts[postIndex].likesCount = optimisticLikeCount;
              console.log('✅ Optimistic like update applied to cache');
            }
          }
        })
      );
      
      // Make the API call
      const result = await toggleLike(postId).unwrap();
      console.log('✅ Like toggled successfully:', result);
      
    } catch (error) {
      console.error('❌ Failed to toggle like:', error);
      
      // Revert optimistic update on error
      const currentPost = feedPosts.find(post => post._id === postId);
      if (currentPost) {
        dispatch(
          feedApi.util.updateQueryData('getFeedPosts', { page: 1, limit: 100 }, (draft) => {
            if (draft.data) {
              const postIndex = draft.data.posts.findIndex(post => post._id === postId);
              if (postIndex !== -1) {
                // Revert to original state
                draft.data.posts[postIndex].isLiked = currentPost.isLiked;
                draft.data.posts[postIndex].likesCount = currentPost.likesCount;
                console.log('🔄 Reverted optimistic like update due to error');
              }
            }
          })
        );
      }
    }
  }, [toggleLike, feedPosts, dispatch]);


  // Helper function to handle comment icon click
  const handleCommentClick = useCallback((postId: string) => {
    if (commentingPostId === postId) {
      // If already commenting on this post, close the comment section
      setCommentingPostId(null);
      setCommentText('');
    } else {
      // Open comment section for this post
      setCommentingPostId(postId);
      setCommentText('');
    }
  }, [commentingPostId]);

  // Helper function to handle comment submission with optimistic updates
  const handleCommentSubmit = useCallback(async (postId: string) => {
    if (!isAuthenticated || !commentText.trim()) {
      return;
    }

    try {
      console.log('🚀 Submitting comment:', { postId, comment: commentText.trim() });
      
      // Find the current post to get its current comment count
      const currentPost = feedPosts.find(post => post._id === postId);
      if (!currentPost) {
        console.error('❌ Post not found for comment submission');
        return;
      }
      
      // Create optimistic comment
      const optimisticComment = {
        _id: `temp_${Date.now()}`, // Temporary ID
        content: commentText.trim(),
        createdAt: new Date().toISOString(),
        userName: user?.firstName && user?.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : currentUserData?.user?.firstName && currentUserData?.user?.lastName
          ? `${currentUserData.user.firstName} ${currentUserData.user.lastName}`
          : "You",
        userProfileImage: user?.profileImageUrl || currentUserData?.user?.profileImageUrl,
        user: user || currentUserData?.user,
      };
      
      // Optimistic update - immediately update the UI
      const optimisticCommentCount = currentPost.commentsCount + 1;
      
      console.log('🔄 Applying optimistic comment update:', {
        postId,
        currentComments: currentPost.commentsCount,
        optimisticComments: optimisticCommentCount,
        newComment: optimisticComment
      });
      
      // Update the cache optimistically
      dispatch(
        feedApi.util.updateQueryData('getFeedPosts', { page: 1, limit: 100 }, (draft) => {
          if (draft.data) {
            const postIndex = draft.data.posts.findIndex(post => post._id === postId);
            if (postIndex !== -1) {
              // Add the optimistic comment to the beginning of comments array
              if (!draft.data.posts[postIndex].comments) {
                draft.data.posts[postIndex].comments = [];
              }
              draft.data.posts[postIndex].comments.unshift(optimisticComment);
              draft.data.posts[postIndex].commentsCount = optimisticCommentCount;
              console.log('✅ Optimistic comment update applied to cache');
            }
          }
        })
      );
      
      // Clear the comment text and close comment section immediately for better UX
      setCommentText('');
      setCommentingPostId(null);
      
      // Submit comment to API
      await addComment({
        postId,
        content: commentText.trim()
      }).unwrap();
      
      console.log('✅ Comment submitted successfully!');
      
    } catch (error) {
      console.error('❌ Failed to submit comment:', error);
      
      // Revert optimistic update on error
      const currentPost = feedPosts.find(post => post._id === postId);
      if (currentPost) {
        dispatch(
          feedApi.util.updateQueryData('getFeedPosts', { page: 1, limit: 100 }, (draft) => {
            if (draft.data) {
              const postIndex = draft.data.posts.findIndex(post => post._id === postId);
              if (postIndex !== -1) {
                // Remove the optimistic comment and revert count
                if (draft.data.posts[postIndex].comments) {
                  draft.data.posts[postIndex].comments = draft.data.posts[postIndex].comments.filter(
                    comment => !comment._id.startsWith('temp_')
                  );
                }
                draft.data.posts[postIndex].commentsCount = currentPost.commentsCount;
                console.log('🔄 Reverted optimistic comment update due to error');
              }
            }
          })
        );
      }
      
      // Restore comment text and reopen comment section on error
      setCommentText(commentText);
      setCommentingPostId(postId);
    }
  }, [isAuthenticated, commentText, addComment, feedPosts, dispatch, user, currentUserData]);

  // Helper function to handle comment input key press
  const handleCommentKeyPress = useCallback((e: React.KeyboardEvent, postId: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCommentSubmit(postId);
    }
  }, [handleCommentSubmit]);

  // Helper function to handle viewing all comments
  const handleViewAllComments = useCallback((postId: string) => {
    setViewingAllComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  }, []);

  // Helper function to format time ago
  const formatTimeAgo = useCallback((dateString: string) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return postDate.toLocaleDateString();
  }, []);

  // Helper function to get profile image URL
  const getProfileImageUrl = useCallback((profileImage: { data?: Buffer | string; contentType?: string; url?: string } | string | null) => {
    console.log('🔍 Profile Image Debug:', profileImage);
    
    if (!profileImage) {
      console.log('❌ No profile image provided');
      return null;
    }
    
    // Check if it's already a URL string
    if (typeof profileImage === 'string') {
      console.log('✅ Profile image is already a URL:', profileImage);
      return profileImage;
    }
    
    // Check if it has data and contentType (binary data)
    if (profileImage.data && profileImage.contentType) {
      const dataUrl = `data:${profileImage.contentType};base64,${profileImage.data.toString('base64')}`;
      console.log('✅ Created data URL from binary data');
      return dataUrl;
    }
    
    // Check if it has a url property
    if (profileImage.url) {
      console.log('✅ Profile image has URL property:', profileImage.url);
      return profileImage.url;
    }
    
    console.log('❌ Profile image format not recognized:', profileImage);
    return null;
  }, []);


  const promotedEvents = [
    {
      title: "Global Leadership Summit 2025",
      description: "Join industry leaders for three days of inspiring talks and networking opportunities.",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=200&fit=crop"
    },
    {
      title: "AI & Future of Work Summit 2025",
      description: "Explore how artificial intelligence is reshaping the workplace and creating new opportunities.",
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=200&fit=crop"
    },
    {
      title: "Digital Innovation Conference",
      description: "Discover the latest trends in digital transformation and technology innovation.",
      image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&h=200&fit=crop"
    }
  ];

  const extendedEvents = [...promotedEvents, promotedEvents[0]];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEventIndex((prevIndex) => {
        if (prevIndex === promotedEvents.length - 1) {
         
          setTimeout(() => {
            setCurrentEventIndex(0);
          }, 2000); 
          return promotedEvents.length; 
        }
        return prevIndex + 1;
      });
    }, 6000); 

    return () => clearInterval(interval);
  }, [promotedEvents.length]);

 
  useEffect(() => {
    const speakerInterval = setInterval(() => {
      setSpeakerScrollPosition(prev => prev + 1);
    }, 50); 

    return () => clearInterval(speakerInterval);
  }, []);

  useEffect(() => {
    const adInterval = setInterval(() => {
      setAdScrollPosition(prev => prev + 0.5);
    }, 50);

    return () => clearInterval(adInterval);
  }, []);

  const featuredSpeakers = [
    {
      name: "Dr. Anya Sharma",
      title: "AI Ethicist",
      description: "A leading voice in ethical AI development.",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face"
    }
  ];

  const topSpeakers = [
    {
      name: "Dr. Anya Sharma",
      title: "AI Ethicist",
      bio: "Leading ethical AI development",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face"
    },
    {
      name: "Marcus Johnson",
      title: "Tech CEO",
      bio: "Transforming digital landscapes",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face"
    },
    {
      name: "Sarah Chen",
      title: "Data Scientist",
      bio: "Turning data into insights",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face"
    },
    {
      name: "David Rodriguez",
      title: "Design Director",
      bio: "Creating meaningful experiences",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face"
    },
    {
      name: "Lisa Thompson",
      title: "Marketing Expert",
      bio: "Building powerful brand stories",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=face"
    },
    {
      name: "Alex Kim",
      title: "Startup Founder",
      bio: "Building powerful brand stories",
      image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=80&h=80&fit=crop&crop=face"
    }
  ];

  const recentBlogs = [
    {
      title: "5 Essential Public Speaking Tips",
      description: "Master the art of confident presentation",
      image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=60&h=60&fit=crop"
    }
  ];

  const upcomingEvents = [
    { name: "Tech Innovation Conference", date: "March 15, 2025", location: "Virtual" },
    { name: "Women in Leadership Forum", date: "March 22, 2025", location: "New York" },
    { name: "Digital Marketing Masterclass", date: "March 28, 2025", location: "Online" },
    { name: "Startup Pitch Competition", date: "April 5, 2025", location: "San Francisco" },
    { name: "AI & Future of Work Summit", date: "April 12, 2025", location: "London" }
  ];

  // Create 5 identical Dr. Anya Sharma entries with similar images to reference
  const repeatedSpeakers = [
    {
      name: "Dr. Anya Sharma",
      title: "AI Ethicist",
      description: "A leading voice in ethical AI development and its societal impact.",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face"
    },
    {
      name: "Dr. Anya Sharma",
      title: "AI Ethicist",
      description: "A leading voice in ethical AI development and its societal impact.",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face"
    },
    {
      name: "Dr. Anya Sharma",
      title: "AI Ethicist",
      description: "A leading voice in ethical AI development and its societal impact.",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face"
    },
    {
      name: "Dr. Anya Sharma",
      title: "AI Ethicist",
      description: "A leading voice in ethical AI development and its societal impact.",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face"
    },
    {
      name: "Dr. Anya Sharma",
      title: "AI Ethicist",
      description: "A leading voice in ethical AI development and its societal impact.",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face"
    }
  ];

  // Advertisement images
  const adImages = [
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop&q=80",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop&q=80",
  "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop&q=80",
  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&h=400&fit=crop&q=80",
  "https://images.unsplash.com/photo-1553484771-371a605b060b?w=600&h=400&fit=crop&q=80",
  "https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?w=600&h=400&fit=crop&q=80"
];

  return (
    <div className="min-h-screen bg-white">
      {/* Speaker Community Section */}
      <div className="min-h-screen bg-gray-50">
        
        {/* Header */}
<header className="bg-white shadow-md border-b">
  <div className="max-w-7xl mx-auto px-6">
    <div className="flex items-center h-16">
      {/* Logo */}
      <div className="flex-shrink-0">
        <Logo absolute={true} />
      </div>

      {/* Search Bar - Right after logo */}
      <div className="flex-1 max-w-xl ml-24">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search Speaker"
            className="w-full pl-10 pr-10 py-2.5 border border-blue-400 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-600 text-sm bg-white"
          />
          <button className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:opacity-70 transition-opacity">
            <img 
              src="/vector1.png" 
              alt="Filter" 
              className="w-4 h-4"
            />
          </button>
        </div>
      </div>

      {/* Navigation - Right aligned */}
      <nav className="flex items-center space-x-8 ml-auto">
        <button 
          onClick={() => router.push('/profile')}
          className="text-gray-900 hover:text-[#FF6B35] font-medium text-sm transition-colors duration-200 hover:scale-105"
        >
          About
        </button>
        <button 
          onClick={() => router.push('/newuser')}
          className="text-gray-900 hover:text-[#FF6B35] font-medium text-sm transition-colors duration-200 hover:scale-105"
        >
          Speaker
        </button>
        <button 
          onClick={() => router.push('/events_page')}
          className="text-gray-900 hover:text-[#FF6B35] font-medium text-sm transition-colors duration-200 hover:scale-105"
        >
          Events
        </button>
        
        {/* Conditional rendering based on authentication */}
        {isAuthenticated && (user || currentUserData?.user) ? (
          <button className="w-40 h-10 cursor-pointer flex items-center justify-between">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
              {getProfileImageUrl(user?.profileImageUrl || currentUserData?.user?.profileImageUrl) ? (
                <img
                  src={getProfileImageUrl(user?.profileImageUrl || currentUserData?.user?.profileImageUrl) || ''}
                  alt="profile"
                  className="w-full h-full object-cover object-center"
                  onError={(e) => {
                    // Fallback to initials if image fails to load
                    e.currentTarget.style.display = "none";
                    const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                    if (nextElement) {
                      nextElement.style.display = "flex";
                    }
                  }}
                />
              ) : null}
              <div
                className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-sm"
                style={{
                  display: getProfileImageUrl(user?.profileImageUrl || currentUserData?.user?.profileImageUrl) ? "none" : "flex",
                }}
              >
                {(user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : currentUserData?.user?.firstName && currentUserData?.user?.lastName
                  ? `${currentUserData.user.firstName} ${currentUserData.user.lastName}`
                  : "User")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
            </div>
            <h2 className="text-sm font-medium">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : currentUserData?.user?.firstName && currentUserData?.user?.lastName
                ? `${currentUserData.user.firstName} ${currentUserData.user.lastName}`
                : "User"}
            </h2>
            <IoIosArrowDown className="cursor-pointer w-4 h-4" />
          </button>
        ) : (
          <button 
            onClick={() => window.location.href = '/signup/login'}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-full font-medium text-sm transition-colors"
          >
            Login
          </button>
        )}
      </nav>
    </div>
  </div>
</header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-12 gap-4">
            {/* Left Sidebar - Featured Speakers */}
            <div className="col-span-3">
              <div className="bg-white rounded-lg p-3 mb-4">
                <h2 className="text-base font-semibold mb-3 text-[#00425D]">Featured Speakers</h2>
                <div className="space-y-10">
                  {repeatedSpeakers.map((speaker, index) => (
                    <div key={index} className={`flex items-start gap-2 ${index % 2 === 1 ? 'flex-row-reverse' : ''}`}>
                      <img
                        src={speaker.image}
                        alt={speaker.name}
                        className="w-12 h-17 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className={`flex-1 min-w-0 ${index % 2 === 1 ? 'text-right' : ''}`}>
                        <h3 className="font-semibold text-xs text-gray-900 mb-0.5">{speaker.name}</h3>
                        <p className="text-xs text-gray-600 font-medium mb-0.5">{speaker.title}</p>
                        <p className="text-xs text-gray-500 leading-tight">{speaker.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top 5 Speakers */}
              <div className="bg-white rounded-lg p-3 mb-4">
                <h2 className="text-base font-semibold mb-3 text-[#00425D]">Top 5 Speakers</h2>
                <div className="relative overflow-hidden">
                  <div 
                    className="flex transition-transform ease-linear"
                    style={{
                      transform: `translateX(-${(speakerScrollPosition % (topSpeakers.length * 120))}px)`,
                      width: `${topSpeakers.length * 2 * 120}px`
                    }}
                  >
                    {/* Duplicate speakers array for seamless loop */}
                    {[...topSpeakers, ...topSpeakers].map((speaker, index) => (
                      <div key={index} className="flex-shrink-0 w-28 mx-1">
                        <div className="bg-gray-100 rounded-lg p-2 text-center">
                          <img
                            src={speaker.image}
                            alt={speaker.name}
                            className="w-12 h-12 rounded-full mx-auto mb-2 object-cover"
                          />
                          <p className="text-xs font-medium text-gray-900 mb-1 truncate">{speaker.name}</p>
                          <p className="text-xs text-gray-600 mb-1 truncate">{speaker.title}</p>
                          <p className="text-xs text-gray-500 leading-tight text-center px-1">{speaker.bio}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Blogs */}
              <div className="bg-white rounded-lg p-3">
                <h2 className="text-base font-semibold mb-3 text-[#00425D]">Recent Blogs</h2>
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-6 last:mb-0">
                    <img
                      src={[
                        "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=40&h=40&fit=crop",
                        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=40&h=40&fit=crop",
                        "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=40&h=40&fit=crop",
                        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=40&h=40&fit=crop",
                        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop"
                      ][index]}
                      alt="Blog"
                      className="w-14 h-14 rounded object-cover"
                    />
                    <div>
                      <h3 className="text-xs font-medium">5 Essential Public Speaking Tips</h3>
                      <p className="text-xs text-gray-500">Master the art of confident presentation</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Content */}
            <div className="col-span-9">
              {/* Hero Section - Full Width */}
              <div className="relative rounded-2xl overflow-hidden mb-4 h-70">
                <img
                  src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1400&h=320&fit=crop"
                  alt="Conference speaker"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center px-12">
                  <div className="bg-white/85 rounded-2xl p-7 max-w-xl text-center">
                    <h1 className="text-3xl font-extrabold text-gray-800 mb-1">
                      Build Better Events,
                    </h1>
                    <h2 className="text-3xl font-extrabold text-gray-800 mb-2">
                      Book Brighter Speakers.
                    </h2>
                    <p className="text-gray-700 mb-3 text-sm leading-tight">
                      Discover inspiring voices, share knowledge, and build meaningful connections in our vibrant speaker community
                    </p>
                    <button className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg font-medium text-sm">
                      Join the Community
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4">
                {/* Posts Column with Scroll and Orange Sidebar */}
                <div className="col-span-8">
                  <div className="relative">
                   
                    
                    {/* Scrollable Posts Container */}
                    <div 
                      className="h-[945px] overflow-y-auto scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-gray-100 pl-4"
                    >
                      <div className="space-y-4 pr-2">
                        {feedLoading && feedPosts.length === 0 ? (
                          <div className="flex items-center justify-center h-32">
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
                              <div className="text-gray-500 text-sm">Loading posts...</div>
                            </div>
                          </div>
                        ) : feedError ? (
                          <div className="flex items-center justify-center h-32">
                            <div className="text-red-500 text-sm">Failed to load posts</div>
                          </div>
                        ) : feedPosts.length === 0 ? (
                          <div className="flex items-center justify-center h-32">
                            <div className="text-gray-500 text-sm">No posts available</div>
                          </div>
                        ) : (
                          feedPosts.map((post) => {
                            console.log('🔍 Post Debug:', {
                              postId: post._id,
                              user: post.user,
                              userProfileImage: post.userProfileImage,
                              userProfileImageUrl: post.user?.profileImageUrl,
                              userName: post.userName,
                              media: post.media,
                              mediaCount: post.media?.length || 0,
                              mediaTypes: post.media?.map(m => m.type) || []
                            });
                            
                            // Get real comments from the post data
                            const postComments = post.comments || [];
                            
                            const profileImageUrl = getProfileImageUrl(post.userProfileImage || post.user?.profileImageUrl);
                            const authorName = post.userName || `${post.user?.firstName} ${post.user?.lastName}`;
                            
                            return (
                              <div key={post._id} className="bg-white rounded-lg p-3">
                                <div className="flex items-center space-x-2 mb-2">
                                  {profileImageUrl ? (
                                    <img
                                      src={profileImageUrl}
                                      alt={authorName}
                                      className="w-8 h-8 rounded-full object-cover"
                                      onError={(e) => {
                                        console.error('Profile image failed to load:', profileImageUrl);
                                        e.currentTarget.style.display = 'none';
                                        const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                                        if (nextElement) {
                                          nextElement.style.display = 'flex';
                                        }
                                      }}
                                    />
                                  ) : null}
                                  <div 
                                    className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs"
                                    style={{
                                      display: profileImageUrl ? 'none' : 'flex',
                                    }}
                                  >
                                    {authorName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-xs">{authorName}</h3>
                                    <span className="text-xs text-gray-400">{formatTimeAgo(post.createdAt)}</span>
                                  </div>
                                </div>

                                {post.title && (
                                  <h2 className="text-sm font-semibold mb-2 text-[#00425D]">{post.title}</h2>
                                )}
                                <p className="text-gray-500 text-xs mb-3 leading-tight">
                                  {post.caption}
                                </p>
                                
                                {post.media && post.media.length > 0 && (
                                  <ImageCarousel 
                                    media={post.media} 
                                    alt={`${authorName}'s post`}
                                  />
                                )}
                                
                                <div className="flex items-center space-x-4 text-xs text-gray-400">
                                  <button 
                                    className={`flex items-center space-x-1 transition-colors duration-200 ${post.isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
                                    onClick={() => handleLikeToggle(post._id)}
                                  >
                                    <Heart 
                                      className={`w-3 h-3 transition-all duration-200 ${
                                        post.isLiked 
                                          ? 'fill-red-500 text-red-500' 
                                          : 'fill-none text-gray-400 hover:text-red-500'
                                      }`} 
                                    />
                                    <span className={post.isLiked ? 'text-red-500' : ''}>{post.likesCount}</span>
                                  </button>
                                  <button 
                                    className={`flex items-center space-x-1 hover:text-blue-500 ${commentingPostId === post._id ? 'text-blue-500' : ''}`}
                                    onClick={() => handleCommentClick(post._id)}
                                  >
                                    <MessageCircle className="w-3 h-3" />
                                    <span>{post.commentsCount}</span>
                                  </button>
                                </div>

                                {/* Comment Section */}
                                {commentingPostId === post._id && (
                                  <div className="mt-3 pt-3 border-t border-gray-100">
                                    {/* Existing Comments Display */}
                                    {postComments && postComments.length > 0 ? (
                                      <div className="mb-3">
                                        <CustomVerticalScrollbarV2 
                                          maxHeight="200px"
                                          scrollbarColor="#FF6B35"
                                          trackColor="rgba(255,107,53,0.06)"
                                          showArrows={true}
                                        >
                                          <div className="space-y-2 pr-8">
                                            {(viewingAllComments.has(post._id) ? postComments : postComments.slice(0, 3)).map((comment: { userName?: string; content: string; createdAt: string; userProfileImage?: any; userProfileImageUrl?: string; user?: any }, index: number) => {
                                              // Debug comment data
                                              console.log('🔍 Comment Debug:', {
                                                commentId: comment._id || index,
                                                userName: comment.userName,
                                                userProfileImage: comment.userProfileImage,
                                                userProfileImageUrl: comment.userProfileImageUrl,
                                                user: comment.user,
                                                userProfileImageFromUser: comment.user?.profileImageUrl
                                              });
                                              
                                              // Get profile image from multiple sources: userProfileImageUrl (new), userProfileImage (old), or user.profileImageUrl (populated)
                                              const profileImageUrl = getProfileImageUrl(comment.userProfileImageUrl || comment.userProfileImage || comment.user?.profileImageUrl);
                                              const displayName = comment.userName || `${comment.user?.firstName} ${comment.user?.lastName}`;
                                              
                                              return (
                                              <div key={index} className="flex items-start space-x-2">
                                                <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0">
                                                  {profileImageUrl ? (
                                                    <img
                                                      src={profileImageUrl}
                                                      alt={displayName || 'User'}
                                                      className="w-full h-full object-cover object-center"
                                                      onError={(e) => {
                                                        // Fallback to initials if image fails to load
                                                        e.currentTarget.style.display = "none";
                                                        const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                                                        if (nextElement) {
                                                          nextElement.style.display = "flex";
                                                        }
                                                      }}
                                                    />
                                                  ) : null}
                                                  <div
                                                    className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-xs"
                                                    style={{
                                                      display: profileImageUrl ? "none" : "flex",
                                                    }}
                                                  >
                                                    {displayName ? displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                                                  </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                  <div className="bg-gray-50 rounded-lg px-3 py-2">
                                                    <p className="text-xs font-medium text-gray-900 mb-1">
                                                      {displayName || 'Anonymous'}
                                                    </p>
                                                    <p className="text-xs text-gray-700 leading-relaxed">
                                                      {comment.content}
                                                    </p>
                                                  </div>
                                                  <span className="text-xs text-gray-400 mt-1 block">
                                                    {formatTimeAgo(comment.createdAt)}
                                                  </span>
                                </div>
                              </div>
                            );
                                            })}
                                          </div>
                                        </CustomVerticalScrollbarV2>
                                        
                                        {/* View all comments button */}
                                        {postComments.length > 3 && (
                                          <div className="text-center mt-2">
                                            <button
                                              onClick={() => handleViewAllComments(post._id)}
                                              className="text-xs text-blue-500 hover:text-blue-600 font-medium cursor-pointer transition-colors duration-200"
                                            >
                                              {viewingAllComments.has(post._id) 
                                                ? 'Show less' 
                                                : `View all ${postComments.length} comments`
                                              }
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="mb-3">
                                        <p className="text-xs text-gray-500 text-center py-2">
                                          No comments yet. Be the first to comment!
                                        </p>
                                      </div>
                                    )}

                                    {/* Comment Input */}
                                    {isAuthenticated ? (
                            <div className="flex items-center space-x-2">
                                        <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0">
                                          {getProfileImageUrl(user?.profileImageUrl || currentUserData?.user?.profileImageUrl) ? (
                                            <img
                                              src={getProfileImageUrl(user?.profileImageUrl || currentUserData?.user?.profileImageUrl) || ''}
                                              alt="profile"
                                              className="w-full h-full object-cover object-center"
                                              onError={(e) => {
                                                // Fallback to initials if image fails to load
                                                e.currentTarget.style.display = "none";
                                                const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                                                if (nextElement) {
                                                  nextElement.style.display = "flex";
                                                }
                                              }}
                                            />
                                          ) : null}
                                          <div
                                            className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-xs"
                                            style={{
                                              display: getProfileImageUrl(user?.profileImageUrl || currentUserData?.user?.profileImageUrl) ? "none" : "flex",
                                            }}
                                          >
                                            {(user?.firstName && user?.lastName 
                                              ? `${user.firstName} ${user.lastName}` 
                                              : currentUserData?.user?.firstName && currentUserData?.user?.lastName
                                              ? `${currentUserData.user.firstName} ${currentUserData.user.lastName}`
                                              : "User")
                                              .split(" ")
                                              .map((n) => n[0])
                                              .join("")
                                              .toUpperCase()
                                              .slice(0, 2)}
                            </div>
                                        </div>
                                        <div className="flex-1 relative">
                                          <input
                                            type="text"
                                            placeholder="Add a comment..."
                                            value={commentText}
                                            onChange={(e) => setCommentText(e.target.value)}
                                            onKeyPress={(e) => handleCommentKeyPress(e, post._id)}
                                            className="w-full px-3 py-2 text-xs border border-gray-200 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            autoFocus
                                          />
                                        </div>
                                        <button
                                          onClick={() => handleCommentSubmit(post._id)}
                                          disabled={!commentText.trim() || isCommenting}
                                          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                                            commentText.trim() && !isCommenting
                                              ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                          }`}
                                        >
                                          {isCommenting ? 'Posting...' : 'Post'}
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="text-center py-2">
                                        <p className="text-xs text-gray-500 mb-2">
                                          Please log in to comment
                                        </p>
                                        <button 
                                          onClick={() => window.location.href = '/signup/login'}
                                          className="text-xs text-blue-500 hover:text-blue-600 font-medium"
                                        >
                                          Login
                                        </button>
                          </div>
                        )}
                          </div>
                        )}
                              </div>
                            );
                          })
                        )}
                        
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Sidebar */}
                <div className="col-span-4">
                  {/* Promoted Events */}
                  <div className="bg-white rounded-lg overflow-hidden mb-4 relative">
                    <div className="absolute left-0 top-0 w-1 h-full bg-orange-500 z-10"></div>

                    <div className="p-3 pb-1">
                      <h2 className="text-base font-bold text-[#00425D] mb-3">Promoted Events</h2>
                    </div>

                   
                    <div className="relative h-[280px] overflow-hidden">
                      <div
                        className={`flex flex-col transition-transform ease-in-out duration-[2000ms] space-y-3`}
                        style={{
                          transform: `translateY(-${currentEventIndex * 280}px)`,
                        }}
                      >
                        {extendedEvents.map((event, index) => (
                          <div
                            key={index}
                            className="h-[280px] flex-shrink-0 px-3"
                          >
                            <img
                              src={event.image}
                              alt={event.title}
                              className="w-full h-24 object-cover rounded-lg mb-2"
                            />
                            <div className="px-0">
                              <h3 className="font-bold text-sm mb-1 text-gray-900">{event.title}</h3>
                              <p className="text-xs text-gray-600 mb-2 leading-tight line-clamp-3">
                                {event.description}
                              </p>
                              <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg text-xs font-semibold transition-colors">
                                Ticket & Info
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Upcoming Events */}
                  <div className="bg-white rounded-lg p-3 mb-4">
                    <h2 className="text-base font-semibold mb-3 text-[#00425D]">Upcoming Events</h2>
                    <div className="space-y-6">
                      {upcomingEvents.map((event, index) => (
                        <div key={index} className="border-l-4 border-orange-500 pl-2">
                          <h3 className="font-medium text-xs">{event.name}</h3>
                          <div className="flex items-center text-xs text-gray-500 mt-0.5">
                            <Calendar className="w-3 h-3 mr-1" />
                            <span className="mr-2">{event.date}</span>
                            <MapPin className="w-3 h-3 mr-1" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Advertisements with Auto-scrolling Images */}
<div className="bg-white rounded-lg p-3">
  <h2 className="text-base font-semibold mb-3">Advertisements</h2>
  <div className="h-50 overflow-hidden relative rounded-lg">
    <div 
      className="flex flex-col transition-transform ease-linear"
      style={{
        transform: `translateY(-${(adScrollPosition % (adImages.length * 160))}px)`,
        height: `${adImages.length * 2 * 160}px`
      }}
    >
                       {[...adImages, ...adImages].map((image, index) => (
        <div key={index} className="flex-shrink-0 w-full h-120 mb-2">
          <img
            src={image}
            alt={`Advertisement ${index + 1}`}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      ))}
    </div>
  </div>
</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Management Features Section */}
      <div className="bg-white">
        {/* Header section with white background */}
        <div className="container mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-[#00425D] mb-4 leading-tight max-w-4xl mx-auto">
              Everything You Need for a Successful Event, All in One Place
            </h1>
            <p className="text-gray-600 text-base max-w-2xl mx-auto leading-relaxed">
              Streamline your event management with our comprehensive platform designed to
              handle every aspect of professional speaking engagements
            </p>
          </div>
        </div>

        {/* Background image section */}
        <div className="bg-gray-50 relative overflow-hidden min-h-[600px]">
          {/* Background image */}
          <div className="absolute inset-0">
            <img 
              src="/orange1000px.png" 
              alt="Background" 
              className="w-full h-full object-fill"
            />
          </div>

          {/* Feature cards content */}
          <div className="relative z-10 container mx-auto px-8 py-50">
           
            {/* Feature cards */}
            <div className="max-w-7xl mx-auto space-y-12 px-4">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Milestone-Based Escrow - Left (higher) */}
                <div className="feature-card bg-white/55 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-white transition-all duration-300 hover:bg-white/90 hover:rotate-1 hover:scale-[1.02] w-full max-w-lg">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                    <CreditCard className="w-4 h-4 text-orange-600" />
                  </div>
                  <h3 className="text-base font-bold mb-2" style={{ color: '#00425D' }}>Milestone-Based Escrow</h3>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    Secure staged payments that protect both organizers and
                    speakers throughout the entire event process, ensuring trust
                    and accountability.
                  </p>
                </div>

                <div className="feature-card bg-white/55 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-white transition-all duration-300 hover:bg-white/90 hover:-rotate-1 hover:scale-[1.02] w-full max-w-lg md:ml-auto md:mt-16">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                    <Monitor className="w-4 h-4 text-orange-600" />
                  </div>
                  <h3 className="text-base font-bold mb-2" style={{ color: '#00425D' }}>The Accountability Engine</h3>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    Double-blind review system that provides unbiased feedback
                    and maintains high standards across the platform.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
                <div className="feature-card bg-white/55 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-white transition-all duration-300 hover:bg-white/90 hover:rotate-1 hover:scale-[1.02] w-full max-w-lg">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                    <UserCheck className="w-4 h-4 text-orange-600" />
                  </div>
                  <h3 className="text-base font-bold mb-2" style={{ color: '#00425D' }}>Source Vetted Professionals</h3>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    Access verified speakers with authenticated credentials and
                    identity badges, ensuring quality and reliability for your
                    events.
                  </p>
                </div>

                <div className="feature-card bg-white/55 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-white transition-all duration-300 hover:bg-white/90 hover:-rotate-1 hover:scale-[1.02] w-full max-w-lg md:ml-auto md:mt-16">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                    <Grid3X3 className="w-4 h-4 text-orange-600" />
                  </div>
                  <h3 className="text-base font-bold mb-2" style={{ color: '#00425D' }}>3-Stage Dispute Resolution</h3>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    Fair, structured process for resolving disagreements with
                    mediation and arbitration options.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Centralized Action Center - Left (higher) */}
                <div className="feature-card bg-white/55 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-white transition-all duration-300 hover:bg-white/90 hover:rotate-1 hover:scale-[1.02] w-full max-w-lg">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                    <Target className="w-4 h-4 text-orange-600" />
                  </div>
                  <h3 className="text-base font-bold mb-2" style={{ color: '#00425D' }}>Centralized Action Center</h3>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    Smart dashboard that consolidates all event tasks,
                    communications, and deadlines in one intuitive
                    interface.
                  </p>
                </div>

                <div className="feature-card bg-white/55 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-white transition-all duration-300 hover:bg-white/90 hover:-rotate-1 hover:scale-[1.02] w-full max-w-lg md:ml-auto md:mt-16">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                    <Clipboard className="w-4 h-4 text-orange-600" />
                  </div>
                  <h3 className="text-base font-bold mb-2" style={{ color: '#00425D' }}>All-in-One Event Publishing</h3>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    Create custom-branded event pages with integrated
                    ticketing, communications, and promotional tools.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomHalf />

      <style jsx>{`
        .feature-card {
          cursor: pointer;
        }
        
        /* Image carousel improvements */
        .image-carousel-container {
          position: relative;
          overflow: hidden;
          border-radius: 10px;
          background: #f9fafb;
          min-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .image-carousel-container img,
        .image-carousel-container video {
          width: 100%;
          max-height: 384px; /* max-h-96 equivalent */
          object-fit: contain;
          transition: all 0.5s ease-in-out;
          border-radius: 8px;
        }
        
        .image-carousel-container:hover img {
          transform: scale(1.01);
        }
        
        /* Loading state for images */
        .image-loading {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }
        
        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
        
        /* PDF Viewer improvements */
        .pdf-viewer-container {
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .pdf-viewer-container .react-pdf__Page {
          border-radius: 8px;
        }
        
        .pdf-viewer-container .react-pdf__Page__canvas {
          border-radius: 8px;
        }
        
        /* Fullscreen PDF styles */
        .pdf-fullscreen {
          z-index: 9999;
        }
        
        .pdf-fullscreen .react-pdf__Page {
          max-width: 90vw;
          max-height: 90vh;
        }
      `}</style>
    </div>
  );
}