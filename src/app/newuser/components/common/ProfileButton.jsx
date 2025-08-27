import { IoIosArrowDown } from "react-icons/io";

const ProfileButton = () => {
  return (
    <button className="w-40 h-10 cursor-pointer flex items-center justify-between">
      <img src="./profile.png" alt="profile" />
      <h2>John Doe</h2>
      <IoIosArrowDown className="cursor-pointer" />
    </button>
  );
};

export default ProfileButton;
