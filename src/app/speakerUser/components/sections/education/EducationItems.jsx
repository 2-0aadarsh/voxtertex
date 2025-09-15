const EducationItem = ({ degree, institution, period }) => {
  return (
    <div className="flex justify-between items-center my-12 pb-4 border-b-2 border-[#FF6B35]/9 ">
      <div>
        <h3 className="text-lg leading-[150.7%] tracking-[8%] font-semibold text-black">
          {degree}
        </h3>
        <p className="text-[#FF6B35] leading-[150.7%] tracking-[8%] text-sm mt-1">
          {institution}
        </p>
      </div>
      <p className="text-[#FF6B35] leading-[150.7%] tracking-[8%] text-sm font-semibold">
        {period}
      </p>
    </div>
  );
};
export default EducationItem