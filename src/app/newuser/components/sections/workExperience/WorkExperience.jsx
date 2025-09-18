"use client";

import { useState, useEffect } from "react";
import { MdWork } from "react-icons/md";
import { toast } from "react-hot-toast";
import SectionHeader from "../../common/SectionHeader";
import WorkExperienceItem from "./WorkExperienceItem";
import AddWorkExperience from "./AddWorkExperience";
import {
  useGetWorkExperiencesQuery,
  useCreateWorkExperienceMutation,
  useUpdateWorkExperienceMutation,
  useDeleteWorkExperienceMutation,
  selectWorkExperiences,
} from "../../../../../store/slices/workExperienceSlice";
import { useAppSelector } from "../../../../../store/hooks";

const WorkExperience = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingWorkExperience, setEditingWorkExperience] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [workExperience, setWorkExperience] = useState([]);

  // Get work experiences from Redux
  const {
    data: workExperiencesData,
    isLoading: isLoadingExperiences,
    error: experiencesError,
  } = useGetWorkExperiencesQuery();
  const [createWorkExperience, { isLoading: isCreating }] =
    useCreateWorkExperienceMutation();
  const [updateWorkExperience, { isLoading: isUpdating }] =
    useUpdateWorkExperienceMutation();
  const [deleteWorkExperience, { isLoading: isDeleting }] =
    useDeleteWorkExperienceMutation();

  // Update local state when Redux data changes
  useEffect(() => {
    if (workExperiencesData?.data) {
      setWorkExperience(workExperiencesData.data);
    }
  }, [workExperiencesData]);

  // Show error toast if there's an error
  useEffect(() => {
    if (experiencesError) {
      toast.error("Failed to load work experiences");
      console.error("Work experiences error:", experiencesError);
    }
  }, [experiencesError]);

  const icon = <MdWork />;

  const handleAddClick = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingWorkExperience(null);
  };

  const handleEditWorkExperience = (experienceId) => {
    console.log("✏️ Edit work experience:", experienceId);
    // Find the work experience to edit
    const experienceToEdit = workExperience.find(
      (exp) => exp._id === experienceId
    );
    if (experienceToEdit) {
      console.log("📝 Work experience to edit:", experienceToEdit);
      setEditingWorkExperience(experienceToEdit);
      setIsEditModalOpen(true);
    }
  };

  const handleDeleteWorkExperience = async (experienceId) => {
    console.log("🗑️ Delete work experience:", experienceId);
    try {
      const result = await deleteWorkExperience(experienceId).unwrap();
      if (result.success) {
        // Remove from local state
        setWorkExperience((prev) =>
          prev.filter((exp) => exp._id !== experienceId)
        );
        toast.success("Work experience deleted successfully");
      } else {
        throw new Error(result.message || "Failed to delete work experience");
      }
    } catch (error) {
      console.error("Error deleting work experience:", error);
      throw error; // Re-throw to let the item component handle the error
    }
  };

  const handleSaveWorkExperience = async (workData) => {
    try {
      setIsLoading(true);

      // Format data for API
      const formattedData = {
        title: workData.jobTitle,
        company: workData.company,
        employmentType: workData.employmentType,
        location: workData.location,
        startDate: new Date(
          `${workData.startYear}-${getMonthNumber(workData.startMonth)}-01`
        ).toISOString(),
        endDate: workData.isCurrentlyWorking
          ? null
          : new Date(
              `${workData.endYear}-${getMonthNumber(workData.endMonth)}-01`
            ).toISOString(),
        isCurrentlyWorking: workData.isCurrentlyWorking,
        description: workData.description,
        skills: [], // Add empty skills array for now
      };

      // Create a temporary ID for optimistic update
      const tempId = `temp-${Math.random().toString(36).substr(2, 9)}`;

      // Create a temporary work experience object for optimistic UI update
      const tempWorkExperience = {
        _id: tempId,
        ...formattedData,
        period: formatPeriod(
          formattedData.startDate,
          formattedData.endDate,
          formattedData.isCurrentlyWorking
        ),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Optimistically update the UI
      setWorkExperience((prevExperiences) => [
        tempWorkExperience,
        ...prevExperiences,
      ]);

      // Call the API to create work experience
      const result = await createWorkExperience(formattedData).unwrap();

      if (result.success) {
        // Update the local state with the actual data from the server
        setWorkExperience((prevExperiences) =>
          prevExperiences.map((exp) => (exp._id === tempId ? result.data : exp))
        );
        toast.success("Work experience added successfully!");
        setIsAddModalOpen(false);
      } else {
        // Remove the temporary item if the API call failed
        setWorkExperience((prevExperiences) =>
          prevExperiences.filter((exp) => exp._id !== tempId)
        );
        toast.error(result.message || "Failed to add work experience");
      }
    } catch (error) {
      console.error("Error saving work experience:", error);
      // Remove the temporary item if there was an error
      setWorkExperience((prevExperiences) =>
        prevExperiences.filter((exp) => !exp._id.toString().startsWith("temp-"))
      );
      toast.error(error.message || "Failed to add work experience");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateWorkExperience = async (workData) => {
    try {
      setIsLoading(true);

      // Format data for API
      const formattedData = {
        title: workData.jobTitle,
        company: workData.company,
        employmentType: workData.employmentType,
        location: workData.location,
        startDate: new Date(
          `${workData.startYear}-${getMonthNumber(workData.startMonth)}-01`
        ).toISOString(),
        endDate: workData.isCurrentlyWorking
          ? null
          : new Date(
              `${workData.endYear}-${getMonthNumber(workData.endMonth)}-01`
            ).toISOString(),
        isCurrentlyWorking: workData.isCurrentlyWorking,
        description: workData.description,
        skills: [], // Add empty skills array for now
      };

      console.log(
        "🔄 Updating work experience:",
        editingWorkExperience._id,
        formattedData
      );

      // Call the API to update work experience
      const result = await updateWorkExperience({
        id: editingWorkExperience._id,
        updates: formattedData,
      }).unwrap();

      if (result.success) {
        // The Redux cache will automatically refetch and update the UI
        toast.success("Work experience updated successfully!");
        setIsEditModalOpen(false);
        setEditingWorkExperience(null);
      } else {
        toast.error(result.message || "Failed to update work experience");
      }
    } catch (error) {
      console.error("Error updating work experience:", error);
      toast.error(error.message || "Failed to update work experience");
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
  const formatPeriod = (startDate, endDate, isCurrentlyWorking) => {
    if (!startDate) return "";

    const startDateObj = new Date(startDate);
    const startYear = startDateObj.getFullYear();

    if (isCurrentlyWorking) {
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
      <section className="w-[1154px] bg-[#ffffff] py-4 shadow-md rounded-[13.01px]">
        <div className="w-[90%] mx-auto">
          <SectionHeader
            id="workExperience"
            icon={icon}
            title="Work Experience"
            subTitle="Professional journey and achievements"
            onAddClick={handleAddClick}
          />

          <div className="space-y-6 my-12">
            {isLoadingExperiences ? (
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
            ) : workExperience.length > 0 ? (
              // Work experience list
              workExperience.map((job, index) => (
                <WorkExperienceItem
                  key={job._id || index}
                  id={job._id}
                  title={job.title}
                  company={job.company}
                  period={formatPeriod(
                    job.startDate,
                    job.endDate,
                    job.isCurrentlyWorking
                  )}
                  employmentType={job.employmentType}
                  description={job.description}
                  skills={job.skills || []}
                  onEdit={handleEditWorkExperience}
                  onDelete={handleDeleteWorkExperience}
                />
              ))
            ) : (
              // Empty state
              <div className="text-center py-10 text-gray-500">
                <p>No work experience added yet. Click "Add" to get started.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Add Work Experience Modal */}
      <AddWorkExperience
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveWorkExperience}
        isLoading={isLoading || isCreating}
      />

      {/* Edit Work Experience Modal */}
      <AddWorkExperience
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleUpdateWorkExperience}
        isLoading={isLoading || isUpdating}
        editingWorkExperience={editingWorkExperience}
        isEditMode={true}
      />
    </>
  );
};

export default WorkExperience;
