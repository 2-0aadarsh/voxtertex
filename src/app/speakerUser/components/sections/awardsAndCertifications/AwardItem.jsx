const AwardItem = ({ title, description, period }) => {
  return (
    <div className="flex justify-between items-center py-4 border-b border-orange-100 last:border-b-0">
      <div>
        <h3 className="text-lg  leading-[150.7%] tracking-[8%] font-semibold text-black">
          {title}
        </h3>
        <p className="text-[#FF6B35] leading-[150.7%] tracking-[8%] text-sm mt-1">
          {description}
        </p>
      </div>
      <p className="text-[#FF6B35] text-sm leading-[150.7%] tracking-[8%] font-semibold">
        {period}
      </p>
    </div>
  );
};
export default AwardItem