import ProfileButton from "../common/ProfileButton";
import SearchBar from "../common/SearchBar";
import { LuBell } from "react-icons/lu";

const ProfileHeader = () => {
  return (
    <header className="w-full h-20 bg-[#FFFFFF] flex items-center justify-end px-6 text-[#000000] shadow-[0_4px_10px_rgba(0,0,0,0.12)]">
      <div className="flex items-center gap-8">
        <SearchBar  />
        <LuBell className="w-6 h-6 font-[800] cursor-pointer" />
        <ProfileButton />
      </div>
    </header>
  );
};

export default ProfileHeader;
