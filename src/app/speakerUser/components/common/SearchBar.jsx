import { CiSearch } from "react-icons/ci";

export default function SearchBar() {
  return (
    <div className="w-[242px] h-[32px] flex items-center gap-2 rounded-4xl border border-[#FF6B35]/20 bg-[#FF6B35]/9 px-3 py-3">
      <CiSearch className="text-[#FF6B35] w-[16px] h-[16px]" />

      <input
        type="text"
        placeholder="Search..."
        className="w-full bg-transparent text-sm focus:outline-none text-[#FF6B35] placeholder:text-[#FF6B35]/70"
      />
    </div>
  );
}
