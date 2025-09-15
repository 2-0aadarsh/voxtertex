/**
 * String utility functions
 */

/**
 * Format full name into first name and last name
 */
export const formatName = (fullName) => {
  const nameParts = fullName.trim().split(' ');
  return {
    firstName: nameParts[0] || '',
    lastName: nameParts.slice(1).join(' ') || '',
  };
};

/**
 * Generate username from email
 */
export const generateUsernameFromEmail = (email) => {
  return email.split('@')[0];
};

/**
 * Capitalize first letter of each word
 */
export const capitalizeWords = (str) => {
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

/**
 * Generate slug from string
 */
export const generateSlug = (str) => {
  return str
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};

/**
 * Truncate string to specified length
 */
export const truncateString = (str, length = 100) => {
  if (str.length <= length) return str;
  return str.substring(0, length).trim() + '...';
};

/**
 * Extract mentions from text (@username)
 */
export const extractMentions = (text) => {
  const mentionRegex = /@(\w+)/g;
  const mentions = [];
  let match;
  
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]);
  }
  
  return mentions;
};

/**
 * Extract hashtags from text (#hashtag)
 */
export const extractHashtags = (text) => {
  const hashtagRegex = /#(\w+)/g;
  const hashtags = [];
  let match;
  
  while ((match = hashtagRegex.exec(text)) !== null) {
    hashtags.push(match[1].toLowerCase());
  }
  
  return hashtags;
};

/**
 * Clean and validate URL
 */
export const cleanUrl = (url) => {
  if (!url) return '';
  
  // Add protocol if missing
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }
  
  return url;
};

/**
 * Generate random string
 */
export const generateRandomString = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};


















