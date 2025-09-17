"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface EducationData {
  _id: string;
  degree: string;
  institution: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  isCurrentlyStudying: boolean;
  description: string;
  grade: string;
}

interface AddEducationProps {
  isOpen: boolean;
  onClose?: () => void;
  onSave?: (educationData: any) => void;
  isLoading?: boolean;
  editingEducation?: EducationData | null;
  isEditMode?: boolean;
}

export default function AddEducation({ 
  isOpen, 
  onClose, 
  onSave, 
  isLoading = false, 
  editingEducation = null, 
  isEditMode = false 
}: AddEducationProps) {
  const [school, setSchool] = useState("");
  const [degree, setDegree] = useState("");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [startMonth, setStartMonth] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endMonth, setEndMonth] = useState("");
  const [endYear, setEndYear] = useState("");
  const [isCurrentlyStudying, setIsCurrentlyStudying] = useState(false);
  const [grade, setGrade] = useState("");
  const [activities, setActivities] = useState("");
  const [description, setDescription] = useState("");
  
  const [showDegreeDropdown, setShowDegreeDropdown] = useState(false);
  const [showStartMonthDropdown, setShowStartMonthDropdown] = useState(false);
  const [showStartYearDropdown, setShowStartYearDropdown] = useState(false);
  const [showEndMonthDropdown, setShowEndMonthDropdown] = useState(false);
  const [showEndYearDropdown, setShowEndYearDropdown] = useState(false);

  const degreeRef = useRef<HTMLDivElement>(null);
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
      if (degreeRef.current && !degreeRef.current.contains(event.target as Node)) {
        setShowDegreeDropdown(false);
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
    if (isEditMode && editingEducation && isOpen) {
      console.log("📝 Populating form with education data:", editingEducation);
      
      // Parse dates
      const startDate = new Date(editingEducation.startDate);
      const endDate = editingEducation.endDate ? new Date(editingEducation.endDate) : null;
      
      // Set form fields
      setSchool(editingEducation.institution || "");
      setDegree(editingEducation.degree || "");
      setFieldOfStudy(editingEducation.fieldOfStudy || "");
      setStartMonth(startDate.toLocaleString('default', { month: 'long' }));
      setStartYear(startDate.getFullYear().toString());
      setEndMonth(endDate ? endDate.toLocaleString('default', { month: 'long' }) : "");
      setEndYear(endDate ? endDate.getFullYear().toString() : "");
      setIsCurrentlyStudying(editingEducation.isCurrentlyStudying || false);
      setGrade(editingEducation.grade || "");
      setDescription(editingEducation.description || "");
    } else if (!isEditMode && isOpen) {
      // Reset form when opening in add mode
      setSchool("");
      setDegree("");
      setFieldOfStudy("");
      setStartMonth("");
      setStartYear("");
      setEndMonth("");
      setEndYear("");
      setIsCurrentlyStudying(false);
      setGrade("");
      setDescription("");
    }
  }, [isEditMode, editingEducation, isOpen]);

  const degreeTypes = [
    "High School Diploma",
    "Associate Degree",
    "Bachelor's Degree",
    "Master's Degree",
    "Doctoral Degree",
    "Certificate",
    "Professional Degree",
    "Other"
  ];

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  const handleDegreeSelect = (degreeType: string) => {
    setDegree(degreeType);
    setShowDegreeDropdown(false);
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

  const handleSave = () => {
    // Basic validation
    if (!degree || !school || !startMonth || !startYear) {
      alert("Please fill in all required fields");
      return;
    }
    
    // Create education data object
    const educationData = {
      degree,
      institution: school,
      fieldOfStudy,
      startMonth,
      startYear,
      endMonth: isCurrentlyStudying ? "" : endMonth,
      endYear: isCurrentlyStudying ? "" : endYear,
      isCurrentlyStudying,
      grade,
      description,
    };
    
    // Call onSave if provided
    if (onSave) {
      onSave(educationData);
    } else {
      console.log("Saving education...", educationData);
      handleClose();
    }
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
                    {isEditMode ? "Edit Education" : "Add Education"}
                  </h2>
                  <p className="text-gray-500 text-[11px] mt-1">
                    {isEditMode 
                      ? "Update your educational background information" 
                      : "Add educational background to your profile."
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
                {/* School */}
                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-orange-500 z-10">
                    School *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter School name"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-[11px] focus:ring-1 focus:ring-orange-400 outline-none"
                  />
                </div>

                {/* Degree + Field of Study */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-orange-500 z-10">
                      Degree *
                    </label>
                    <div className="relative" ref={degreeRef}>
                      <button
                        type="button"
                        onClick={() => setShowDegreeDropdown(!showDegreeDropdown)}
                        className="w-full rounded-md border border-gray-300 px-4 py-2 text-[11px] focus:ring-1 focus:ring-orange-400 outline-none text-left bg-white flex items-center justify-between"
                      >
                        <span className={degree ? "text-black" : "text-gray-400"}>
                          {degree || "Select Degree type"}
                        </span>
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {showDegreeDropdown && (
                        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 mt-1 max-h-60 overflow-y-auto">
                          {degreeTypes.map((type) => (
                            <div
                              key={type}
                              onClick={() => handleDegreeSelect(type)}
                              className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-orange-50 transition-colors ${
                                degree === type ? "bg-orange-100" : ""
                              }`}
                            >
                              <div className="relative">
                                <input
                                  type="radio"
                                  name="degree"
                                  checked={degree === type}
                                  readOnly
                                  className="sr-only"
                                />
                                <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center transition-colors ${
                                  degree === type 
                                    ? "border-orange-500 bg-orange-500" 
                                    : "border-gray-300 bg-white"
                                }`}>
                                  {degree === type && (
                                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                              </div>
                              <span className={`text-sm ${
                                degree === type ? "text-gray-900 font-medium" : "text-gray-700"
                              }`}>
                                {type}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="relative flex-1">
                    <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-orange-500 z-10">
                      Field of Study *
                    </label>
                    <input
                      type="text"
                      placeholder="eg. Computer Science"
                      value={fieldOfStudy}
                      onChange={(e) => setFieldOfStudy(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-4 py-2 text-[11px] focus:ring-1 focus:ring-orange-400 outline-none"
                    />
                  </div>
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
                          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {showStartMonthDropdown && (
                          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 mt-1 max-h-60 overflow-y-auto">
                            {months.map((month) => (
                              <div
                                key={month}
                                onClick={() => handleStartMonthSelect(month)}
                                className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-orange-50 transition-colors ${
                                  startMonth === month ? "bg-orange-100" : ""
                                }`}
                              >
                                <div className="relative">
                                  <input
                                    type="radio"
                                    name="startMonth"
                                    checked={startMonth === month}
                                    readOnly
                                    className="sr-only"
                                  />
                                  <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    startMonth === month 
                                      ? "border-orange-500 bg-orange-500" 
                                      : "border-gray-300 bg-white"
                                  }`}>
                                    {startMonth === month && (
                                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    )}
                                  </div>
                                </div>
                                <span className={`text-sm ${
                                  startMonth === month ? "text-gray-900 font-medium" : "text-gray-700"
                                }`}>
                                  {month}
                                </span>
                              </div>
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
                          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {showStartYearDropdown && (
                          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 mt-1 max-h-60 overflow-y-auto">
                            {years.map((year) => (
                              <div
                                key={year}
                                onClick={() => handleStartYearSelect(year.toString())}
                                className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-orange-50 transition-colors ${
                                  startYear === year.toString() ? "bg-orange-100" : ""
                                }`}
                              >
                                <div className="relative">
                                  <input
                                    type="radio"
                                    name="startYear"
                                    checked={startYear === year.toString()}
                                    readOnly
                                    className="sr-only"
                                  />
                                  <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    startYear === year.toString()
                                      ? "border-orange-500 bg-orange-500" 
                                      : "border-gray-300 bg-white"
                                  }`}>
                                    {startYear === year.toString() && (
                                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    )}
                                  </div>
                                </div>
                                <span className={`text-sm ${
                                  startYear === year.toString() ? "text-gray-900 font-medium" : "text-gray-700"
                                }`}>
                                  {year}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Currently Studying Checkbox */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="currently-studying"
                    checked={isCurrentlyStudying}
                    onChange={(e) => setIsCurrentlyStudying(e.target.checked)}
                    className="w-3 h-3 text-orange-500 bg-orange-500/10 border-orange-500 rounded focus:ring-orange-400 focus:ring-2"
                  />
                  <label htmlFor="currently-studying" className="text-[11px] text-orange-500">
                    I am currently studying here
                  </label>
                </div>

                {/* End Date */}
                {!isCurrentlyStudying && (
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
                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {showEndMonthDropdown && (
                            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 mt-1 max-h-60 overflow-y-auto">
                              {months.map((month) => (
                                <div
                                  key={month}
                                  onClick={() => handleEndMonthSelect(month)}
                                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-orange-50 transition-colors ${
                                    endMonth === month ? "bg-orange-100" : ""
                                  }`}
                                >
                                  <div className="relative">
                                    <input
                                      type="radio"
                                      name="endMonth"
                                      checked={endMonth === month}
                                      readOnly
                                      className="sr-only"
                                    />
                                    <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center transition-colors ${
                                      endMonth === month 
                                        ? "border-orange-500 bg-orange-500" 
                                        : "border-gray-300 bg-white"
                                    }`}>
                                      {endMonth === month && (
                                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                      )}
                                    </div>
                                  </div>
                                  <span className={`text-sm ${
                                    endMonth === month ? "text-gray-900 font-medium" : "text-gray-700"
                                  }`}>
                                    {month}
                                  </span>
                                </div>
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
                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {showEndYearDropdown && (
                            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 mt-1 max-h-60 overflow-y-auto">
                              {years.map((year) => (
                                <div
                                  key={year}
                                  onClick={() => handleEndYearSelect(year.toString())}
                                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-orange-50 transition-colors ${
                                    endYear === year.toString() ? "bg-orange-100" : ""
                                  }`}
                                >
                                  <div className="relative">
                                    <input
                                      type="radio"
                                      name="endYear"
                                      checked={endYear === year.toString()}
                                      readOnly
                                      className="sr-only"
                                    />
                                    <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center transition-colors ${
                                      endYear === year.toString()
                                        ? "border-orange-500 bg-orange-500" 
                                        : "border-gray-300 bg-white"
                                    }`}>
                                      {endYear === year.toString() && (
                                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                      )}
                                    </div>
                                  </div>
                                  <span className={`text-sm ${
                                    endYear === year.toString() ? "text-gray-900 font-medium" : "text-gray-700"
                                  }`}>
                                    {year}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Grade */}
                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-orange-500 z-10">
                    Grade *
                  </label>
                  <input
                    type="text"
                    placeholder="eg. 3.8 GPA, First class Honours"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-[11px] focus:ring-1 focus:ring-orange-400 outline-none"
                  />
                </div>

                {/* Activities*/}
                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-orange-500 z-10">
                    Activities and societies *
                  </label>
                  <input
                    type="text"
                    placeholder="eg. Student Government, chess club"
                    value={activities}
                    onChange={(e) => setActivities(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-[11px] focus:ring-1 focus:ring-orange-400 outline-none"
                  />
                </div>

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
                    onClick={handleClose}
                    className="px-6 py-2 rounded-md border border-orange-500 text-[11px] text-orange-500 bg-white hover:bg-orange-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
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