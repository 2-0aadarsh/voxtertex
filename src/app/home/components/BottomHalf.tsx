'use client';
import React, { useState, useEffect } from 'react';
import { Play, Facebook, Instagram, Linkedin, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// TypeScript interfaces
interface Testimonial {
  id: number;
  name: string;
  rating: number;
  text: string;
  avatar: string;
  borderColor: string;
}

interface CenterCard {
  name: string;
  image: string;
}

interface StarRatingProps {
  rating: number;
}

interface TestimonialCardProps {
  testimonial: Testimonial;
}

const CombinedTestimonialsFooter = () => {
  // Sample testimonial data with Unsplash images and border colors (only orange and blue)
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Phillip",
      rating: 5,
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer convallis purus vel arcu",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
      borderColor: "border-orange-300"
    },
    {
      id: 2,
      name: "Lindsey",
      rating: 5,
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer convallis purus vel arcu",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
      borderColor: "border-blue-500"
    },
    {
      id: 3,
      name: "Jocelyn",
      rating: 5,
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer convallis purus vel arcu",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
      borderColor: "border-orange-300"
    },
    {
      id: 4,
      name: "Roger",
      rating: 5,
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer convallis purus vel arcu",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
      borderColor: "border-blue-500"
    },
    {
      id: 5,
      name: "Gustavo",
      rating: 5,
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer convallis purus vel arcu",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
      borderColor: "border-orange-300"
    },
    {
      id: 6,
      name: "Anna Martinez",
      rating: 5,
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer convallis purus vel arcu",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face",
      borderColor: "border-blue-500"
    },
    {
      id: 7,
      name: "Kianna",
      rating: 5,
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer convallis purus vel arcu",
      avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop&crop=face",
      borderColor: "border-orange-300"
    },
    {
      id: 8,
      name: "Kaiya",
      rating: 5,
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer convallis purus vel arcu",
      avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=80&h=80&fit=crop&crop=face",
      borderColor: "border-blue-500"
    }
  ];

  // Center card rotating data with names and images
  const centerCardData: CenterCard[] = [
    {
      name: "Dulce",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop"
    },
    {
      name: "Martin",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=400&fit=crop"
    },
    {
      name: "John Doe",
      image: "https://images.unsplash.com/photo-1559223607-a43c990c692c?w=400&h=400&fit=crop"
    }
  ];

  // State for current testimonial index (single index like carousel)
  const [index, setIndex] = useState(0);
  // State for center card rotation
  const [centerImageIndex, setCenterImageIndex] = useState(0);

  // Auto-rotate testimonials every 4 seconds (3s pause + ~1s transition)
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % testimonials.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Auto-rotate center card images every 4 seconds (same as side cards)
  useEffect(() => {
    const interval = setInterval(() => {
      setCenterImageIndex(prev => (prev + 1) % centerCardData.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [centerCardData.length]);

  const StarRating: React.FC<StarRatingProps> = ({ rating }) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <span key={i} className="text-yellow-400 text-sm">
            ★
          </span>
        ))}
      </div>
    );
  };

  const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial }) => {
    return (
      <div className={`bg-white border-1 ${testimonial.borderColor} p-4 h-full shadow-sm`}>
        <div className="flex flex-col items-start mb-3">
          <div className="w-12 h-12 bg-gray-300 overflow-hidden flex-shrink-0 rounded-full mb-3">
            <img 
              src={testimonial.avatar} 
              alt={testimonial.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex items-center gap-2">
            <h4 className="font-serif text-gray-900 text-lg">{testimonial.name}</h4>
            <StarRating rating={testimonial.rating} />
          </div>
        </div>
        <p className="text-gray-600 text-xs leading-relaxed">
          {testimonial.text}
        </p>
      </div>
    );
  };

  return (
    <div>
      {/* Testimonials Section */}
      <section className="py-12 bg-gray-50">      
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#00425D] mb-2">
              What Our Community Says
            </h2>
            <p className="text-gray-600 text-sm">
              Trusted by thousands of speakers and event organizers worldwide
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-11 gap-4 items-start">
              
              {/* Left Column - Spans 3 columns */}
              <div className="col-span-3 space-y-9 h-full">
                {/* Top Left Card - Horizontal Animation */}
                <div className="relative h-48 overflow-hidden bg-white">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`top-left-${index}`}
                      initial={{ x: "100%" }}
                      animate={{ x: 0 }}
                      exit={{ x: "-100%" }}
                      transition={{ duration: 0.8, ease: "linear" }}
                      className="absolute inset-0"
                    >
                      <TestimonialCard testimonial={testimonials[index % testimonials.length]} />
                    </motion.div>
                  </AnimatePresence>
                </div>
                
                {/* Bottom Left Card - Vertical Animation */}
                <div className="relative h-48 overflow-hidden bg-white">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`bottom-left-${index + 2}`}
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "-100%" }}
                      transition={{ duration: 0.8, ease: "linear" }}
                      className="absolute inset-0"
                    >
                      <TestimonialCard testimonial={testimonials[(index + 2) % testimonials.length]} />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Center Video Card - Spans 6 columns */}
              <div className="col-span-5 h-full">
                <div className="bg-white border-1 border-orange-300 p-8 shadow-sm h-[420px]">
                  {/* Name and Stars - with smooth fade transition */}
                  <div className="flex items-start mb-6 h-8 relative">
                    <AnimatePresence>
                      <motion.div
                        key={`name-${centerImageIndex}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="flex items-center gap-2 absolute inset-0"
                      >
                        <h3 className="text-2xl font-serif text-gray-900">
                          {centerCardData[centerImageIndex].name}
                        </h3>
                        <StarRating rating={5} />
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  
                  {/* Image container with crossfade transition */}
                  <div className="relative bg-gray-200 overflow-hidden h-72">
                    <AnimatePresence>
                      <motion.img
                        key={centerImageIndex}
                        src={centerCardData[centerImageIndex].image}
                        alt={`${centerCardData[centerImageIndex].name} - Video testimonial`}
                        className="w-full h-full object-cover absolute inset-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                      />
                    </AnimatePresence>
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <button className="w-16 h-16 rounded-full border-1 border-white bg-white bg-opacity-20 hover:bg-opacity-30 flex items-center justify-center transition-all duration-200 hover:scale-110">
                        <Play className="w-6 h-6 text-[#FF6B35] ml-0.5" fill="currentColor" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Spans 3 columns */}
              <div className="col-span-3 space-y-9 h-full">
                {/* Top Right Card - Horizontal Animation */}
                <div className="relative h-48 overflow-hidden bg-white">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`top-right-${index + 1}`}
                      initial={{ x: "100%" }}
                      animate={{ x: 0 }}
                      exit={{ x: "-100%" }}
                      transition={{ duration: 0.8, ease: "linear" }}
                      className="absolute inset-0"
                    >
                      <TestimonialCard testimonial={testimonials[(index + 1) % testimonials.length]} />
                    </motion.div>
                  </AnimatePresence>
                </div>
                
                {/* Bottom Right Card - Vertical Animation */}
                <div className="relative h-48 overflow-hidden bg-white">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`bottom-right-${index + 3}`}
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "-100%" }}
                      transition={{ duration: 0.8, ease: "linear" }}
                      className="absolute inset-0"
                    >
                      <TestimonialCard testimonial={testimonials[(index + 3) % testimonials.length]} />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
<footer className="bg-[#FF6B35] text-white pl-3">
  {/* Main Footer Content */}
  <div className="container mx-auto px-8 py-12">
    <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-8">
      
      {/* Logo and Description Column */}
      <div className="col-span-1 min-w-[260px] max-w-sm">
        {/* Logo */}
        <div className="w-32 h-20 mb-4">
          <img 
            src="/Voxvertex.png" 
            alt="Voxvertex" 
            className="w-full h-full object-contain"
          />
        </div>
        
        <p className="text-sm leading-relaxed mb-6">
          Empowering connections between guest lecturers and event organizers to create transformative events.
        </p>
        
        {/* Newsletter Subscription */}
        <div className="newsletter mt-17">
          <h3 className="text-base font-medium mb-3 ml-2"> Subscribe Our Newsletter</h3>
          <div className="relative">
            <input
              type="email"
              placeholder=""
              className="w-full px-4 py-2 pr-24 text-black text-sm bg-white rounded-full border-0 outline-none placeholder-gray-500"
            />
            <button className="absolute right-1 top-1 bottom-1 px-4 bg-white text-[#FF6B35] border border-[#FF6B35] text-sm font-medium rounded-full shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all">
  Submit
</button>

          </div>
        </div>
      </div>

      {/* Navigation Column */}
      <div className="col-span-1">
        <h3 className="text-base font-semibold mb-4">NAVIGATION</h3>
        <ul className="space-y-2">
          <li><a href="#" className="text-sm hover:underline">Home</a></li>
          <li><a href="#" className="text-sm hover:underline">Events</a></li>
          <li><a href="#" className="text-sm hover:underline">Blogs</a></li>
          <li><a href="#" className="text-sm hover:underline">Podcast</a></li>
          <li><a href="#" className="text-sm hover:underline">Courses</a></li>
          <li><a href="#" className="text-sm hover:underline">About</a></li>
          <li><a href="#" className="text-sm hover:underline">Contact</a></li>
        </ul>
      </div>

      {/* Support Column */}
      <div className="col-span-1">
        <h3 className="text-base font-semibold mb-4">SUPPORT</h3>
        <ul className="space-y-2">
          <li><a href="#" className="text-sm hover:underline">FAQs</a></li>
          <li><a href="#" className="text-sm hover:underline">Help Center</a></li>
          <li><a href="#" className="text-sm hover:underline">Terms & Conditions</a></li>
          <li><a href="#" className="text-sm hover:underline">Privacy Policy</a></li>
        </ul>
      </div>

      {/* Get in Touch Column */}
      <div className="col-span-1">
        <h3 className="text-base font-semibold mb-4">GET IN TOUCH</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">info@voxvertex.com</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">+91 7356459540</span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="text-sm leading-relaxed">
              C-162, IInd Floor, Swarn Jayanti Puram, Ghaziabad (201013)
            </span>
          </div>
        </div>
      </div>

      {/* Follow Us Column */}
      <div className="col-span-1">
        <h3 className="text-base font-semibold mb-4 ml-2">FOLLOW US</h3>
        <div className="flex gap-3">
          <a href="#" className="hover:opacity-80 transition-opacity">
            <Facebook className="w-5 h-5" />
          </a>
          <a href="#" className="hover:opacity-80 transition-opacity">
            <Instagram className="w-5 h-5" />
          </a>
          <a href="#" className="hover:opacity-80 transition-opacity">
            <Linkedin className="w-5 h-5" />
          </a>
          <a href="#" className="hover:opacity-80 transition-opacity">
            <Twitter className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  </div>

  {/* Bottom Copyright Bar */}
<div className="bg-[#FF6B35] py-3 border-t border-white">
  <div className="container mx-auto px-4">
    <p className="text-center text-sm text-white">
      Copyright © 2024 Voxvertex Solutions All rights reserved
    </p>
  </div>
</div>

</footer>

    </div>
  );
}

export default CombinedTestimonialsFooter;