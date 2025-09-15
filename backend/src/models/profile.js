// models/profile.js
import mongoose from "mongoose";

const mutualReviewSchema = new mongoose.Schema({
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewerType: {
    type: String,
    enum: ['speaker', 'expert', 'participant'],
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  remarks: {
    type: String,
    maxlength: [500, 'Remarks cannot exceed 500 characters']
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const experienceSchema = new mongoose.Schema({
  title: String,
  organization: String,
  start: String, // format: dd/mm/yyyy
  end: String, // format: dd/mm/yyyy
  type: {
    type: String,
    enum: ['Full-Time', 'Part-Time', 'Internship', 'Freelance', 'Self-Employeed', 'Trainee'],
    default: 'Full-Time'
  },
  location: String,
  description: String,
  certificate: {
    data: Buffer,
    contentType: String
  }
}, { _id: true });

const educationSchema = new mongoose.Schema({
  degree: String,
  organization: String,
  start: String, // format: dd/mm/yyyy
  end: String, // format: dd/mm/yyyy
  field: String,
  description: String,
  certificate: {
    data: Buffer,
    contentType: String
  }
});

const awardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  organization: {
    type: String,
    required: true
  },
  year: {
    type: String,
    required: true,
    match: [/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/(19|20)\d\d$/, 'Please use dd/mm/yyyy format']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  certificate: {
    data: Buffer,
    contentType: String
  }
}, { _id: true }); // Ensure each award has its own _id

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  platform: {
    type: String,
    required: [true, 'Platform is required'],
    maxlength: [50, 'Platform name cannot exceed 50 characters']
  },
  videoUrl: {
    type: String,
    required: [true, 'Video URL is required'],
    validate: {
      validator: function(v) {
        return /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/.test(v);
      },
      message: props => `${props.value} is not a valid URL!`
    }
  },
  thumbnail: {
    data: Buffer,
    contentType: String
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const reviewSchema = new mongoose.Schema({
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  remarks: {
    type: String,
    maxlength: [500, 'Remarks cannot exceed 500 characters']
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  userName: {
    type: String
  },
  bio: String,
  profileImage: {
    data: Buffer,
    contentType: String
  },
  about: String,
  skills: [String],
  experience: [experienceSchema],
  education: [educationSchema],
  awards: [awardSchema],
  expertEvents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],
  videos: [videoSchema],
  
  mutualReviews: [mutualReviewSchema],
  businessRatings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  expertRatings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  freelancerRatings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  completedEvents: {
    type: Number,
    default: 0
  },
  numberOfEvents: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Update the pre-save hook to handle both rating types
profileSchema.pre('save', function(next) {
  // Calculate ratings
  const expertReviews = this.mutualReviews.filter(r => r.reviewerType === 'business');
  if (expertReviews.length > 0) {
    const total = expertReviews.reduce((sum, review) => sum + review.rating, 0);
    this.expertRatings.average = parseFloat((total / expertReviews.length).toFixed(1));
    this.expertRatings.count = expertReviews.length;
  }

  const freelancerReviews = this.mutualReviews.filter(r => r.reviewerType === 'freelancer');
  if (freelancerReviews.length > 0) {
    const total = freelancerReviews.reduce((sum, review) => sum + review.rating, 0);
    this.freelancerRatings.average = parseFloat((total / freelancerReviews.length).toFixed(1));
    this.freelancerRatings.count = freelancerReviews.length;
  }

  const businessReviews = this.mutualReviews.filter(r => r.reviewerType === 'expert');
  if (businessReviews.length > 0) {
    const total = businessReviews.reduce((sum, review) => sum + review.rating, 0);
    this.businessRatings.average = parseFloat((total / businessReviews.length).toFixed(1));
    this.businessRatings.count = businessReviews.length;
  }

  // Always use the actual expertEvents array length for both fields
  const eventsCount = this.expertEvents?.length || 0;
  this.completedEvents = eventsCount;
  this.numberOfEvents = eventsCount;

  next();
});


profileSchema.methods.updateEventCounts = async function() {
  const eventsCount = this.expertEvents?.length || 0;
  this.completedEvents = eventsCount;
  this.numberOfEvents = eventsCount;
  await this.save();
};

profileSchema.virtual('currentEventCount').get(function() {
  return this.expertEvents ? this.expertEvents.length : 0;
});

const Profile = mongoose.models.Profile || mongoose.model("Profile", profileSchema);
export default Profile;
