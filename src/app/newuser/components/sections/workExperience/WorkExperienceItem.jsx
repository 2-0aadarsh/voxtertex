import { useState } from "react";
import { motion } from "framer-motion";
import { FaRegCalendar } from "react-icons/fa";
import { FiMoreVertical, FiTrash2, FiEdit } from "react-icons/fi";
import { toast } from "react-hot-toast";

const WorkExperienceItem = ({
  id,
  title,
  company,
  period,
  employmentType,
  description,
  skills,
  onEdit,
  onDelete,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleMenu = () => {
    console.log("🖱️ Work experience menu clicked! Current state:", isMenuOpen);
    setIsMenuOpen(!isMenuOpen);
    console.log("✅ Menu state changed to:", !isMenuOpen);
  };

  const handleEdit = () => {
    console.log("✏️ Edit work experience clicked:", id);
    setIsMenuOpen(false);
    if (onEdit) {
      onEdit(id);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;

    console.log("🗑️ Delete work experience clicked:", id);
    setIsMenuOpen(false);

    if (onDelete) {
      try {
        setIsDeleting(true);
        await onDelete(id);
        toast.success("Work experience deleted successfully");
      } catch (error) {
        console.error("Error deleting work experience:", error);
        toast.error("Failed to delete work experience");
      } finally {
        setIsDeleting(false);
      }
    }
  };
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
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[#000000] leading-[150%] tracking-[8%]">
              {title}
            </h3>
            <p className="text-[#FF6B35] text-[15px]  leading-[150%] tracking-[8%] mt-1">
              {company}
            </p>
            <p className="text-[#6B7280] leading-[150%] tracking-[8%] text-sm mt-2">
              {description}
            </p>
          </div>
          <div className="text-right ml-4">
            {/* Three dots menu */}
            <div className="relative mb-2">
              <motion.button
                onClick={toggleMenu}
                whileHover={{ scale: 1.2, rotate: 10, color: "#FF6B35" }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                className="text-[rgba(107,114,128,0.65)] p-1 rounded-full hover:bg-gray-100"
              >
                <FiMoreVertical size={18} />
              </motion.button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-1 w-36 rounded-md shadow-xl bg-white z-10">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-orange-600 hover:bg-orange-50"
                      role="menuitem"
                      onClick={handleEdit}
                    >
                      <FiEdit className="mr-2" /> Edit
                    </button>
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-orange-600 hover:bg-orange-50"
                      role="menuitem"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      <FiTrash2 className="mr-2" />
                      {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <p className="text-[#FF6B35] text-sm flex items-center gap-2">
              <FaRegCalendar /> {period}
            </p>
            <span className="bg-[#FF6B35] text-white text-xs px-5 py-2 rounded-md mt-3 inline-block">
              {employmentType}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 ">
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

export default WorkExperienceItem;
