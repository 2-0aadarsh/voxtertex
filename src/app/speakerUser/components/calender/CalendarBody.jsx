/* eslint-disable react/prop-types */
import CalendarControls from "./CalendarControls";
import WeekDays from "./WeekDays";
import DatesGrid from "./DatesGrid";

const CalendarBody = ({
  currentMonth,
  selectedDate,
  setSelectedDate,
  monthStart,
  startDate,
  endDate,
  handlePrev,
  handleNext,
}) => {
  return (
    <div className="flex flex-col gap-3 bg-[#FFF9F7] border border-[#FF6B35]/50 rounded-2xl p-6">
      <CalendarControls
        currentMonth={currentMonth}
        handlePrev={handlePrev}
        handleNext={handleNext}
      />
      <WeekDays startDate={startDate} />
      <DatesGrid
        startDate={startDate}
        endDate={endDate}
        monthStart={monthStart}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />
    </div>
  );
};

export default CalendarBody;
