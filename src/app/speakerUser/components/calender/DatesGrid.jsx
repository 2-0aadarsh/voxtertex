/* eslint-disable react/prop-types */
import { addDays, format, isSameMonth, isSameDay } from "date-fns";

// helper to compare dates only (yyyy-MM-dd)
const formatDateOnly = (date) => format(new Date(date), "yyyy-MM-dd");

const DatesGrid = ({
  startDate,
  endDate,
  monthStart,
  selectedDate,
  multiSelect,
  selectedDates,
  availabilityData,
  onDateClick, // use the handler passed from Calendar
}) => {
  const rows = [];
  let days = [];
  let day = startDate;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const cloneDay = day;
      const inCurrentMonth = isSameMonth(day, monthStart);

      const isSelected =
        (multiSelect && selectedDates.some((d) => isSameDay(d, cloneDay))) ||
        (!multiSelect && selectedDate && isSameDay(cloneDay, selectedDate));

      // Only check availability if the day is in the current month
      const dayAvailability =
        inCurrentMonth &&
        availabilityData.find((a) =>
          a.dates.some((d) => formatDateOnly(d) === formatDateOnly(cloneDay))
        );

      days.push(
        <div
          key={day}
          onClick={() => inCurrentMonth && onDateClick(cloneDay)}
          className={`
            flex flex-col items-start justify-start p-2 rounded-xl cursor-pointer transition
            ${inCurrentMonth ? "border border-[#FF6B35]" : "border-none"}
            ${
              isSelected && inCurrentMonth
                ? "bg-[#FF6B35]/45 border-opacity-15 border-[1px]"
                : ""
            }
            ${
              inCurrentMonth
                ? "text-[#FF6B35] font-semibold text-lg"
                : "text-gray-400"
            }
          `}
          style={{ height: "105px", width: "135px" }}
        >
          {inCurrentMonth ? format(day, "d") : ""}

          {/* Availability slot(s) */}
          {dayAvailability && (
            <div className="mt-2 bg-[#FF6B35]/10 text-[#FF6B35] text-xs px-2 py-1 rounded-md">
              {dayAvailability.timeSlots
                .map((slot) => `${slot.startTime} - ${slot.endTime}`)
                .join(", ")}
            </div>
          )}
        </div>
      );

      day = addDays(day, 1);
    }

    rows.push(
      <div className="grid grid-cols-7 gap-4" key={day}>
        {days}
      </div>
    );
    days = [];
  }

  return <div className="mt-6 space-y-4">{rows}</div>;
};

export default DatesGrid;
