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
      const result = await createEducation(formattedData).unwrap();
      console.log("API response:", result);

      if (result.success) {
        // Update the local state with the actual data from the server
        setEducation((prevEducation) =>
          prevEducation.map((edu) => (edu._id === tempId ? result.data : edu))
        );
        toast.success("Education added successfully!");
        setIsModalOpen(false);
      } else {
        // Remove the temporary item if the API call failed
        setEducation((prevEducation) =>
          prevEducation.filter((edu) => edu._id !== tempId)
        );
        toast.error(result.message || "Failed to add education");
      }
    } catch (error) {
      console.error("Error saving education:", error);
      // Remove the temporary item if there was an error
      setEducation((prevEducation) =>
        prevEducation.filter((edu) => !edu._id.toString().startsWith("temp-"))
      );
      toast.error(error.message || "Failed to add education");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to convert month name to number
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

  // Format date period for display
  const formatPeriod = (startDate, endDate, isCurrentlyStudying) => {
    if (!startDate) return "";

    const startDateObj = new Date(startDate);
    const startYear = startDateObj.getFullYear();

    if (isCurrentlyStudying) {
      return `${startYear} - Present`;
    }

    if (endDate) {
      const endDateObj = new Date(endDate);
      const endYear = endDateObj.getFullYear();
      return `${startYear} - ${endYear}`;
    }

    return `${startYear}`;
  };

  return (
    <>
      <div className="w-[1154px] bg-[#ffffff] py-4 shadow-md rounded-[13.01px] ">
        <div className="w-[90%] mx-auto ">
          <SectionHeader
            id="education"
            title="Education"
            onAddClick={handleOpenModal}
          />

          <div className="space-y-6 my-12">
            {isLoadingEducation ? (
              // Loading state
              <div className="flex justify-center items-center py-10">
                <div className="animate-pulse flex space-x-4">
                  <div className="flex-1 space-y-4 py-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : education.length > 0 ? (
              // Education list
              education.map((edu, index) => (
                <EducationItem
                  key={edu._id || index}
                  degree={edu.degree}
                  institution={edu.institution}
                  period={formatPeriod(
                    edu.startDate,
                    edu.endDate,
                    edu.isCurrentlyStudying
                  )}
                />
              ))
            ) : (
              // Empty state
              <div className="text-center py-10 text-gray-500">
                <p>No education added yet. Click "Add" to get started.</p>
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
