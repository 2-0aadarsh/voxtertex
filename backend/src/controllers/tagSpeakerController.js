import EnhancedProfile from "../models/enhancedProfile.js";

// Add a tag to a speaker
export const addSpeakerTag = async (req, res) => {
  try {
    const { speakerId } = req.params;
    const { tag } = req.body;

    if (!tag || !tag.trim()) {
      return res.status(400).json({ success: false, message: "Tag is required" });
    }

    const profile = await EnhancedProfile.findOne({ user: speakerId });

    if (!profile) {
      return res.status(404).json({ success: false, message: "Speaker profile not found" });
    }

    // Initialize tags array if not present
    if (!profile.tags) profile.tags = [];

    // Avoid duplicate tags
    if (!profile.tags.includes(tag)) {
      profile.tags.push(tag);
      await profile.save();
    }

    return res.status(200).json({
      success: true,
      message: "Tag added successfully",
      tags: profile.tags,
    });
  } catch (error) {
    console.error("Error adding tag:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Remove a tag from a speaker
export const removeSpeakerTag = async (req, res) => {
  try {
    const { speakerId } = req.params;
    const { tag } = req.body;

    if (!tag || !tag.trim()) {
      return res.status(400).json({ success: false, message: "Tag is required" });
    }

    const profile = await EnhancedProfile.findOne({ user: speakerId });

    if (!profile) {
      return res.status(404).json({ success: false, message: "Speaker profile not found" });
    }

    if (!profile.tags || !profile.tags.includes(tag)) {
      return res.status(400).json({ success: false, message: "Tag not found for this speaker" });
    }

    // Remove the tag
    profile.tags = profile.tags.filter((t) => t !== tag);
    await profile.save();

    return res.status(200).json({
      success: true,
      message: "Tag removed successfully",
      tags: profile.tags,
    });
  } catch (error) {
    console.error("Error removing tag:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
