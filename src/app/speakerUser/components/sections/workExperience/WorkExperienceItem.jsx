import { FaRegCalendar } from "react-icons/fa";

const WorkExperienceItem = ({
  title,
  company,
  period,
  employmentType,
  description,
  skills,
}) => {
  return (
    <div className="flex">
      {/* Timeline indicator */}
      <div className="flex flex-col items-center mr-4">
        <div className="w-12 h-12 bg-[#FFE2D7] rounded-full flex items-center justify-center mb-2">
          <div className="w-3 h-3 bg-[#FF6B35] rounded-full"></div>
        </div>
        <div className="w-1 h-16 bg-[#FF6B35]"></div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-[#FFF0EB] border border-[#FF6B35]/26 rounded-xl p-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-semibold text-[#000000] leading-[150%] tracking-[8%]">
              {title}
            </h3>
            <p className="text-[#FF6B35] text-[15px]  leading-[150%] tracking-[8%] mt-1">
              {company}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[#FF6B35] text-sm flex items-center gap-2">
              <FaRegCalendar /> {period}
            </p>
            <span className="bg-[#FF6B35] text-white text-xs px-5 py-2 rounded-md mt-3 inline-block">
              {employmentType}
            </span>
          </div>
        </div>

        <p className="text-[#6B7280] w-[767px]  leading-[150%] tracking-[8%] text-sm mb-4">
          {description}
        </p>

        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <span
              key={index}
              className="bg-[#FF6B35]/12 text-[#FF6B35] text-xs px-5 py-1 rounded-md border border-[#FF6B35]/18"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkExperienceItem