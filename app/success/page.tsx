"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Plus_Jakarta_Sans } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "600", "800"] });

export default function SuccessPage() {
  return (
    <div className={`flex min-h-screen flex-col items-center justify-center bg-[#1c1c1e] p-6 text-center ${jakarta.className}`}>
      
      {/* 1. Animated Success Icon with Pulsing Glow */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative mx-auto mb-8 flex h-24 w-24 items-center justify-center"
      >
        {/* Pulsing glow behind the icon */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full bg-white/10 blur-xl"
        />
        
        {/* The Icon Container */}
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.2)]">
          <motion.div
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Check size={48} strokeWidth={3} />
          </motion.div>
        </div>
      </motion.div>

      {/* 2. Text Animation (Staggered) */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="space-y-4"
      >
        <h1 className="text-3xl font-extrabold text-white">All set!</h1>
        <p className="max-w-[280px] text-zinc-400">
          Your access is now active. I&apos;m waiting for you in your DMs.
        </p>
      </motion.div>

      {/* 3. Action Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="mt-12 w-full max-w-[240px]"
      >
        <button 
          onClick={() => window.location.href = "https://instagram.com"} 
          className="h-14 w-full rounded-full bg-white text-[15px] font-bold text-black transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Return to DM
        </button>
      </motion.div>

    </div>
  );
}