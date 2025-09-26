import mongoose from "mongoose";

const ticketTierSchema = new mongoose.Schema({
  ticketName: {
    type: String,
    required: [true, "Ticket name is required"],
    trim: true,
    maxlength: [100, "Ticket name cannot exceed 100 characters"],
  },
  price: {
    type: Number,
    required: [true, "Ticket price is required"],
    min: [0, "Ticket price cannot be negative"],
  },
  quantity: {
    type: Number,
    required: [true, "Ticket quantity is required"],
    min: [1, "Quantity must be at least 1"],
  },
  features: [
    {
      type: String,
      trim: true,
      maxlength: [200, "Feature cannot exceed 200 characters"],
    },
  ],
});

const eventSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: [true, 'Event topic is required'],
    trim: true,
    maxlength: [120, 'Topic cannot exceed 120 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  eventBanner: {
    data: {
      type: Buffer,
      required: false
    },
    contentType: {
      type: String,
      required: false
    }
  },
  totalAudienceCount: {
    type: Number,
    required: [true, 'Total audience count is required'],
    min: [1, 'Audience count must be at least 1'],
    max: [10000, 'Audience count cannot exceed 10,000']
  },
  pricePerHead: {
    type: Number,
    required: [true, 'Price per head is required'],
    min: [0, 'Price cannot be negative']
  },

  speakers: [{
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    name: {
      type: String,
      required: false
    },
    title: {
      type: String,
      required: false
    },
    bio: {
      type: String,
      required: false
    }
  }],
  // organizer: [{
  //   type: String,
  //   required: [true, 'Organizer is required'],
  // }],
  organizer: {
    email: {
      type: String,
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  eventDate: {
    type: Date,
    required: [true, 'Event date is required'],
    validate: {
      validator: function (v) {
        // Allow events to be created for today and future dates
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return v >= today;
      },
      message: 'Event date must be today or in the future'
    }
  },
  eventStartTime: {
    type: String,
  },
  eventEndTime: {
    type: String,
  },
  eventMode: {
    type: String,
    required: [true, 'Event mode is required'],
    enum: {
      values: ['online', 'offline', 'hybrid'],
      message: 'Event mode must be either online, offline or hybrid'
    }
  },
  eventLocation: {
    type: String,
    trim: true,
    validate: [
    {
      validator: function (v) {
        if (this.eventMode === 'online' || this.eventMode === 'hybrid') {
          return v && v.trim().length > 0; // must be non-empty
        }
        return true; // not required otherwise
      },
      message: 'Event location is required for online or hybrid events'
    },
    {
      validator: function (v) {
        if ((this.eventMode === 'online' || this.eventMode === 'hybrid') && v) {
          return v.startsWith('http://') || v.startsWith('https://');
        }
        return true;
      },
      message: 'Event location must be a valid URL'
    }
  ]
  },
 venueAddress: {
  type: String,
  trim: true,
  maxlength: [500, 'Venue address cannot exceed 500 characters'],
  validate: {
    validator: function (v) {
      if (this.eventMode === 'offline' || this.eventMode === 'hybrid') {
        return v && v.trim().length > 0;
      }
      return true;
    },
    message: 'Venue address is required for offline or hybrid events'
  }},
   tickets: [ticketTierSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
},
  {
    timestamps: true,
    toJSON: { virtuals: true },  // Include virtuals when converting to JSON
    toObject: { virtuals: true } // Include virtuals when converting to objects
  });

// Virtual for checking if event is in the past
eventSchema.virtual('isPast').get(function () {
  return this.eventDate < new Date();
});

// Virtual for checking if event is in the future
eventSchema.virtual('isFuture').get(function () {
  return this.eventDate > new Date();
});

// Virtual for event status (categorization)
eventSchema.virtual('status').get(function () {
  return this.eventDate < new Date() ? 'past' : 'future';
}
);


// eventSchema.post('save', async function(doc) {
//   try {
//     const Profile = mongoose.model('Profile');
    
//     // Update each speaker's profile
//     await Promise.all(doc.speakers.map(speaker => 
//       Profile.updateExpertEvents(speaker.userId, doc._id)
//     ));
//   } catch (error) {
//     console.error('Error updating speaker profiles:', error);
//   }
// });

const Event = mongoose.model('Event', eventSchema);

export default Event;