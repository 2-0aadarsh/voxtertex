const ContactCard = ({ icon: Icon, label, value }) => {
  return (
    <div className="flex items-center gap-3 bg-[#FFF1EB] border border-[#FFD8C7] rounded-xl p-4 shadow-sm">
      <div className="bg-[#FFE2D8] w-[47px] h-[47px] flex items-center justify-center rounded-full p-3">
        <Icon className="text-[#FF6B35] text-2xl" />
      </div>
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-black font-medium">{value}</p>
      </div>
    </div>
  );
};

export default ContactCard;
