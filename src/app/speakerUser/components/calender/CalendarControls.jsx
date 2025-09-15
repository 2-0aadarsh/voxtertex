/* eslint-disable react/prop-types */
import { format } from "date-fns";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const CalendarControls = ({ currentMonth, handlePrev, handleNext }) => {
  return (
    <div className="flex items-center justify-between border-4">
      <button onClick={handlePrev}>
        <FiChevronLeft className="text-[#FF6B35] w-6 h-6" />
      </button>
      <h2 className="text-2xl font-medium text-[#FF6B35]">
        {format(currentMonth, "MMM dd, yyyy")}
      </h2>
      <button onClick={handleNext}>
        <FiChevronRight className="text-[#FF6B35] w-6 h-6" />
      </button>
    </div>
  );
};

export default CalendarControls;
