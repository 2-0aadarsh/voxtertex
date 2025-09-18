"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import SectionHeader from "../../common/SectionHeader";
import EducationItem from "./EducationItems";
import AddEducation from "./AddEducation";
import {
  useGetEducationsQuery,
  useCreateEducationMutation,
  useUpdateEducationMutation,
  useDeleteEducationMutation,
  selectEducations,
} from "../../../../../store/slices/educationSlice";
import { useAppSelector } from "../../../../../store/hooks";

const Education = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState(null);
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
  const [updateEducation, { isLoading: isUpdating }] =
    useUpdateEducationMutation();
  const [deleteEducation, { isLoading: isDeleting }] =
    useDeleteEducationMutation();

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

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingEducation(null);
  };

  const handleEditEducation = (educationId) => {
    console.log("✏️ Edit education:", educationId);
    // Find the education to edit
    const educationToEdit = education.find((edu) => edu._id === educationId);
    if (educationToEdit) {
      console.log("📝 Education to edit:", educationToEdit);
      setEditingEducation(educationToEdit);
      setIsEditModalOpen(true);
    }
  };

  const handleDeleteEducation = async (educationId) => {
    console.log("🗑️ Delete education:", educationId);
    try {
      const result = await deleteEducation(educationId).unwrap();
      if (result.success) {
        // Remove from local state
        setEducation((prev) => prev.filter((edu) => edu._id !== educationId));
        toast.success("Education deleted successfully");
      } else {
        throw new Error(result.message || "Failed to delete education");
      }
    } catch (error) {
      console.error("Error deleting education:", error);
      throw error; // Re-throw to let the item component handle the error
    }
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
      const tempId = `temp-${Math.random().toString(36).substr(2, 9)}`;

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

  const handleUpdateEducation = async (educationData) => {
    try {
      setIsLoading(true);

      // Format data for API
      const formattedData = {
        degree: educationData.degree,
        institution: educationData.institution,
        fieldOfStudy: educationData.fieldOfStudy,
        startDate: new Date(
          `${educationData.startYear}-${getMonthNumber(
            educationData.startMonth
          )}-01`
        ).toISOString(),
        endDate: educationData.isCurrentlyStudying
          ? null
          : new Date(
              `${educationData.endYear}-${getMonthNumber(
                educationData.endMonth
              )}-01`
            ).toISOString(),
        isCurrentlyStudying: educationData.isCurrentlyStudying,
        description: educationData.description || "",
        grade: educationData.grade || "",
      };

      console.log(
        "🔄 Updating education:",
        editingEducation._id,
        formattedData
      );

      // Call the API to update education
      const result = await updateEducation({
        id: editingEducation._id,
        updates: formattedData,
      }).unwrap();

      if (result.success) {
        // The Redux cache will automatically refetch and update the UI
        toast.success("Education updated successfully!");
        setIsEditModalOpen(false);
        setEditingEducation(null);
      } else {
        toast.error(result.message || "Failed to update education");
      }
    } catch (error) {
      console.error("Error updating education:", error);
      toast.error(error.message || "Failed to update education");
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
                  id={edu._id}
                  degree={edu.degree}
                  institution={edu.institution}
                  period={formatPeriod(
                    edu.startDate,
                    edu.endDate,
                    edu.isCurrentlyStudying
                  )}
                  onEdit={handleEditEducation}
                  onDelete={handleDeleteEducation}
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

      {/* Add Education Modal */}
      <AddEducation
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveEducation}
        isLoading={isLoading || isCreating}
      />

      {/* Edit Education Modal */}
      <AddEducation
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleUpdateEducation}
        isLoading={isLoading || isUpdating}
        editingEducation={editingEducation}
        isEditMode={true}
      />
    </>
  );
};

export default Education;
