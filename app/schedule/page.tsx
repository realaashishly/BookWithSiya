"use client";

import { useState, Suspense, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Zap, RefreshCw, Loader2 } from "lucide-react";
import { load } from "@cashfreepayments/cashfree-js";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

interface Slot {
  time: string;
  availableSlotsLeft: number;
  isAvailable: boolean;
}

interface AvailableSlotsResponse {
  success: boolean;
  earliestAvailable: {
    id: string;
    date: string;
    time: string;
    isAvailable: boolean;
  };
  scheduleByDate: Record<string, Slot[]>;
}

function getDateTabs() {
  const today = new Date();
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return Array.from({ length: 3 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const month = monthNames[d.getMonth()];
    const dayNum = d.getDate();

    let label = `${dayNames[d.getDay()]}, ${month} ${dayNum}`;
    if (i === 0) label = `Today, ${month} ${dayNum}`;
    else if (i === 1) label = `Tomorrow, ${month} ${dayNum}`;

    return { label, date: dateStr };
  });
}

function SchedulePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const igId = searchParams.get("igId");

  const [data, setData] = useState<AvailableSlotsResponse | null>(null);
  const [state, setState] = useState<"loading" | "success" | "error">("loading");
  const [activeDate, setActiveDate] = useState("");
  const [retry, setRetry] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingSlot, setProcessingSlot] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const dateTabs = useMemo(() => getDateTabs(), []);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    if (igId) params.set("igId", igId);

    const load = async () => {
      try {
        const res = await fetch(`/api/bookings/available-slots?${params}`, { cache: "no-store" });
        const json: AvailableSlotsResponse = await res.json();
        if (!json.success || cancelled) return;
        setData(json);
        setState("success");
        const keys = Object.keys(json.scheduleByDate);
        setActiveDate(json.earliestAvailable?.date ?? keys[0] ?? "");
      } catch {
        if (!cancelled) setState("error");
      }
    };

    load();
    return () => { cancelled = true; };
  }, [igId, retry]);

  const handleSlotClick = async (date: string, time: string) => {
    if (!igId || isProcessing) return;
    setIsProcessing(true);
    setProcessingSlot(time);
    setErrorMsg(null);

    try {
      const cashfree = await load({ mode: "sandbox" });
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payments/create-order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            igAccountId: igId,
            planId: "1-day",
            scheduledDate: date,
            scheduledTime: time,
          }),
        },
      );
      const resData = await response.json();
      if (!resData.payment_session_id) throw new Error("No session ID returned");

      const result = await cashfree.checkout({
        paymentSessionId: resData.payment_session_id,
        redirectTarget: "_modal",
      });

      if (result.error) {
        setErrorMsg(result.error.message || "Payment was canceled.");
      } else if (result.paymentDetails) {
        router.push(`/success?igId=${igId}`);
      }
    } catch (err) {
      setErrorMsg(
        err instanceof Error && err.message === "Payment was canceled."
          ? err.message
          : "Could not connect to payment gateway.",
      );
    } finally {
      setIsProcessing(false);
      setProcessingSlot(null);
    }
  };

  const currentSlots = data?.scheduleByDate[activeDate] ?? [];
  const earliest = data?.earliestAvailable;

  return (
    <div className={`flex min-h-dvh flex-col bg-[#1c1c1e] text-white ${jakarta.className}`}>
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 pt-10 pb-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Live Now
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">Book a 15-Minute Chat</h1>
          <p className="mt-1 text-zinc-400">Connect via Instagram DMs for just ₹6</p>
        </div>

        {/* Loading */}
        {state === "loading" && (
          <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4" data-testid="skeleton-loader">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-[#2a2a2c] p-5">
                <div className="mx-auto mb-2 h-4 w-16 rounded bg-zinc-700" />
                <div className="mx-auto h-3 w-20 rounded bg-zinc-700" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {state === "error" && (
          <div className="mt-20 flex flex-col items-center gap-4 text-center">
            <p className="text-zinc-400">Unable to load current slots. Please refresh to try again.</p>
            <button
              onClick={() => { setState("loading"); setRetry((c) => c + 1); }}
              className="flex items-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-white/20"
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        )}

        {/* Payment Error Toast */}
        {errorMsg && (
          <div className="fixed inset-x-0 bottom-8 z-50 mx-auto flex w-full max-w-sm items-center justify-center px-6">
            <div className="rounded-2xl bg-red-500/10 px-5 py-3 text-sm text-red-400 shadow-lg backdrop-blur-md">
              {errorMsg}
            </div>
          </div>
        )}

        {/* Ready */}
        {state === "success" && data && (
          <>
            {/* Hero Banner */}
            {earliest && (
              <button
                onClick={() => handleSlotClick(earliest.date, earliest.time)}
                disabled={isProcessing}
                className="mt-8 w-full rounded-2xl bg-gradient-to-r from-emerald-600/30 to-emerald-500/10 p-4 text-left transition-all hover:from-emerald-600/40 hover:to-emerald-500/20 disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20">
                    <Zap size={20} className="text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">
                      Next Live Session Available{" "}
                      <span className="text-emerald-400">
                        {earliest.date === dateTabs[0]?.date ? "Today" : "Tomorrow"} at {earliest.time}
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">Secure your spot now →</p>
                  </div>
                </div>
              </button>
            )}

            {/* Date Tabs */}
            <div className="mt-6 flex gap-2">
              {dateTabs.map((tab) => {
                const active = activeDate === tab.date;
                const hasSlots = (data.scheduleByDate[tab.date] ?? []).some((s) => s.isAvailable);
                return (
                  <button
                    key={tab.date}
                    onClick={() => setActiveDate(tab.date)}
                    disabled={!hasSlots || isProcessing}
                    className={`flex-1 rounded-xl px-3 py-2.5 text-center text-sm font-medium transition-all
                      ${active
                        ? "bg-white text-black shadow-sm"
                        : hasSlots
                          ? "bg-[#2a2a2c] text-zinc-300 hover:bg-[#333335]"
                          : "cursor-not-allowed bg-[#2a2a2c] text-zinc-600 opacity-50"
                      }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Slot Grid */}
            <div className="mt-5">
              {currentSlots.length === 0 && (
                <p className="py-16 text-center text-sm text-zinc-500">No slots available this day</p>
              )}

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4" data-testid="slot-grid">
                {currentSlots.map((slot) => {
                  const isFull = !slot.isAvailable;
                  const isCurrentlyProcessing = processingSlot === slot.time;
                  const disabled = isProcessing || isFull;

                  return (
                    <button
                      key={slot.time}
                      onClick={() => {
                        if (isFull) {
                          setErrorMsg("This slot is full. Join the waitlist to be notified.");
                          return;
                        }
                        handleSlotClick(activeDate, slot.time);
                      }}
                      disabled={disabled}
                      data-testid={`slot-${slot.time.replace(/[:\s]/g, "-")}`}
                      className={`group relative flex flex-col items-center justify-center rounded-2xl px-3 py-5 text-center transition-all
                        ${isCurrentlyProcessing
                          ? "cursor-wait bg-white/10 ring-1 ring-white/30"
                          : isFull
                            ? "cursor-pointer bg-[#2a2a2c]/50 hover:bg-[#2a2a2c]/70"
                            : "cursor-pointer bg-[#2a2a2c] hover:bg-[#333335] hover:ring-1 hover:ring-white/20"
                        }
                        ${disabled && !isCurrentlyProcessing ? "opacity-60" : ""}
                      `}
                    >
                      {isCurrentlyProcessing ? (
                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                      ) : (
                        <>
                          <span className={`text-lg font-semibold ${isFull ? "text-zinc-600" : "text-white"}`}>
                            {slot.time}
                          </span>

                          <span
                            className={`mt-2 rounded-full px-2.5 py-0.5 text-[11px] font-medium
                              ${isFull
                                ? "bg-amber-500/10 text-amber-500"
                                : slot.availableSlotsLeft <= 1
                                  ? "bg-red-500/10 text-red-400"
                                  : "bg-emerald-500/10 text-emerald-400"
                              }`}
                          >
                            {isFull
                              ? "Join Waitlist"
                              : `${slot.availableSlotsLeft} Spot${slot.availableSlotsLeft > 1 ? "s" : ""} Open`
                            }
                          </span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
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
