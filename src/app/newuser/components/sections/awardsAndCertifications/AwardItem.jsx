import { useState } from "react";
import { motion } from "framer-motion";
import { FiMoreVertical, FiTrash2, FiEdit } from "react-icons/fi";
import { toast } from "react-hot-toast";

const AwardItem = ({ id, title, description, period, onEdit, onDelete }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleMenu = () => {
    console.log("🖱️ Award menu clicked! Current state:", isMenuOpen);
    setIsMenuOpen(!isMenuOpen);
    console.log("✅ Menu state changed to:", !isMenuOpen);
  };

  const handleEdit = () => {
    console.log("✏️ Edit award clicked:", id);
    setIsMenuOpen(false);
    if (onEdit) {
      onEdit(id);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;

    console.log("🗑️ Delete award clicked:", id);
    setIsMenuOpen(false);

    if (onDelete) {
      try {
        setIsDeleting(true);
        await onDelete(id);
        toast.success("Award deleted successfully");
      } catch (error) {
        console.error("Error deleting award:", error);
        toast.error("Failed to delete award");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="flex justify-between items-center py-4 border-b border-orange-100 last:border-b-0">
      <div className="flex-1">
        <h3 className="text-lg leading-[150.7%] tracking-[8%] font-semibold text-black">
          {title}
        </h3>
        <p className="text-[#FF6B35] leading-[150.7%] tracking-[8%] text-sm mt-1">
          {description}
        </p>
      </div>
      <div className="flex flex-col items-end">
        {/* Three dots menu */}
        <div className="relative">
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
        <p className="text-[#FF6B35] text-sm leading-[150.7%] tracking-[8%] font-semibold">
          {period}
        </p>
      </div>
    </div>
  );
};
export default AwardItem;
