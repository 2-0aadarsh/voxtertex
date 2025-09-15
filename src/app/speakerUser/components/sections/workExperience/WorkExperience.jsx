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
  selectWorkExperiences,
} from "../../../../../store/slices/workExperienceSlice";
import { useAppSelector } from "../../../../../store/hooks";

const WorkExperience = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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

  const handleSaveWorkExperience = async (workData) => {
    try {
      setIsLoading(true);

      // Format data for API
      const formattedData = {
        title: workData.jobTitle,
        company: workData.company,
        employmentType: workData.employmentType,
        location: workData.location,
        startDate: `${workData.startYear}-${getMonthNumber(
          workData.startMonth
        )}-01`,
        endDate: workData.isCurrentlyWorking
          ? null
          : `${workData.endYear}-${getMonthNumber(workData.endMonth)}-01`,
        isCurrentlyWorking: workData.isCurrentlyWorking,
        description: workData.description,
      };

      // Create a temporary ID for optimistic update
      const tempId = `temp-${Date.now()}`;

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
    </>
  );
};

export default WorkExperience;
