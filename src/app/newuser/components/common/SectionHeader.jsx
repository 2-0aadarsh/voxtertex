"use client";

import { motion } from "framer-motion";
import { RiEditBoxFill } from "react-icons/ri";

const SectionHeader = ({ id, icon, title, subTitle = "", onAddClick }) => {
  return (
    <header
      id={id}
      className="w-full border-b-2 border-[#FF6B35]/17 flex items-center justify-between pt-4 pb-8 "
    >
      <div className="flex items-center gap-6">
        {icon && (
          <div className="flex items-center justify-center text-[#FF6B35] bg-[#FFE2D7] w-[48px] h-[43px] rounded-[11.31px] text-[20px]">
            {icon}
          </div>
        )}
        <div className="flex flex-col items-start justify-center ">
          <h3 className="font-bold text-[24px] leading-[150%] tracking-[8%]">
            {title}
          </h3>
          {subTitle && (
            <h5 className="text-[#6B7280] text-[13px] leading-[150%] tracking-[8%] ">
              {subTitle}
            </h5>
          )}
        </div>

        <button className="text-[#FF6B35] text-[24px]">
          <RiEditBoxFill />
        </button>
      </div>

      {/* Animated Add Button */}
      <motion.button
        onClick={onAddClick}
        whileHover={{
          scale: 1.05,
          // backgroundColor: "#FF6B35",
          // color: "#fff",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.25)",
        }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="border-[#FF6B35] border-[1px] shadow-md text-[#FF6B35] 
                   w-[101px] h-[40px] text-center rounded-2xl font-semibold 
                   bg-white flex items-center justify-center gap-3"
      >
        <span>+</span>
        <span>Add</span>
      </motion.button>
      {/* <motion.button
        whileHover={{
          scale: 1.05,
          backgroundColor: "#FF6B35",
          color: "#fff",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.25)",
        }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="border-[#FF6B35] border-[1px] shadow-md text-[#FF6B35] 
                   w-[101px] h-[40px] text-center rounded-2xl font-semibold 
                   bg-white"
      >
        + Add
      </motion.button> */}
    </header>
  );
};

export default SectionHeader;
