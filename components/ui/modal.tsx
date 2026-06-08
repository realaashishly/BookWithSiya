"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";

export default function ErrorModal({ isOpen, onClose, message }: { isOpen: boolean, onClose: () => void, message: string }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          {/* Modal Card */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-[320px] rounded-3xl bg-[#2a2a2c] border border-white/10 p-6 text-center shadow-2xl"
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-lg font-bold text-white">Oops!</h3>
            <p className="mt-2 text-sm text-zinc-400">{message}</p>
            <button 
              onClick={onClose}
              className="mt-6 w-full h-10 rounded-full bg-white text-black text-sm font-bold transition-transform hover:scale-[1.02] active:scale-95"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}