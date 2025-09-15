"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import SectionHeader from "../../common/SectionHeader";
import EducationItem from "./EducationItems";
import AddEducation from "./AddEducation";
import {
  useGetEducationsQuery,
  useCreateEducationMutation,
  selectEducations,
} from "../../../../../store/slices/educationSlice";
import { useAppSelector } from "../../../../../store/hooks";

const Education = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [education, setEducation] = useState([]);

  // Get education data from Redux
  const {
    data: educationData,
    isLoading: isLoadingEducation,
    error: educationError,
  } = useGetEducationsQuery();
  const [createEducation, { isLoading: isCreating }] =
    useCreateEducationMutation();

  // Update local state when Redux data changes
  useEffect(() => {
    if (educationData?.data) {
      setEducation(educationData.data);
    }
  }, [educationData]);

  // Show error toast if there's an error
  useEffect(() => {
    if (educationError) {
      toast.error("Failed to load education data");
      console.error("Education error:", educationError);
    }
  }, [educationError]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Helper function to get month number
  const getMonthNumber = (monthName) => {
    const months = {
      January: "01",
      February: "02",
      March: "03",
      April: "04",
      May: "05",
      June: "06",
      July: "07",
      August: "08",
      September: "09",
      October: "10",
      November: "11",
      December: "12",
    };
    return months[monthName] || "01";
  };

  // Helper function to format period
  const formatPeriod = (startDate, endDate, isCurrentlyStudying) => {
    if (!startDate) return "N/A";
    const start = new Date(startDate);
    const startYear = start.getFullYear();

    if (isCurrentlyStudying) {
      return `${startYear} - Present`;
    }

    if (!endDate) return `${startYear}`;
    const end = new Date(endDate);
    const endYear = end.getFullYear();

    return `${startYear} - ${endYear}`;
  };

  const handleSaveEducation = async (educationData) => {
    try {
      setIsLoading(true);

      console.log("Education data received from form:", educationData);

      // Format data for API
      const formattedData = {
        degree: educationData.degree,
        institution: educationData.institution,
        fieldOfStudy: educationData.fieldOfStudy,
        startDate: `${educationData.startYear}-${getMonthNumber(
          educationData.startMonth
        )}-01`,
        endDate: educationData.isCurrentlyStudying
          ? null
          : `${educationData.endYear}-${getMonthNumber(
              educationData.endMonth
            )}-01`,
        isCurrentlyStudying: educationData.isCurrentlyStudying,
        description: educationData.description || "",
        grade: educationData.grade || "",
        activities: educationData.activities || "",
      };

      console.log("Formatted education data for API:", formattedData);

      // Create a temporary ID for optimistic update
      const tempId = `temp-${Date.now()}`;

      // Create a temporary education object for optimistic UI update
      const tempEducation = {
        _id: tempId,
        ...formattedData,
        period: formatPeriod(
          formattedData.startDate,
          formattedData.endDate,
          formattedData.isCurrentlyStudying
        ),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Optimistically update the UI
      setEducation((prevEducation) => [tempEducation, ...prevEducation]);

      // Call the API to create education
      console.log("Calling createEducation API with:", formattedData);
      let result;
      try {
        result = await createEducation(formattedData).unwrap();
        console.log("API response:", result);
      } catch (apiError) {
        console.error("API error details:", apiError);
        throw apiError;
      }

      if (result && result.success) {
        // Replace temporary education with real one from API
        setEducation((prevEducation) => {
          const filteredEducation = prevEducation.filter(
            (edu) => edu._id !== tempId
          );
          return [result.data, ...filteredEducation];
        });

        toast.success("Education added successfully!");
        handleCloseModal();
      } else {
        throw new Error(result?.message || "Failed to create education");
      }
    } catch (error) {
      console.error("Error saving education:", error);

      // Remove temporary education on error
      setEducation((prevEducation) =>
        prevEducation.filter((edu) => !edu._id.startsWith("temp-"))
      );

      // Show error message
      const errorMessage =
        error?.data?.message || error?.message || "Failed to save education";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state
  if (isLoadingEducation) {
    return (
      <div className="w-[1154px] bg-[#ffffff] py-4 shadow-md rounded-[13.01px]">
        <div className="w-[90%] mx-auto">
          <SectionHeader
            id="education"
            title="Education"
            onAddClick={handleOpenModal}
          />
          <div className="space-y-6 animate-pulse">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="flex justify-between items-center my-12 pb-4 border-b-2 border-[#FF6B35]/9"
              >
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-[1154px] bg-[#ffffff] py-4 shadow-md rounded-[13.01px]">
        <div className="w-[90%] mx-auto">
          <SectionHeader
            id="education"
            title="Education"
            onAddClick={handleOpenModal}
          />

          <div className="space-y-6">
            {education.length > 0 ? (
              education.map((edu, index) => (
                <EducationItem
                  key={edu._id || index}
                  degree={edu.degree}
                  institution={edu.institution}
                  period={
                    edu.period ||
                    formatPeriod(
                      edu.startDate,
                      edu.endDate,
                      edu.isCurrentlyStudying
                    )
                  }
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No education entries added yet.</p>
                <p className="text-sm mt-1">
                  Click the "+" button to add your first one!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <AddEducation
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveEducation}
        isLoading={isLoading || isCreating}
      />
    </>
  );
};

export default Education;
