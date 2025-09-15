const InfoCard = ({ icon: Icon, value, label }) => {
  return (
    <div className="flex flex-col items-center justify-center bg-[#FFF1EB] border border-[#FFD8C7] rounded-xl p-5 shadow-sm">
      <div className="bg-[#FFE2D8] w-[47px] h-[47px] flex items-center justify-center rounded-full p-3">
        <Icon className="text-[#FF6B35] text-xl stroke-[1]" />
      </div>
      <span className="text-[#FF6B35] text-[40px] font-bold">{value}</span>
      <span className="text-black/50 mt-1 text-sm">{label}</span>
    </div>
  );
};

export default InfoCard;
