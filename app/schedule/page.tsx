"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ChevronRight } from "lucide-react";
import DarkTimePicker from "@/components/ui/rotatingTimePicker";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const TIME_SLOTS = [
  "10:00 AM",
  "12:00 PM",
  "2:00 PM",
  "4:00 PM",
  "6:00 PM",
  "8:00 PM",
];

function SchedulePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const igId = searchParams.get("igId");

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState(TIME_SLOTS[0]);
  const [showPicker, setShowPicker] = useState(false);

  const handleContinue = () => {
    router.push(`/pricing?igId=${igId}&date=${date}&time=${time}`);
  };

  return (
    <div
      className={`min-h-screen bg-[#1c1c1e] text-white p-6 flex flex-col items-center justify-center ${jakarta.className}`}
    >
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">When should we talk?</h1>
          <p className="text-zinc-400">Pick a time for your 1-hour session</p>
        </div>

        {/* Date Selector */}
        <div className="space-y-4">
          <label className="text-sm text-zinc-500 font-medium">
            Select Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full h-12 rounded-2xl bg-[#2a2a2c] border border-white/10 px-4 text-white focus:outline-none focus:border-white/30"
          />
        </div>

        {/* Time Slots */}
        <div className="space-y-4">
          <label className="text-sm text-zinc-500 font-medium">
            Select Time
          </label>
          <div className="space-y-4 relative">
            <button
              onClick={() => setShowPicker(true)}
              className="w-full h-12 rounded-2xl bg-[#2a2a2c] border border-white/10 px-4 text-left text-white focus:outline-none focus:border-white/30"
            >
              {time}
            </button>
            {showPicker && (
              <div className="ixed inset-0 z-50 flex items-center justify-center">
                <DarkTimePicker
                  onSave={(time) => {
                    setTime(time);
                    setShowPicker(false);
                  }}
                  onCancel={() => setShowPicker(false)}
                />
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleContinue}
          className="w-full h-14 rounded-full bg-white text-black font-bold flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-95"
        >
          Confirm Time <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1c1c1e]" />}>
      <SchedulePage />
    </Suspense>
  );
}
