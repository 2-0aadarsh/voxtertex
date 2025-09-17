// ============================================================================
// STORE TYPES - Production Ready Type Definitions
// ============================================================================

// Base API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Loading States
export interface LoadingState {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: string | null;
}

// User & Auth Types
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNo?: string;
  role: 'speaker' | 'organizer' | 'participant';
  isEmailVerified: boolean;
  isProfileComplete: boolean;
  signupComplete: boolean;
  profileImage?: {
    data: Buffer;
    contentType: string;
  };
  bio?: string;
  professionalTitle?: string;
  location?: string;
  areaOfExpertise?: string[];
  yearsOfExperience?: number;
  profile?: {
    id: string;
    isComplete: boolean;
  };
  roleSpecificData?: {
    workEmail?: string;
    industry?: string;
    activities?: string[];
    socialLinks?: {
      linkedin?: string;
      twitter?: string;
      website?: string;
      portfolio?: string;
    };
  };
  accountStatus?: 'active' | 'suspended' | 'deactivated';
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  
  // Mongoose document properties
  _doc?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    mobileNo?: string;
    role: 'speaker' | 'organizer' | 'participant';
    isEmailVerified: boolean;
    isProfileComplete: boolean;
    signupComplete: boolean;
    profileImage?: {
      data: Buffer;
      contentType: string;
    };
    bio?: string;
    professionalTitle?: string;
    location?: string;
    areaOfExpertise?: string[];
    yearsOfExperience?: number;
    roleSpecificData?: {
      workEmail?: string;
      industry?: string;
      activities?: string[];
      socialLinks?: {
        linkedin?: string;
        twitter?: string;
        website?: string;
        portfolio?: string;
      };
    };
    accountStatus?: 'active' | 'suspended' | 'deactivated';
    lastLogin?: string;
    createdAt: string;
    updatedAt: string;
  };
  $__?: any;
  $isNew?: boolean;
}

export interface AuthState extends LoadingState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  role: 'speaker' | 'organizer' | 'participant' | null;
}

// Profile Types
export interface Profile {
  _id: string;
  user: string;
  bio?: string;
  professionalTitle?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    portfolio?: string;
  };
  skills: string[];
  domains: string[];
  stats: {
    connections: number;
    projects: number;
    experience: string;
  };
  contacts: {
    phone?: string;
    email: string;
    address?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProfileState extends LoadingState {
  profile: Profile | null;
}

// Posts Types
export interface Post {
  _id: string;
  user: string;
  title?: string;
  caption: string;
  content?: string;
  media?: {
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
  }[];
  tags: string[];
  category?: string;
  visibility: 'public' | 'private' | 'connections';
  status: 'draft' | 'published' | 'archived';
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

// Comment Types
export interface Comment {
  _id: string;
  user: string;
  userName: string;
  userProfileImage?: {
    data: Buffer;
    contentType: string;
  };
  content: string;
  likes: Array<{
    user: string;
    likedAt: Date;
  }>;
  likesCount: number;
  replies: Array<{
    user: string;
    userName: string;
    content: string;
    createdAt: Date;
  }>;
  isEdited: boolean;
  editedAt?: Date;
  createdAt: string;
  updatedAt: string;
}

export interface PostsState extends LoadingState {
  posts: Post[];
  currentPost: Post | null;
  filters: {
    category?: string;
    tags?: string[];
    visibility?: string;
    status?: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// Feed Types
export interface FeedPost {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    professionalTitle?: string;
    profileImage?: {
      data: Buffer;
      contentType: string;
    };
  };
  userName: string;
  userProfileImage?: {
    data: Buffer;
    contentType: string;
  };
  userProfessionalTitle?: string;
  title?: string;
  caption: string;
  media?: {
    type: 'image' | 'video' | 'document';
    url: string;
    filename?: string;
    size?: number;
    duration?: string;
    thumbnail?: string;
  }[];
  category: string;
  tags: string[];
  likes: {
    user: string;
    userName: string;
    likedAt: string;
  }[];
  comments: {
    _id: string;
    user: string;
    userName: string;
    userProfileImage?: {
      data: Buffer;
      contentType: string;
    };
    content: string;
    likes: {
      user: string;
      likedAt: string;
    }[];
    likesCount: number;
    replies: {
      user: string;
      userName: string;
      content: string;
      createdAt: string;
    }[];
    isEdited: boolean;
    editedAt?: string;
    createdAt: string;
    updatedAt: string;
  }[];
  shares: {
    user: string;
    userName: string;
    sharedAt: string;
    shareNote?: string;
  }[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount: number;
  visibility: 'public' | 'connections' | 'private';
  allowComments: boolean;
  allowShares: boolean;
  status: 'active' | 'hidden' | 'removed' | 'under-review';
  analytics: {
    impressions: number;
    clicks: number;
    engagement: number;
    reach: number;
  };
  isEdited: boolean;
  editedAt?: string;
  editHistory: {
    editedAt: string;
    previousContent: {
      title?: string;
      caption?: string;
    };
    reason?: string;
  }[];
  scheduledFor?: string;
  isScheduled: boolean;
  isPinned: boolean;
  pinnedAt?: string;
  isLiked: boolean; // Server-side computed field
  createdAt: string;
  updatedAt: string;
}

export interface FeedState extends LoadingState {
  posts: FeedPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  userAuthenticated: boolean;
}

// Work Experience Types
export interface WorkExperience {
  _id: string;
  user: string;
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description: string;
  skills: string[];
  achievements: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkExperienceState extends LoadingState {
  experiences: WorkExperience[];
  currentExperience: WorkExperience | null;
}

// Education Types
export interface Education {
  _id: string;
  user: string;
  degree: string;
  institution: string;
  field: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  grade?: string;
  description?: string;
  achievements: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface EducationState extends LoadingState {
  educations: Education[];
  currentEducation: Education | null;
}

// Awards & Certifications Types
export interface Award {
  _id: string;
  user: string;
  title: string;
  issuer: string;
  dateIssued: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  description?: string;
  type: 'award' | 'certification' | 'achievement';
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface AwardsState extends LoadingState {
  awards: Award[];
  currentAward: Award | null;
}

// Featured Videos Types
export interface FeaturedVideo {
  _id: string;
  user: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: number;
  category?: string;
  tags: string[];
  visibility: 'public' | 'private';
  viewCount: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface VideosState extends LoadingState {
  videos: FeaturedVideo[];
  currentVideo: FeaturedVideo | null;
}

// Calendar Types (for Speakers)
export interface CalendarEvent {
  _id: string;
  user: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'available' | 'booked' | 'blocked';
  status: 'pending' | 'confirmed' | 'cancelled';
  client?: {
    name: string;
    email: string;
    phone?: string;
  };
  location?: string;
  meetingUrl?: string;
  rate?: number;
  currency?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarState extends LoadingState {
  events: CalendarEvent[];
  selectedDate: string | null;
  currentEvent: CalendarEvent | null;
  view: 'month' | 'week' | 'day';
  filters: {
    type?: string;
    status?: string;
    dateRange?: {
      start: string;
      end: string;
    };
  };
}

// Availability Types (for Speakers)
export interface TimeSlot {
  slot: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  startTime: string; // Format: "HH:MM"
  endTime: string;   // Format: "HH:MM"
}

export interface EventType {
  category: 'Corporate & Professional Events' | 'Educational & Training Formats' | 'Specialized & Niche Events';
  subTypes: string[];
}

export interface Availability {
  _id: string;
  userId: string;
  dates: string[]; // Array of dates
  eventTypes: EventType[];
  modes: ('Online' | 'Offline' | 'Hybrid')[];
  timeSlots: TimeSlot[];
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilityState extends LoadingState {
  availabilities: Availability[];
  currentAvailability: Availability | null;
}

// Root State Type
export interface RootState {
  auth: AuthState;
  profile: ProfileState;
  posts: PostsState;
  feed: FeedState;
  workExperience: WorkExperienceState;
  education: EducationState;
  awards: AwardsState;
  videos: VideosState;
  calendar: CalendarState;
  availability: AvailabilityState;
}

// API Request Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  bio?: string;
  professionalTitle?: string;
  location?: string;
  website?: string;
  socialLinks?: Profile['socialLinks'];
  skills?: string[];
  domains?: string[];
}

export interface CreatePostRequest {
  title?: string;
  caption: string;
  content?: string;
  tags?: string[];
  category?: string;
  visibility?: Post['visibility'];
}

export interface CreateWorkExperienceRequest {
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description: string;
  skills?: string[];
  achievements?: string[];
}

export interface CreateEducationRequest {
  degree: string;
  institution: string;
  field: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  grade?: string;
  description?: string;
  achievements?: string[];
}

export interface CreateAwardRequest {
  title: string;
  issuer: string;
  dateIssued: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  description?: string;
  type: Award['type'];
}

export interface CreateVideoRequest {
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  category?: string;
  tags?: string[];
  visibility?: FeaturedVideo['visibility'];
}

export interface CreateCalendarEventRequest {
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  type: CalendarEvent['type'];
  location?: string;
  rate?: number;
  currency?: string;
}

export interface CreateAvailabilityRequest {
  dates: string[];
  eventTypes: EventType[];
  modes: ('Online' | 'Offline' | 'Hybrid')[];
  timeSlots: TimeSlot[];
}
