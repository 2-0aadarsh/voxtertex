"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface WorkData {
  jobTitle: string;
  company: string;
  employmentType: string;
  location: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  isCurrentlyWorking: boolean;
  description: string;
}

interface WorkExperienceData {
  _id: string;
  title: string;
  company: string;
  employmentType: string;
  location: string;
  startDate: string;
  endDate?: string;
  isCurrentlyWorking: boolean;
  description: string;
}

interface AddWorkExperienceProps {
  isOpen: boolean;
  onClose?: () => void;
  onSave?: (workData: WorkData) => void;
  isLoading?: boolean;
  editingWorkExperience?: WorkExperienceData | null;
  isEditMode?: boolean;
}

export default function AddWorkExperience({ 
  isOpen, 
  onClose, 
  onSave, 
  isLoading = false, 
  editingWorkExperience = null, 
  isEditMode = false 
}: AddWorkExperienceProps) {
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [location, setLocation] = useState("");
  const [startMonth, setStartMonth] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endMonth, setEndMonth] = useState("");
  const [endYear, setEndYear] = useState("");
  const [isCurrentlyWorking, setIsCurrentlyWorking] = useState(false);
  const [description, setDescription] = useState("");
  const [showEmploymentDropdown, setShowEmploymentDropdown] = useState(false);
  const [showStartMonthDropdown, setShowStartMonthDropdown] = useState(false);
  const [showStartYearDropdown, setShowStartYearDropdown] = useState(false);
  const [showEndMonthDropdown, setShowEndMonthDropdown] = useState(false);
  const [showEndYearDropdown, setShowEndYearDropdown] = useState(false);

  const employmentRef = useRef<HTMLDivElement>(null);
  const startMonthRef = useRef<HTMLDivElement>(null);
  const startYearRef = useRef<HTMLDivElement>(null);
  const endMonthRef = useRef<HTMLDivElement>(null);
  const endYearRef = useRef<HTMLDivElement>(null);

  // Handle the case where onClose might be undefined
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (employmentRef.current && !employmentRef.current.contains(event.target as Node)) {
        setShowEmploymentDropdown(false);
      }
      if (startMonthRef.current && !startMonthRef.current.contains(event.target as Node)) {
        setShowStartMonthDropdown(false);
      }
      if (startYearRef.current && !startYearRef.current.contains(event.target as Node)) {
        setShowStartYearDropdown(false);
      }
      if (endMonthRef.current && !endMonthRef.current.contains(event.target as Node)) {
        setShowEndMonthDropdown(false);
      }
      if (endYearRef.current && !endYearRef.current.contains(event.target as Node)) {
        setShowEndYearDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Body scroll lock effect
  useEffect(() => {
    if (isOpen) {
      // Simple and effective scroll prevention
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Populate form fields when editing
  useEffect(() => {
    if (isEditMode && editingWorkExperience && isOpen) {
      console.log("📝 Populating form with work experience data:", editingWorkExperience);
      
      // Parse dates
      const startDate = new Date(editingWorkExperience.startDate);
      const endDate = editingWorkExperience.endDate ? new Date(editingWorkExperience.endDate) : null;
      
      // Set form fields
      setJobTitle(editingWorkExperience.title || "");
      setCompany(editingWorkExperience.company || "");
      setEmploymentType(editingWorkExperience.employmentType || "");
      setLocation(editingWorkExperience.location || "");
      setStartMonth(startDate.toLocaleString('default', { month: 'long' }));
      setStartYear(startDate.getFullYear().toString());
      setEndMonth(endDate ? endDate.toLocaleString('default', { month: 'long' }) : "");
      setEndYear(endDate ? endDate.getFullYear().toString() : "");
      setIsCurrentlyWorking(editingWorkExperience.isCurrentlyWorking || false);
      setDescription(editingWorkExperience.description || "");
    } else if (!isEditMode && isOpen) {
      // Reset form when opening in add mode
      resetForm();
    }
  }, [isEditMode, editingWorkExperience, isOpen]);

  const employmentTypes = [
    "Full-Time",
    "Part-Time",
    "Contract",
    "Freelance",
    "Internship",
    "Temporary"
  ];

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  const handleEmploymentSelect = (type: string) => {
    setEmploymentType(type);
    setShowEmploymentDropdown(false);
  };

  const handleStartMonthSelect = (month: string) => {
    setStartMonth(month);
    setShowStartMonthDropdown(false);
  };

  const handleStartYearSelect = (year: string) => {
    setStartYear(year);
    setShowStartYearDropdown(false);
  };

  const handleEndMonthSelect = (month: string) => {
    setEndMonth(month);
    setShowEndMonthDropdown(false);
  };

  const handleEndYearSelect = (year: string) => {
    setEndYear(year);
    setShowEndYearDropdown(false);
  };

  const handleSubmit = () => {
    // Basic validation
    if (!jobTitle || !company || !employmentType || !location || !startMonth || !startYear || !description) {
      alert("Please fill in all required fields");
      return;
    }

    if (!isCurrentlyWorking && (!endMonth || !endYear)) {
      alert("Please fill in end date or mark as currently working");
      return;
    }

    // Pass the data back to parent
    if (onSave) {
      onSave({
        jobTitle,
        company,
        employmentType,
        location,
        startMonth,
        startYear,
        endMonth,
        endYear,
        isCurrentlyWorking,
        description
      });
    }

    // Reset form
    resetForm();
  };

  const resetForm = () => {
    setJobTitle("");
    setCompany("");
    setEmploymentType("");
    setLocation("");
    setStartMonth("");
    setStartYear("");
    setEndMonth("");
    setEndYear("");
    setIsCurrentlyWorking(false);
    setDescription("");
  };

  const handleCancel = () => {
    resetForm();
    handleClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-transparent z-40"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6 max-h-[95vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-orange-500">
                    {isEditMode ? "Edit Work Experience" : "Add Work Experience"}
                  </h2>
                  <p className="text-gray-500 text-[11px] mt-1">
                    {isEditMode 
                      ? "Update your work experience information" 
                      : "Add a new work experience to your profile"
                    }
                  </p>
                  <p className="text-[11px] text-gray-400 mt-2">* Indicates required</p>
                </div>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-light"
                >
                  ×
                </button>
              </div>

              {/* Form */}
              <div className="mt-4 space-y-6">
                {/* How would you like to add your work experience */}
                <div>
                  <h3 className="text-[11px] font-medium text-orange-500 mb-4">
                    How would you like to add your work experience?
                  </h3>
                </div>

                {/* Job Title */}
                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-orange-500 z-10">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    placeholder="eg. Senior Software Engineer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-[11px] focus:ring-1 focus:ring-orange-400 outline-none"
                  />
                </div>

                {/* Company + Employment Type */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-orange-500 z-10">
                      Company *
                    </label>
                    <input
                      type="text"
                      placeholder="eg. Google"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-4 py-2 text-[11px] focus:ring-1 focus:ring-orange-400 outline-none"
                    />
                  </div>
                  <div className="relative flex-1">
                    <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-orange-500 z-10">
                      Employment Type *
                    </label>
                    <div className="relative" ref={employmentRef}>
                      <button
                        type="button"
                        onClick={() => setShowEmploymentDropdown(!showEmploymentDropdown)}
                        className="w-full rounded-md border border-gray-300 px-4 py-2 text-[11px] focus:ring-1 focus:ring-orange-400 outline-none text-left bg-white flex items-center justify-between"
                      >
                        <span className={employmentType ? "text-black" : "text-gray-400"}>
                          {employmentType || "Select employment type"}
                        </span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {showEmploymentDropdown && (
                        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 mt-1 max-h-40 overflow-y-auto">
                          {employmentTypes.map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => handleEmploymentSelect(type)}
                              className={`w-full px-4 py-2 text-[11px] text-left hover:bg-orange-50 ${
                                employmentType === type ? "bg-orange-100 text-orange-600" : "text-gray-700"
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-orange-500 z-10">
                    Location *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-[11px] focus:ring-1 focus:ring-orange-400 outline-none"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-[11px] font-medium text-orange-500 mb-2">
                    Start Date *
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-orange-500 z-10">
                        Month *
                      </label>
                      <div className="relative" ref={startMonthRef}>
                        <button
                          type="button"
                          onClick={() => setShowStartMonthDropdown(!showStartMonthDropdown)}
                          className="w-full rounded-md border border-gray-300 px-4 py-2 text-[11px] focus:ring-1 focus:ring-orange-400 outline-none text-left bg-white flex items-center justify-between"
                        >
                          <span className={startMonth ? "text-black" : "text-gray-400"}>
                            {startMonth || "Select month"}
                          </span>
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {showStartMonthDropdown && (
                          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 mt-1 max-h-40 overflow-y-auto">
                            {months.map((month) => (
                              <button
                                key={month}
                                type="button"
                                onClick={() => handleStartMonthSelect(month)}
                                className={`w-full px-4 py-2 text-[11px] text-left hover:bg-orange-50 ${
                                  startMonth === month ? "bg-orange-100 text-orange-600" : "text-gray-700"
                                }`}
                              >
                                {month}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="relative flex-1">
                      <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-orange-500 z-10">
                        Year *
                      </label>
                      <div className="relative" ref={startYearRef}>
                        <button
                          type="button"
                          onClick={() => setShowStartYearDropdown(!showStartYearDropdown)}
                          className="w-full rounded-md border border-gray-300 px-4 py-2 text-[11px] focus:ring-1 focus:ring-orange-400 outline-none text-left bg-white flex items-center justify-between"
                        >
                          <span className={startYear ? "text-black" : "text-gray-400"}>
                            {startYear || "Select year"}
                          </span>
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {showStartYearDropdown && (
                          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 mt-1 max-h-40 overflow-y-auto">
                            {years.map((year) => (
                              <button
                                key={year}
                                type="button"
                                onClick={() => handleStartYearSelect(year.toString())}
                                className={`w-full px-4 py-2 text-[11px] text-left hover:bg-orange-50 ${
                                  startYear === year.toString() ? "bg-orange-100 text-orange-600" : "text-gray-700"
                                }`}
                              >
                                {year}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/*Checkbox */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="currently-working"
                    checked={isCurrentlyWorking}
                    onChange={(e) => setIsCurrentlyWorking(e.target.checked)}
                    className="w-4 h-4 text-orange-500 bg-gray-100 border-gray-300 rounded focus:ring-orange-400 focus:ring-2"
                  />
                  <label htmlFor="currently-working" className="text-[11px] text-orange-500">
                    I am currently working in this role
                  </label>
                </div>

                {/* End Date */}
                {!isCurrentlyWorking && (
                  <div>
                    <label className="block text-[11px] font-medium text-orange-500 mb-2">
                      End Date *
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-orange-500 z-10">
                          Month *
                        </label>
                        <div className="relative" ref={endMonthRef}>
                          <button
                            type="button"
                            onClick={() => setShowEndMonthDropdown(!showEndMonthDropdown)}
                            className="w-full rounded-md border border-gray-300 px-4 py-2 text-[11px] focus:ring-1 focus:ring-orange-400 outline-none text-left bg-white flex items-center justify-between"
                          >
                            <span className={endMonth ? "text-black" : "text-gray-400"}>
                              {endMonth || "Select month"}
                            </span>
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {showEndMonthDropdown && (
                            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 mt-1 max-h-40 overflow-y-auto">
                              {months.map((month) => (
                                <button
                                  key={month}
                                  type="button"
                                  onClick={() => handleEndMonthSelect(month)}
                                  className={`w-full px-4 py-2 text-[11px] text-left hover:bg-orange-50 ${
                                    endMonth === month ? "bg-orange-100 text-orange-600" : "text-gray-700"
                                  }`}
                                >
                                  {month}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="relative flex-1">
                        <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-orange-500 z-10">
                          Year *
                        </label>
                        <div className="relative" ref={endYearRef}>
                          <button
                            type="button"
                            onClick={() => setShowEndYearDropdown(!showEndYearDropdown)}
                            className="w-full rounded-md border border-gray-300 px-4 py-2 text-[11px] focus:ring-1 focus:ring-orange-400 outline-none text-left bg-white flex items-center justify-between"
                          >
                            <span className={endYear ? "text-black" : "text-gray-400"}>
                              {endYear || "Select year"}
                            </span>
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {showEndYearDropdown && (
                            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 mt-1 max-h-40 overflow-y-auto">
                              {years.map((year) => (
                                <button
                                  key={year}
                                  type="button"
                                  onClick={() => handleEndYearSelect(year.toString())}
                                  className={`w-full px-4 py-2 text-[11px] text-left hover:bg-orange-50 ${
                                    endYear === year.toString() ? "bg-orange-100 text-orange-600" : "text-gray-700"
                                  }`}
                                >
                                  {year}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-orange-500 z-10">
                    Description *
                  </label>
                  <textarea
                    placeholder="Describe your responsibilities and achievements..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-[11px] focus:ring-1 focus:ring-orange-400 outline-none min-h-[80px] resize-none"
                  ></textarea>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isLoading}
                    className={`px-6 py-2 rounded-md border border-orange-500 text-[11px] text-orange-500 bg-white hover:bg-orange-50 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className={`px-6 py-2 rounded-md text-[11px] text-white bg-orange-500 hover:bg-orange-600 hover:scale-105 transition-all duration-200 flex items-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    style={{
                      backgroundImage: isLoading ? "none" : "url('/orange_button.png')",
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}
                  >
                    {isLoading && (
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {isLoading ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update' : 'Save')}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}