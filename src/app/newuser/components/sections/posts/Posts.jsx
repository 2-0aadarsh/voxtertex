"use client";
import { useEffect, useState } from "react";
import GeneratePost from "./GeneratePost";
import PostHeader from "./PostHeader";
import RecentPosts from "./RecentPosts";

const Post = () => {
  const [recentPosts, setRecentPosts] = useState([
    // {
    //   content:
    //     "Excited to share that our team successfully launched a new product feature that improves user experience by 40%! The journey involved extensive user research, iterative design, and close collaboration with our engineering team.",
    //   date: "1/15/2024",
    //   likes: 24,
    //   comments: 8,
    // },
    // {
    //   content:
    //     "Just completed an amazing workshop on 'Leading Remote Teams' at Stanford. Key takeaway: Communication clarity and trust-building are the foundations of successful remote leadership.",
    //   date: "1/15/2024",
    //   likes: 24,
    //   comments: 8,
    // },
  ]);

  // fetch posts on load
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const apiUrl = `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
        }/post/my-posts`;
        const res = await fetch(apiUrl, {
          credentials: "include", // important for cookies (auth)
        });

        const data = await res.json();

        console.log("Fetched posts:", data);
        if (res.ok) {
          // Sort posts by creation date (newest first)
          const sortedPosts = Array.isArray(data)
            ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            : [];

          // Format the posts for UI display
          const formattedPosts = sortedPosts.map((post) => {
            // Process media items if they exist
            const processedMedia =
              post.media?.map((item) => {
                let processedUrl = item.url;

                // Handle different URL formats
                if (processedUrl) {
                  // If it's already a full URL (http/https), use as is
                  if (processedUrl.startsWith("http")) {
                    processedUrl = processedUrl;
                  }
                  // If it's a Cloudinary URL, use as is
                  else if (processedUrl.includes("cloudinary.com")) {
                    processedUrl = processedUrl;
                  }
                  // If it's a relative path, make it absolute
                  else if (processedUrl.startsWith("/")) {
                    processedUrl = `${
                      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
                    }${processedUrl}`;
                  }
                  // If it's a data URL (base64), use as is
                  else if (processedUrl.startsWith("data:")) {
                    processedUrl = processedUrl;
                  }
                  // Default case - assume it needs the base URL
                  else {
                    processedUrl = `${
                      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
                    }/${processedUrl}`;
                  }
                }

                return {
                  ...item,
                  url: processedUrl,
                };
              }) || [];

            console.log("📝 Processing post media:", processedMedia);
            console.log("📝 Original post media:", post.media);
            console.log(
              "📝 Processed URLs:",
              processedMedia.map((item) => ({ type: item.type, url: item.url }))
            );

            return {
              ...post,
              date: new Date(post.createdAt).toLocaleString(),
              likes: post.likesCount || 0,
              comments: post.commentsCount || 0,
              // Use caption as the primary content field (matches backend schema)
              content: post.caption,
              // Replace media with processed media
              media: processedMedia,
            };
          });

          setRecentPosts(formattedPosts);
        } else {
          console.error(data.message);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    fetchPosts();
  }, []);

  const handleNewPost = (newPost) => {
    setRecentPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDelete = (postId) => {
    console.log("🗑️ Deleting post with ID:", postId);
    // Remove the deleted post from state
    setRecentPosts((prev) => prev.filter((post) => post._id !== postId));
  };

  const handlePostEdit = (postId, updatedPost) => {
    console.log(
      "✏️ Editing post with ID:",
      postId,
      "Updated post:",
      updatedPost
    );
    // Update the post in state
    setRecentPosts((prev) =>
      prev.map((post) =>
        post._id === postId
          ? {
              ...post,
              caption: updatedPost.caption,
              content: updatedPost.caption, // Keep both for compatibility
              date: new Date(
                updatedPost.updatedAt || updatedPost.createdAt
              ).toLocaleString(),
            }
          : post
      )
    );
  };

  return (
    <section className="w-[1154px] bg-[#ffffff] pb-4 shadow-md rounded-lg">
      <PostHeader recentPosts={recentPosts} />
      <GeneratePost onPost={handleNewPost} />
      <RecentPosts
        recentPosts={recentPosts}
        onPostDelete={handlePostDelete}
        onPostEdit={handlePostEdit}
      />
    </section>
  );
};

export default Post;
