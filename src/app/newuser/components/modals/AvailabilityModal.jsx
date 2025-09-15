/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SelectableButton = ({
  label,
  isSelected,
  onClick,
  className,
  width,
  height,
}) => {
  return (
    <button
      onClick={onClick}
      style={{
        width: width,
        height: height,
      }}
      className={`px-4  py-2 rounded-xl text-[11px] leading-[150%] tracking-[8%] font-semibold border transition-all
        ${
          isSelected
            ? "bg-[#FF6B35] text-white border-[#FF6B35] shadow-md"
            : "bg-[#FF6B35]/10 text-[#FF6B35] border-[#FF6B35]/40 hover:bg-[#FF6B35]/20"
        }
        ${className || ""}
      `}
    >
      {label}
    </button>
  );
};

const EVENT_CATEGORIES = [
  {
    title: "Corporate & Professional Events",
    options: [
      "Conferences & Summits",
      "Seminars",
      "Keynote Speeches",
      "Panel Discussions",
      "Fireside Chats",
      "Town Halls & Open Forums",
      "Leadership Retreats",
      "Networking Events",
      "Trade Shows & Expos",
      "Product Launches",
      "Sales Kick-Offs (SKOs)",
      "Award Ceremonies & Galas",
    ],
  },
  {
    title: "Educational & Training Formats",
    options: [
      "Workshops & Masterclasses",
      "Corporate Training",
      "Guest Lectures",
      "TED-Style Talks",
      "1:1 Session",
      "Mentorship Session",
    ],
  },
  {
    title: "Specialized & Niche Events",
    options: [
      "Pitch Competitions & Startup Showcases",
      "Hackathons & Innovation Jams",
      "Charity & Fundraising Events",
      "Festivals (Music, Arts, Community)",
    ],
  },
];

const MODES = ["Online", "Offline", "Hybrid"];

const TIME_SLOTS = [
  { label: "Morning", time: "09:00 - 12:00" },
  { label: "Afternoon", time: "13:00 - 17:00" },
  { label: "Evening", time: "18:00 - 21:00" },
  { label: "Night", time: "21:00 - 23:00" },
];


/**
 * NOTE: added `refreshAvailability` prop.
 * Calendar.jsx should pass its fetchAvailability function here.
 */
const AvailabilityModal = ({
  isOpen,
  onClose,
  dates,
  resetDates,
  refreshAvailability, // <- new prop
}) => {
  const [formData, setFormData] = useState({
    categories: [],
    modes: [],
    slots: [],
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({ categories: [], modes: [], slots: [] });
    }
  }, [isOpen]);

  const toggleSelection = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const handleSubmit = async () => {
    try {
      // ensure dates are serialized to ISO strings
      const payload = {
        dates: (dates || []).map((d) => new Date(d).toISOString()),
        eventTypes: EVENT_CATEGORIES.map((cat) => ({
          category: cat.title,
          subTypes: formData.categories.filter((c) => cat.options.includes(c)),
        })).filter((et) => et.subTypes.length > 0),
        modes: formData.modes,
        timeSlots: TIME_SLOTS.filter((slot) =>
          formData.slots.includes(slot.label)
        ).map((slot) => ({
          slot: slot.label,
          startTime: slot.time.split(" - ")[0],
          endTime: slot.time.split(" - ")[1],
        })),
      };

      const res = await fetch("http://localhost:3001/api/availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // request headers suggesting not to cache (helps intermediates revalidate)
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
        // ensure browser fetches from network and does not rely on stored cache
        cache: "no-store",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => null);
        throw new Error(
          `Failed to save availability (status ${res.status}) ${
            text ? `: ${text}` : ""
          }`
        );
      }

      // success
      const data = await res.json();
      console.log("Saved successfully:", data);

      // Try to refresh calendar data (cache-busted). Wait for it to finish before closing so UI reflects change.
      if (typeof refreshAvailability === "function") {
        try {
          await refreshAvailability();
        } catch (err) {
          // don't block closing if refresh fails; log for debugging
          console.warn("refreshAvailability failed:", err);
        }
      } else {
        console.warn(
          "refreshAvailability() was not provided. Calendar will not auto-refresh. Provide fetchAvailability from Calendar.jsx."
        );
      }

      // Reset state on success and close
      setFormData({ categories: [], modes: [], slots: [] });
      resetDates();
      onClose();
    } catch (err) {
      console.error("Error saving availability:", err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white w-full max-w-[839px] max-h-[90vh] rounded-2xl shadow-xl overflow-y-auto no-scrollbar"
          >
            {/* Title */}
            <h2 className="text-2xl font-semibold text-[#FF6B35] p-6">
              Set Availability for {dates.length} Date(s)
            </h2>
            <hr className="border-[1px] border-[#FF6B35]/15 " />

            <div className="p-8 flex flex-col space-y-8">
              {/* Section 1 */}
              <div>
                <h3 className="text-lg text-[#000] font-semibold">
                  1. What type of events are you available for?
                </h3>
                {EVENT_CATEGORIES.map((section, idx) => (
                  <div key={idx} className="mb-4 mt-4">
                    <p className="text-[#FF6B35] font-semibold text-[15px] mb-2">
                      {section.title}
                    </p>
                    <div className="my-5 grid grid-cols-3 gap-3 w-[90%]">
                      {section.options.map((opt) => (
                        <SelectableButton
                          key={opt}
                          label={opt}
                          isSelected={formData.categories.includes(opt)}
                          onClick={() => toggleSelection("categories", opt)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Section 2 */}
              <div>
                <h3 className="text-lg text-[#000] font-semibold mb-3">
                  2. Select preferred modes
                </h3>
                <div className="flex flex-wrap gap-4">
                  {MODES.map((mode) => (
                    <SelectableButton
                      key={mode}
                      label={mode}
                      isSelected={formData.modes.includes(mode)}
                      onClick={() => toggleSelection("modes", mode)}
                    />
                  ))}
                </div>
              </div>

              {/* Section 3 */}
              <div className="w-[95%]">
                <h3 className="text-lg text-[#000] font-semibold">
                  3. Choose your time slots (select multiple)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                  {TIME_SLOTS.map((slot) => (
                    <SelectableButton
                      key={slot.label}
                      isSelected={formData.slots.includes(slot.label)}
                      onClick={() => toggleSelection("slots", slot.label)}
                      className="flex flex-col items-center justify-center text-center space-y-1"
                      width="152px"
                      height="88px"
                      label={
                        <div className="flex flex-col items-center gap-1 min-w-[100px] flex-wrap">
                          <span className="text-[16px] font-semibold">
                            {slot.label}
                          </span>
                          <span className="w-full text-[10px] text-black/40">
                            {slot.time}
                          </span>
                        </div>
                      }
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4  p-8 ">
              <button
                onClick={() => {
                  resetDates(); // clear Calendar highlights on cancel too
                  onClose();
                }}
                className="px-6 py-2 border border-[#FF6B35] text-[#FF6B35] text-[16px] rounded-lg font-semibold hover:bg-[#FF6B35]/10 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 rounded-xl font-semibold text-white shadow-md border border-[#FF6B35] bg-gradient-to-tr from-[#FF6B35] to-[#FF8C66] hover:opacity-90 hover:scale-105 transition-all"
              >
                Save Availability
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AvailabilityModal;
