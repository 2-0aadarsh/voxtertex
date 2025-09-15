import { activitiesByIndustry } from "../../data/activitiesData";

/**
 * Get available activities based on selected industry
 */
export const getAvailableActivities = (industry: string): string[] => {
  return activitiesByIndustry[industry as keyof typeof activitiesByIndustry] || [];
};

/**
 * Format name for API submission
 */
export const formatName = (fullName: string): { firstName: string; lastName: string } => {
  const nameParts = fullName.trim().split(' ');
  return {
    firstName: nameParts[0] || '',
    lastName: nameParts.slice(1).join(' ') || '',
  };
};

