"use client";

import { useState, Suspense, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Zap, RefreshCw, Loader2 } from "lucide-react";
import { load } from "@cashfreepayments/cashfree-js";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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

    const loadData = async () => {
      try {
        const res = await fetch(`/api/bookings/available/slots?${params}`, { cache: "no-store" });
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

    loadData();
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
    <div className={`flex min-h-dvh w-full justify-center bg-zinc-50 ${jakarta.className}`}>
      {/* Desktop-Constrained Mobile View */}
      <div className="relative flex min-h-dvh w-full max-w-[480px] flex-col bg-white sm:border-x sm:border-gray-100 sm:shadow-[0_0_40px_rgba(0,0,0,0.03)] px-6 pt-10 pb-8">
        
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-600 shadow-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            Live Now
          </div>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-zinc-900">Book a Chat</h1>
          <p className="mt-2 text-base font-medium text-zinc-500">Connect via Instagram DMs for just ₹9</p>
        </div>

        {/* Loading Skeleton */}
        {state === "loading" && (
          <div className="mt-10 grid grid-cols-2 gap-3" data-testid="skeleton-loader">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-zinc-100 p-6">
                <div className="mx-auto mb-3 h-5 w-20 rounded bg-zinc-200" />
                <div className="mx-auto h-4 w-24 rounded bg-zinc-200" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {state === "error" && (
          <div className="mt-20 flex flex-col items-center gap-4 text-center">
            <p className="text-zinc-500">Unable to load current slots. Please refresh to try again.</p>
            <button
              onClick={() => { setState("loading"); setRetry((c) => c + 1); }}
              className="flex items-center gap-2 rounded-2xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 active:scale-95"
            >
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        )}

        {/* Payment Error Toast */}
        {errorMsg && (
          <div className="fixed inset-x-0 bottom-8 z-50 mx-auto flex w-full max-w-[400px] items-center justify-center px-6">
            <div className="w-full rounded-2xl bg-red-50 border border-red-100 px-5 py-4 text-center text-sm font-medium text-red-600 shadow-xl">
              {errorMsg}
            </div>
          </div>
        )}

        {/* Ready State */}
        {state === "success" && data && (
          <>
            {/* Hero Banner for Earliest Slot */}
            {earliest && (
              <button
                onClick={() => handleSlotClick(earliest.date, earliest.time)}
                disabled={isProcessing}
                className="group mt-8 w-full rounded-3xl bg-linear-to-br from-emerald-50 to-teal-50/50 border border-emerald-100 p-5 text-left transition-all hover:shadow-md hover:border-emerald-200 disabled:opacity-50 active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm border border-emerald-50">
                    <Zap size={22} className="text-emerald-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[15px] font-bold text-emerald-950">
                      Next Live Session{" "}
                      <span className="text-emerald-600">
                        • {earliest.date === dateTabs[0]?.date ? "Today" : "Tomorrow"} at {earliest.time}
                      </span>
                    </p>
                    <p className="mt-1 text-sm font-medium text-emerald-700/70 group-hover:text-emerald-700 transition-colors">
                      Secure your spot now →
                    </p>
                  </div>
                </div>
              </button>
            )}

            {/* Date Tabs */}
            <div className="mt-8 flex gap-2">
              {dateTabs.map((tab) => {
                const active = activeDate === tab.date;
                const hasSlots = (data.scheduleByDate[tab.date] ?? []).some((s) => s.isAvailable);
                return (
                  <button
                    key={tab.date}
                    onClick={() => setActiveDate(tab.date)}
                    disabled={!hasSlots || isProcessing}
                    className={`flex-1 rounded-2xl px-3 py-3 text-center text-[13px] sm:text-sm font-semibold transition-all
                      ${active
                        ? "bg-zinc-900 text-white shadow-md"
                        : hasSlots
                          ? "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                          : "cursor-not-allowed bg-zinc-50 text-zinc-400 opacity-60"
                      }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Slot Grid */}
            <div className="mt-6 pb-12">
              {currentSlots.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="h-12 w-12 rounded-full bg-zinc-100 mb-4" />
                  <p className="text-sm font-medium text-zinc-500">No slots available this day</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3" data-testid="slot-grid">
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
                      className={`group relative flex flex-col items-center justify-center rounded-2xl px-3 py-5 text-center transition-all border
                        ${isCurrentlyProcessing
                          ? "cursor-wait bg-zinc-50 border-zinc-200"
                          : isFull
                            ? "cursor-pointer bg-zinc-50 border-transparent hover:bg-zinc-100"
                            : "cursor-pointer bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-sm active:scale-95"
                        }
                        ${disabled && !isCurrentlyProcessing ? "opacity-70" : ""}
                      `}
                    >
                      {isCurrentlyProcessing ? (
                        <Loader2 className="h-6 w-6 animate-spin text-zinc-900" />
                      ) : (
                        <>
                          <span className={`text-lg font-bold tracking-tight ${isFull ? "text-zinc-400" : "text-zinc-900"}`}>
                            {slot.time}
                          </span>

                          <span
                            className={`mt-2 rounded-full px-3 py-1 text-[11px] font-bold tracking-wide uppercase
                              ${isFull
                                ? "bg-amber-50 text-amber-600 border border-amber-100/50"
                                : slot.availableSlotsLeft <= 1
                                  ? "bg-red-50 text-red-600 border border-red-100/50"
                                  : "bg-emerald-50 text-emerald-600 border border-emerald-100/50"
                              }`}
                          >
                            {isFull
                              ? "Waitlist"
                              : `${slot.availableSlotsLeft} Spot${slot.availableSlotsLeft > 1 ? "s" : ""}`
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
    <Suspense fallback={<div className="min-h-screen bg-zinc-50" />}>
      <SchedulePage />
    </Suspense>
  );
}