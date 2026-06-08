"use client";

import { useState, useRef } from "react";

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
const PERIODS = ["AM", "PM"];

export default function DarkTimePicker({ onSave, onCancel }: { onSave: (t: string) => void, onCancel: () => void }) {
  const [time, setTime] = useState({ hour: "01", minute: "00", period: "AM" });

  return (
    <div className="w-[300px] rounded-3xl bg-[#2a2a2c] border border-white/10 p-6 shadow-2xl">
      <h2 className="text-center text-lg font-semibold text-white mb-6">Select time</h2>
      
      {/* Scrollable Columns Container */}
      <div className="relative flex h-[180px] w-full items-center justify-center overflow-hidden">
        {/* Selection Highlighter Box */}
        <div className="absolute h-14 w-full rounded-2xl border border-white/20 bg-white/5" />
        
        <ScrollColumn items={HOURS} value={time.hour} onChange={(v) => setTime(s => ({ ...s, hour: v }))} />
        <div className="text-white/30 font-bold px-1">:</div>
        <ScrollColumn items={MINUTES} value={time.minute} onChange={(v) => setTime(s => ({ ...s, minute: v }))} />
        <ScrollColumn items={PERIODS} value={time.period} onChange={(v) => setTime(s => ({ ...s, period: v }))} />
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-end gap-3 mt-8">
        <button 
          onClick={onCancel} 
          className="px-4 py-2 text-sm font-semibold text-white/70 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button 
          onClick={() => onSave(`${time.hour}:${time.minute} ${time.period}`)} 
          className="px-6 py-2 rounded-xl bg-white text-black text-sm font-bold hover:bg-zinc-200 transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  );
}

function ScrollColumn({ items, value, onChange }: { items: string[], value: string, onChange: (v: string) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    // Snap logic: assumes 48px height per item
    const index = Math.round(e.currentTarget.scrollTop / 48);
    if (items[index] !== value) onChange(items[index]);
  };

  return (
    <div 
      ref={scrollRef} 
      onScroll={handleScroll} 
      className="h-full w-16 snap-y snap-mandatory overflow-y-auto py-[64px] scrollbar-hide"
    >
      {items.map((item) => (
        <div key={item} className="flex h-12 snap-center items-center justify-center text-lg font-medium text-white/30">
          <span className={value === item ? "text-white text-xl font-bold" : ""}>
            {item}
          </span>
        </div>
      ))}
    </div>
  );
}