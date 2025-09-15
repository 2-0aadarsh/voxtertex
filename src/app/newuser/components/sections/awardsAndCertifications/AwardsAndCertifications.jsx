"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import SectionHeader from "../../common/SectionHeader";
import AddCertification from "./AddCertification";
import AwardItem from "./AwardItem";
import {
  useGetAwardsQuery,
  useCreateAwardMutation,
  selectAwards,
} from "../../../../../store/slices/awardsSlice";
import { useAppSelector } from "../../../../../store/hooks";

const AwardsAndCertifications = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [awards, setAwards] = useState([]);

  // Get awards data from Redux
  const {
    data: awardsData,
    isLoading: isLoadingAwards,
    error: awardsError,
  } = useGetAwardsQuery({});
  const [createAward, { isLoading: isCreating }] = useCreateAwardMutation();

  // We're using local state instead of Redux store directly

  // Update local state when Redux data changes
  useEffect(() => {
    if (awardsData?.data) {
      setAwards(awardsData.data);
    }
  }, [awardsData]);

  // Show error toast if there's an error
  useEffect(() => {
    if (awardsError) {
      toast.error("Failed to load awards data");
      console.error("Awards error:", awardsError);
    }
  }, [awardsError]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveAward = async (awardData) => {
    try {
      setIsLoading(true);

      console.log("Award data received from form:", awardData);

      // Format data for API
      const formattedData = {
        title: awardData.title,
        issuer: awardData.issuer,
        description: awardData.description || "",
        dateIssued: `${awardData.year}-${getMonthNumber(awardData.month)}-01`,
        credentialId: awardData.credentialId || "",
        credentialUrl: awardData.credentialUrl || "",
        type: awardData.type || "certification", // Default to certification for this form
        expiryDate: awardData.doesNotExpire ? null : undefined,
      };

      console.log("Formatted award data for API:", formattedData);

      // Create a temporary ID for optimistic update
      const tempId = `temp-${Date.now()}`;

      // Create a temporary award object for optimistic UI update
      const tempAward = {
        _id: tempId,
        ...formattedData,
        period: formatPeriod(formattedData.dateIssued),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Optimistically update the UI
      setAwards((prevAwards) => [tempAward, ...prevAwards]);

      // Call the API to create award
      console.log("Calling createAward API with:", formattedData);
      let result;
      try {
        result = await createAward(formattedData).unwrap();
        console.log("API response:", result);
      } catch (apiError) {
        console.error("API error details:", apiError);
        throw apiError;
      }

      if (result && result.success) {
        // Update the local state with the actual data from the server
        setAwards((prevAwards) =>
          prevAwards.map((award) =>
            award._id === tempId ? result.data : award
          )
        );
        toast.success("Award/Certification added successfully!");
        setIsModalOpen(false);
      } else {
        // Remove the temporary item if the API call failed
        setAwards((prevAwards) =>
          prevAwards.filter((award) => award._id !== tempId)
        );
        toast.error(result.message || "Failed to add award/certification");
      }
    } catch (error) {
      console.error("Error saving award:", error);
      // Remove the temporary item if there was an error
      setAwards((prevAwards) =>
        prevAwards.filter((award) => !award._id.toString().startsWith("temp-"))
      );
      toast.error(error.message || "Failed to add award/certification");
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

  // Format date for display
  const formatPeriod = (dateIssued) => {
    if (!dateIssued) return "";

    const dateObj = new Date(dateIssued);
    return dateObj.getFullYear().toString();
  };

  return (
    <>
      <section className="w-[1154px] bg-[#ffffff] py-4 shadow-md rounded-[13.01px]">
        <div className="w-[90%] mx-auto ">
          <SectionHeader
            id="awardsAndCertifications"
            title="Awards & Certifications"
            onAddClick={handleOpenModal}
          />

          <div className="space-y-2 my-12">
            {isLoadingAwards ? (
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
            ) : awards.length > 0 ? (
              // Awards list
              awards.map((award, index) => (
                <AwardItem
                  key={award._id || index}
                  title={award.title}
                  description={award.description}
                  period={formatPeriod(award.dateIssued)}
                />
              ))
            ) : (
              // Empty state
              <div className="text-center py-10 text-gray-500">
                <p>
                  No awards or certifications added yet. Click "Add" to get
                  started.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Modal */}
      <AddCertification
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveAward}
        isLoading={isLoading || isCreating}
      />
    </>
  );
};

export default AwardsAndCertifications;
