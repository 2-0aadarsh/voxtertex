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
  const formatPeriod = (dateIssued) => {
    if (!dateIssued) return "N/A";
    const date = new Date(dateIssued);
    return `${date.getFullYear()}`;
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
        // Replace temporary award with real one from API
        setAwards((prevAwards) => {
          const filteredAwards = prevAwards.filter(
            (award) => award._id !== tempId
          );
          return [result.data, ...filteredAwards];
        });

        toast.success("Award/Certification added successfully!");
        handleCloseModal();
      } else {
        throw new Error(result?.message || "Failed to create award");
      }
    } catch (error) {
      console.error("Error saving award:", error);

      // Remove temporary award on error
      setAwards((prevAwards) =>
        prevAwards.filter((award) => !award._id.startsWith("temp-"))
      );

      // Show error message
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to save award/certification";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state
  if (isLoadingAwards) {
    return (
      <section className="w-[1154px] bg-[#ffffff] py-4 shadow-md rounded-[13.01px]">
        <div className="w-[90%] mx-auto">
          <SectionHeader
            id="awardsAndCertifications"
            title="Awards & Certifications"
            onAddClick={handleOpenModal}
          />
          <div className="space-y-2 my-12 animate-pulse">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="flex justify-between items-center py-4 border-b border-orange-100"
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
      </section>
    );
  }

  return (
    <>
      <section className="w-[1154px] bg-[#ffffff] py-4 shadow-md rounded-[13.01px]">
        <div className="w-[90%] mx-auto">
          <SectionHeader
            id="awardsAndCertifications"
            title="Awards & Certifications"
            onAddClick={handleOpenModal}
          />

          <div className="space-y-2 my-12">
            {awards.length > 0 ? (
              awards.map((award, index) => (
                <AwardItem
                  key={award._id || index}
                  title={award.title}
                  description={award.description || award.issuer}
                  period={award.period || formatPeriod(award.dateIssued)}
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No awards or certifications added yet.</p>
                <p className="text-sm mt-1">
                  Click the "+" button to add your first one!
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
