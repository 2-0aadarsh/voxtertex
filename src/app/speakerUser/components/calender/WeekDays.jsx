/* eslint-disable react/prop-types */
import { addDays, format } from "date-fns";

const WeekDays = ({ startDate }) => {
  const days = [];
  for (let i = 0; i < 7; i++) {
    days.push(
      <div key={i} className="text-center text-[#878787] font-medium text-lg ">
        {format(addDays(startDate, i), "EEE")}
      </div>
    );
  }

  return <div className="grid grid-cols-7 mt-6 ">{days}</div>;
};

export default WeekDays;
