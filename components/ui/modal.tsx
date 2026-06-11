"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";

export default function ErrorModal({ 
  isOpen, 
  onClose, 
  message 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  message: string 
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Light, airy backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-900/20 backdrop-blur-sm"
          />
          
          {/* Modal Card */}
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative w-full max-w-[320px] rounded-[32px] bg-white p-6 text-center shadow-2xl shadow-black/10"
          >
            {/* Soft Red Icon Container */}
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
              <AlertCircle size={28} strokeWidth={2.5} />
            </div>
            
            <h3 className="text-xl font-bold tracking-tight text-zinc-900">
              Oops!
            </h3>
            
            <p className="mt-2 px-2 text-sm leading-relaxed text-zinc-500">
              {message}
            </p>
            
            {/* Primary Action Button */}
            <button 
              onClick={onClose}
              className="mt-8 flex w-full items-center justify-center rounded-2xl bg-zinc-900 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 active:scale-95"
            >
              Okay, got it
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}