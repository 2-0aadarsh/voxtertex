/**
 * Availability Service
 * Handles API calls for availability management including fetching, creating, and managing availability data
 */

// Base API URL - should be configured from environment variables in production
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Fetch availability for a specific month for the current authenticated user
 * @param {number} year - The year
 * @param {number} month - The month (1-12)
 * @returns {Promise} - Promise with the availability data
 */
export const getAvailability = async (year, month) => {
  try {
    const response = await fetch(`${API_BASE_URL}/availability/${year}/${month}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
      credentials: 'include',
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching availability: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch availability:', error);
    throw error;
  }
};

/**
 * Get availability for a date range for the current authenticated user
 * @param {string} startDate - Start date in ISO format
 * @param {string} endDate - End date in ISO format
 * @returns {Promise} - Promise with the availability data
 */
export const getAvailabilityByDateRange = async (startDate, endDate) => {
  try {
    const response = await fetch(`${API_BASE_URL}/availability/range?startDate=${startDate}&endDate=${endDate}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
      credentials: 'include',
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching availability by range: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch availability by range:', error);
    throw error;
  }
};

/**
 * Get a specific availability by ID for the current authenticated user
 * @param {string} availabilityId - The availability ID
 * @returns {Promise} - Promise with the availability data
 */
export const getAvailabilityById = async (availabilityId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/availability/${availabilityId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching availability: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch availability by ID:', error);
    throw error;
  }
};

/**
 * Create or update availability for the current authenticated user
 * @param {Object} availabilityData - The availability data to save
 * @returns {Promise} - Promise with the saved availability data
 */
export const createAvailability = async (availabilityData) => {
  try {
    console.log('Creating availability:', availabilityData);
    
    const response = await fetch(`${API_BASE_URL}/availability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
      credentials: 'include',
      cache: 'no-store',
      body: JSON.stringify(availabilityData),
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => null);
      console.error('Error response from server:', errorText);
      throw new Error(`Failed to save availability (status ${response.status}) ${errorText ? `: ${errorText}` : ''}`);
    }
    
    const data = await response.json();
    console.log('Availability saved successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to create availability:', error);
    throw error;
  }
};

/**
 * Update availability for the current authenticated user
 * @param {string} availabilityId - The availability ID to update
 * @param {Object} availabilityData - The updated availability data
 * @returns {Promise} - Promise with the updated availability data
 */
export const updateAvailability = async (availabilityId, availabilityData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/availability/${availabilityId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(availabilityData),
    });
    
    if (!response.ok) {
      throw new Error(`Error updating availability: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to update availability:', error);
    throw error;
  }
};

/**
 * Delete availability for specific dates for the current authenticated user
 * @param {string[]} dates - Array of dates to delete availability for
 * @returns {Promise} - Promise with the deletion result
 */
export const deleteAvailability = async (dates) => {
  try {
    const response = await fetch(`${API_BASE_URL}/availability`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ dates }),
    });
    
    if (!response.ok) {
      throw new Error(`Error deleting availability: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to delete availability:', error);
    throw error;
  }
};

/**
 * Helper function to format availability data for the modal
 * @param {Object} formData - Form data from the modal
 * @param {Date[]} dates - Selected dates
 * @returns {Object} - Formatted availability data
 */
export const formatAvailabilityData = (formData, dates) => {
  const EVENT_CATEGORIES = [
    {
      title: "Corporate & Professional Events",
      options: [
        "Conferences & Summits",
        "Seminars",
        "Keynote Speeches",
        "Panel Discussions",
        "Fireside Chats",
        "Town Halls & Open Forums",
        "Leadership Retreats",
        "Networking Events",
        "Trade Shows & Expos",
        "Product Launches",
        "Sales Kick-Offs (SKOs)",
        "Award Ceremonies & Galas",
      ],
    },
    {
      title: "Educational & Training Formats",
      options: [
        "Workshops & Masterclasses",
        "Corporate Training",
        "Guest Lectures",
        "TED-Style Talks",
        "1:1 Session",
        "Mentorship Session",
      ],
    },
    {
      title: "Specialized & Niche Events",
      options: [
        "Pitch Competitions & Startup Showcases",
        "Hackathons & Innovation Jams",
        "Charity & Fundraising Events",
        "Festivals (Music, Arts, Community)",
      ],
    },
  ];

  const TIME_SLOTS = [
    { label: "Morning", time: "09:00 - 12:00" },
    { label: "Afternoon", time: "13:00 - 17:00" },
    { label: "Evening", time: "18:00 - 21:00" },
    { label: "Night", time: "21:00 - 23:00" },
  ];

  return {
    dates: dates.map(d => new Date(d).toISOString()),
    eventTypes: EVENT_CATEGORIES.map((cat) => ({
      category: cat.title,
      subTypes: formData.categories.filter((c) => cat.options.includes(c)),
    })).filter((et) => et.subTypes.length > 0),
    modes: formData.modes,
    timeSlots: TIME_SLOTS.filter((slot) =>
      formData.slots.includes(slot.label)
    ).map((slot) => ({
      slot: slot.label,
      startTime: slot.time.split(" - ")[0],
      endTime: slot.time.split(" - ")[1],
    })),
  };
};





