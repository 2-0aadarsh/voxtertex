"use client";

import { useEffect, useState, useCallback } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  format,
} from "date-fns";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useGetAvailabilitiesQuery } from "@/store/slices/availabilitySlice";
import { useGetCurrentUserQuery } from "@/store/slices/authSlice";

import CalendarHeader from "./CalendarHeader";
import DatesGrid from "./DatesGrid";
import AvailabilityModal from "../modals/AvailabilityModal";
import WeekDays from "./WeekDays";

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [multiSelect, setMultiSelect] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Get current user data
  const {
    data: currentUserData,
    isLoading: isUserLoading,
    error: userError,
  } = useGetCurrentUserQuery();

  // Get availability data using Redux
  const {
    data: availabilityResponse,
    isLoading: isAvailabilityLoading,
    error: availabilityError,
    refetch: refetchAvailability,
  } = useGetAvailabilitiesQuery({
    year: currentMonth.getFullYear(),
    month: currentMonth.getMonth() + 1,
  });

  const availabilityData = availabilityResponse?.data || [];

  // calculate visible range
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const handlePrev = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNext = () => setCurrentMonth(addMonths(currentMonth, 1));
  const resetSelectedDates = () => {
    setSelectedDate(null);
    setSelectedDates([]);
    setMultiSelect(false);
  };

  const handleDateClick = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return;

    if (multiSelect) {
      setSelectedDates((prev) =>
        prev.some((d) => d.toDateString() === date.toDateString())
          ? prev.filter((d) => d.toDateString() !== date.toDateString())
          : [...prev, date]
      );
    } else {
      setSelectedDate(date);
      setSelectedDates([date]);
      setModalOpen(true);
    }
  };

  const handleMultiSave = () => {
    if (selectedDates.length > 0) setModalOpen(true);
  };

  // Debug logging
  useEffect(() => {
    console.log("📅 Calendar availability data:", {
      availabilityResponse,
      availabilityData,
      availabilityLength: availabilityData.length,
      isLoading: isAvailabilityLoading,
      error: availabilityError,
    });

    if (availabilityData.length > 0) {
      console.log("📅 First availability data:", availabilityData[0]);
    }
  }, [
    availabilityResponse,
    availabilityData,
    isAvailabilityLoading,
    availabilityError,
  ]);

  return (
    <div className="w-[1151px] h-[959px] bg-white shadow-lg  rounded-2xl flex flex-col">
      <CalendarHeader
        multiSelect={multiSelect}
        setMultiSelect={setMultiSelect}
      />

      <div className="flex-1 bg-[#ffffff] border border-[#FF6B35]/50 rounded-b-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handlePrev}
            className="p-2 hover:bg-[#FF6B35]/10 rounded-full transition"
          >
            <FiChevronLeft className="text-[#FF6B35] w-6 h-6" />
          </button>

          <h2 className="text-[32px] font-medium text-[#FF6B35]">
            {format(currentMonth, "MMMM yyyy")}
          </h2>

          <button
            onClick={handleNext}
            className="p-2 hover:bg-[#FF6B35]/10 rounded-full transition"
          >
            <FiChevronRight className="text-[#FF6B35] w-6 h-6" />
          </button>
        </div>

        <WeekDays startDate={startDate} />

        <DatesGrid
          modalOpen={modalOpen}
          startDate={startDate}
          endDate={endDate}
          monthStart={monthStart}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          multiSelect={multiSelect}
          selectedDates={selectedDates}
          setSelectedDates={setSelectedDates}
          onDateClick={handleDateClick}
          availabilityData={availabilityData}
        />

        {multiSelect && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleMultiSave}
              className="px-6 py-2 bg-[#FF6B35] text-white rounded-lg font-medium shadow hover:opacity-90 transition"
            >
              Save Availability
            </button>
          </div>
        )}
      </div>

      <AvailabilityModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        dates={selectedDates}
        resetDates={resetSelectedDates}
        refreshAvailability={refetchAvailability} // ✅ pass Redux refetch down
      />
    </div>
  );
};

export default Calendar;
