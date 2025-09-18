# Speakers API Documentation

This document describes the speakers API endpoints for the booking system.

## Base URL
All endpoints are prefixed with `/api/speakers`

## Endpoints

### 1. GET /api/speakers
Get all speakers with pagination, search, filtering, and sorting capabilities.

#### Query Parameters:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of speakers per page (default: 10)
- `search` (optional): Search in name, expertise, or activities
- `expertise` (optional): Filter by area of expertise
- `industry` (optional): Filter by industry
- `availabilityDate` (optional): Filter by availability on specific date (YYYY-MM-DD format)
- `sortBy` (optional): Sort field (default: createdAt, options: createdAt, rating, firstName, lastName)
- `sortOrder` (optional): Sort order (default: desc, options: asc, desc)

#### Example Requests:
```
GET /api/speakers
GET /api/speakers?page=2&limit=20
GET /api/speakers?search=Artificial Intelligence
GET /api/speakers?expertise=Machine Learning&industry=Technology
GET /api/speakers?availabilityDate=2023-12-15
GET /api/speakers?sortBy=rating&sortOrder=desc
```

#### Response Format:
```json
{
  "success": true,
  "data": {
    "speakers": [
      {
        "id": "speaker_id",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "workEmail": "john@company.com",
        "areaOfExpertise": ["Machine Learning", "AI"],
        "industry": "Technology",
        "activities": ["Speaking", "Consulting"],
        "socialLinks": {
          "linkedin": "https://linkedin.com/in/johndoe",
          "twitter": "https://twitter.com/johndoe",
          "website": "https://johndoe.com"
        },
        "profile": {
          "bio": "Expert in AI and ML",
          "about": "Detailed about section",
          "skills": ["Python", "TensorFlow"],
          "rating": 4.5,
          "ratingCount": 10,
          "profileViews": 100,
          "completedBookings": 5,
          "totalEarnings": 5000
        },
        "availability": {
          "dates": ["2023-12-15T00:00:00.000Z"],
          "eventTypes": [
            {
              "category": "Corporate & Professional Events",
              "subTypes": ["Keynote", "Workshop"]
            }
          ],
          "modes": ["Online", "Offline"],
          "timeSlots": [
            {
              "slot": "Morning",
              "startTime": "09:00",
              "endTime": "12:00"
            }
          ]
        },
        "isProfileComplete": true,
        "createdAt": "2023-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalSpeakers": 50,
      "hasNextPage": true,
      "hasPrevPage": false,
      "limit": 10
    }
  },
  "message": "Speakers retrieved successfully"
}
```

### 2. GET /api/speakers/:id
Get a specific speaker by their ID.

#### Path Parameters:
- `id` (required): Speaker's unique identifier

#### Example Request:
```
GET /api/speakers/64a1b2c3d4e5f6789012345
```

#### Response Format:
```json
{
  "success": true,
  "data": {
    "id": "speaker_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "workEmail": "john@company.com",
    "areaOfExpertise": ["Machine Learning", "AI"],
    "industry": "Technology",
    "activities": ["Speaking", "Consulting"],
    "socialLinks": {
      "linkedin": "https://linkedin.com/in/johndoe",
      "twitter": "https://twitter.com/johndoe",
      "website": "https://johndoe.com"
    },
    "profile": {
      "bio": "Expert in AI and ML",
      "about": "Detailed about section",
      "skills": ["Python", "TensorFlow"],
      "experience": [...],
      "education": [...],
      "awards": [...],
      "videos": [...],
      "ratings": {
        "overall": { "average": 4.5, "count": 10 },
        "communication": { "average": 4.3, "count": 10 },
        "expertise": { "average": 4.7, "count": 10 },
        "professionalism": { "average": 4.4, "count": 10 }
      },
      "stats": {
        "profileViews": 100,
        "totalBookings": 8,
        "completedBookings": 5,
        "cancelledBookings": 1,
        "totalEarnings": 5000
      }
    },
    "availability": {
      "dates": ["2023-12-15T00:00:00.000Z"],
      "eventTypes": [...],
      "modes": ["Online", "Offline"],
      "timeSlots": [...]
    },
    "isProfileComplete": true,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-06-01T00:00:00.000Z"
  },
  "message": "Speaker retrieved successfully"
}
```

### 3. GET /api/speakers/stats
Get speaker statistics and analytics.

#### Example Request:
```
GET /api/speakers/stats
```

#### Response Format:
```json
{
  "success": true,
  "data": {
    "totalSpeakers": 150,
    "verifiedSpeakers": 120,
    "profileCompleteSpeakers": 100,
    "topIndustries": [
      { "_id": "Technology", "count": 45 },
      { "_id": "Healthcare", "count": 25 },
      { "_id": "Finance", "count": 20 },
      { "_id": "Education", "count": 15 }
    ]
  },
  "message": "Speaker statistics retrieved successfully"
}
```

## Error Responses

All endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## HTTP Status Codes

- `200 OK`: Request successful
- `404 Not Found`: Speaker not found
- `500 Internal Server Error`: Server error

## Filtering and Search Capabilities

### Search
The search parameter searches across:
- First name
- Last name
- Area of expertise
- Activities

### Filtering
- **expertise**: Filter by area of expertise (case-insensitive partial match)
- **industry**: Filter by industry (case-insensitive partial match)
- **availabilityDate**: Filter speakers available on a specific date

### Sorting
- **sortBy**: Sort by field (createdAt, rating, firstName, lastName)
- **sortOrder**: Sort direction (asc, desc)

## Data Models

The API uses the following models:
- `EnhancedUser`: Main user data with role-specific information
- `EnhancedProfile`: Detailed profile information including ratings and stats
- `Availability`: Speaker availability and booking information

## Notes

- All dates are returned in ISO 8601 format
- Pagination is 1-indexed (page 1 is the first page)
- Search and filtering are case-insensitive
- The API automatically populates related data (profile, availability)
- Only speakers with `role: 'speaker'` are returned





