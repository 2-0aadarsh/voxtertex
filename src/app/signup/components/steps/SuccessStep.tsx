'use client';

import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

export default function SuccessStep() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-8 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
      >
        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
      </motion.div>
      
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Account Created Successfully!</h2>
      <p className="text-gray-600 mb-6">You can now sign in with your credentials</p>
      
      <button 
        onClick={() => window.location.href = '/signup/login'}
        className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors"
      >
        Sign In
      </button>
    </motion.div>
  );
}